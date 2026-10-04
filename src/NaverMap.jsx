import React, { useEffect, useMemo, useRef, useState } from 'react';
import { loadNaverMaps } from './lib/naverMaps';
import { layoutMapLabels } from './lib/mapLabels';

// 신용산역 중심. 역에서 동서남북 약 1km의 영역을 탐색 범위로 사용합니다.
const STATION = { lat: 37.52917, lng: 126.96783 };
const LAT_RADIUS = 1000 / 111320;
const LNG_RADIUS = LAT_RADIUS / Math.cos(STATION.lat * Math.PI / 180);
const AREA = {
  south: STATION.lat - LAT_RADIUS,
  north: STATION.lat + LAT_RADIUS,
  west: STATION.lng - LNG_RADIUS,
  east: STATION.lng + LNG_RADIUS,
};
const MAX_ZOOM = 20;
const EMPTY_PLACES = [];

function minimumZoom(width, height) {
  // Keep the viewport within the local area on phones and wide desktop screens.
  const metersPerPixelAtZoomZero = 156543.03392 * Math.cos(STATION.lat * Math.PI / 180);
  return Math.min(MAX_ZOOM, Math.max(15, Math.ceil(Math.log2(metersPerPixelAtZoomZero * Math.max(width, height) / 1800))));
}

// `boundsPlaces` fixes the map area so filtering markers does not rebuild the map.
export default function NaverMap({ places = EMPTY_PLACES, boundsPlaces = places, onSelect }) {
  const container = useRef(null);
  const mapRef = useRef(null);
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const [zoom, setZoom] = useState(17);
  const [minZoom, setMinZoom] = useState(16);
  const [showControls, setShowControls] = useState(true);
  const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID?.trim();
  const area = useMemo(() => boundsPlaces.reduce((bounds, place) => ({
    south: Math.min(bounds.south, place.lat - LAT_RADIUS * .25),
    north: Math.max(bounds.north, place.lat + LAT_RADIUS * .25),
    west: Math.min(bounds.west, place.lng - LNG_RADIUS * .25),
    east: Math.max(bounds.east, place.lng + LNG_RADIUS * .25),
  }), { ...AREA }), [boundsPlaces]);

  useEffect(() => {
    if (!clientId) { setStatus('missing-key'); return; }
    let disposed = false;
    let map;
    let observer;
    let frame;
    const authFailure = () => { if (!disposed) setStatus('auth'); };
    window.addEventListener('naver-map-auth-error', authFailure);
    setStatus('loading');

    loadNaverMaps(clientId).then((maps) => {
      if (disposed) return;
      const element = container.current;
      const minimum = minimumZoom(element.clientWidth, element.clientHeight);
      map = new maps.Map(element, {
        center: new maps.LatLng(STATION.lat, STATION.lng),
        zoom: minimum,
        minZoom: minimum,
        maxZoom: MAX_ZOOM,
        maxBounds: new maps.LatLngBounds(
          new maps.LatLng(area.south, area.west),
          new maps.LatLng(area.north, area.east),
        ),
        // React renders the zoom controls; keep provider attribution visible.
        zoomControl: false,
        mapTypeControl: false,
        logoControl: true,
        mapDataControl: true,
        scaleControl: true,
        disableKineticPan: true,
      });
      mapRef.current = map;
      setMinZoom(minimum);
      setZoom(map.getZoom());

      // maxBounds limits the center. This additionally keeps viewport edges local.
      function keepInsideArea() {
        const bounds = map.getBounds();
        const center = map.getCenter();
        const southWest = bounds.getSW();
        const northEast = bounds.getNE();
        const minLat = area.south + (center.lat() - southWest.lat());
        const maxLat = area.north - (northEast.lat() - center.lat());
        const minLng = area.west + (center.lng() - southWest.lng());
        const maxLng = area.east - (northEast.lng() - center.lng());
        const lat = minLat > maxLat ? STATION.lat : Math.max(minLat, Math.min(maxLat, center.lat()));
        const lng = minLng > maxLng ? STATION.lng : Math.max(minLng, Math.min(maxLng, center.lng()));
        if (Math.abs(lat - center.lat()) > 0.0000001 || Math.abs(lng - center.lng()) > 0.0000001) {
          map.setCenter(new maps.LatLng(lat, lng));
        }
      }
      maps.Event.addListener(map, 'idle', keepInsideArea);
      maps.Event.addListener(map, 'zoom_changed', () => setZoom(map.getZoom()));
      observer = new ResizeObserver(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          if (disposed) return;
          const width = element.parentElement.clientWidth, height = element.parentElement.clientHeight;
          if (!width || !height) return;
          const nextMinimum = minimumZoom(width, height);
          map.setSize(new maps.Size(width, height));
          map.setOptions('minZoom', nextMinimum);
          if (map.getZoom() < nextMinimum) map.setZoom(nextMinimum);
          setMinZoom(nextMinimum);
          setShowControls(height >= 240);
          keepInsideArea();
        });
      });
      observer.observe(element.parentElement);
      setStatus('ready');
    }).catch((error) => {
      if (!disposed) {
        console.error('Naver Maps initialization failed:', error.message);
        setStatus(error.message === 'auth' ? 'auth' : 'network');
      }
    });

    return () => {
      disposed = true;
      window.removeEventListener('naver-map-auth-error', authFailure);
      observer?.disconnect();
      cancelAnimationFrame(frame);
      map?.destroy();
      mapRef.current = null;
    };
  }, [clientId, attempt, area]);

  useEffect(() => {
    if (status !== 'ready' || !mapRef.current) return;
    const maps = window.naver.maps;
    const labels = [];
    const markers = places.map(place => {
      const content = document.createElement('div');
      content.className = 'restaurant-marker';
      content.dataset.restaurantId = place.id;
      const dot = document.createElement('span');
      dot.className = 'restaurant-marker-dot';
      const label = document.createElement('button');
      label.type = 'button';
      label.setAttribute('aria-label', `${place.name} 상세 보기, 별점 ${place.rating.toFixed(1)}점`);
      label.addEventListener('pointerdown', event => event.stopPropagation());
      label.addEventListener('click', event => {
        event.stopPropagation();
        onSelect?.(place);
      });
      label.className = 'restaurant-marker-label';
      const name = document.createElement('span');
      name.className = 'restaurant-marker-name';
      name.textContent = place.name;
      const rating = document.createElement('span');
      rating.className = 'restaurant-marker-rating';
      rating.textContent = `★ ${place.rating.toFixed(1)}`;
      label.append(name, rating);
      content.append(dot, label);
      labels.push({ content, label, place });
      return new maps.Marker({
        map: mapRef.current,
        position: new maps.LatLng(place.lat, place.lng),
        title: place.name,
        clickable: false,
        icon: { content, size: new maps.Size(12, 12), anchor: new maps.Point(6, 6) },
      });
    });
    // Keep every dot; show only labels that have room at the current zoom.
    function arrangeLabels() {
      const viewport = container.current.getBoundingClientRect();
      const points = labels.map(({ content, label, place }) => {
        const rect = content.getBoundingClientRect();
        return { id: place.id, rating: place.rating, x: rect.x + 6, y: rect.y + 6,
          width: label.offsetWidth, height: label.offsetHeight };
      });
      const obstacles = [...container.current.closest('.explore-view').querySelectorAll('.explore-search, .restaurant-sheet, .map-tools')]
        .map(element => {
          const rect = element.getBoundingClientRect();
          return { x: rect.x - 4, y: rect.y - 4, width: rect.width + 8, height: rect.height + 8 };
        });
      const positions = layoutMapLabels(points, viewport, obstacles);
      labels.forEach(({ label, place }) => {
        const position = positions.get(place.id);
        label.style.visibility = position ? 'visible' : 'hidden';
        if (!position) return;
        label.style.left = `${position.left}px`;
        label.style.top = `${position.top}px`;
      });
    }
    let frame = requestAnimationFrame(arrangeLabels);
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(arrangeLabels);
    };
    const listeners = ['idle', 'bounds_changed'].map(event => maps.Event.addListener(mapRef.current, event, schedule));
    return () => {
      cancelAnimationFrame(frame);
      listeners.forEach(listener => maps.Event.removeListener(listener));
      markers.forEach(marker => marker.setMap(null));
    };
  }, [places, status, onSelect]);

  function changeZoom(delta) {
    const map = mapRef.current;
    if (map) map.setZoom(Math.max(minZoom, Math.min(MAX_ZOOM, map.getZoom() + delta)), true);
  }

  return (
    <div className="map-layer">
      <div ref={container} className="naver-map" role="region" aria-label="신용산역 주변 지도" />
      {status !== 'ready' && <div className="map-message" role="status">
        <p>{status === 'loading' ? '지도를 불러오는 중이에요' : '지도를 불러오지 못했어요'}</p>
        {status === 'auth' && <span>지도 서비스 연결 설정을 확인해주세요.</span>}
        {status === 'missing-key' && <span>지도 연결을 준비하고 있어요.</span>}
        {status === 'network' && <button onClick={() => setAttempt(value => value + 1)}>다시 시도</button>}
      </div>}
      {status === 'ready' && showControls && <div className="map-tools">
        <button className="map-recenter" aria-label="신용산역으로 이동" onClick={() => mapRef.current?.panTo(new window.naver.maps.LatLng(STATION.lat, STATION.lng))}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="12" cy="12" r="6.5"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/></svg>
        </button>
        <div className="map-zoom">
          <button aria-label="지도 확대" disabled={zoom >= MAX_ZOOM} onClick={() => changeZoom(1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M12 5v14"/></svg></button>
          <button aria-label="지도 축소" disabled={zoom <= minZoom} onClick={() => changeZoom(-1)}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg></button>
        </div>
      </div>}
    </div>
  );
}
