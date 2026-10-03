import React, { useCallback, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import NaverMap from './NaverMap';
import RestaurantSheet, { INITIAL_SHEET_HEIGHT } from './RestaurantSheet';
import RestaurantDetail from './RestaurantDetail';
import CreatePod from './CreatePod';
import PodsPage from './PodsPage';
import MyPage from './MyPage';
import ExploreSearch from './ExploreSearch';
import { restaurants } from './data/restaurants';
import { readFavorites, toggleFavorite, useLocalActivity } from './data/localActivity';
import './styles.css';

const tabs = [
  { id: 'explore', label: '지도', icon: MapIcon },
  { id: 'mates', label: '팟', icon: PeopleIcon },
  { id: 'more', label: '마이', icon: ProfileIcon },
];

function MapIcon({ selected }) {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true">
      <path
        d="m3.5 7 7-3 7 3 7-3v17l-7 3-7-3-7 3V7Z"
        fill={selected ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinejoin="round"
      />
      <path d="M10.5 4v17m7-14v17" stroke={selected ? '#fff' : 'currentColor'} strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

function PeopleIcon({ selected }) {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true" fill={selected ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10.5" cy="8" r="4" />
      <path d="M3 23v-2.5a7.5 7.5 0 0 1 15 0V23H3Z" />
      <path d="M19 4.2a4 4 0 0 1 0 7.6M21.5 15a6 6 0 0 1 3.5 5.5V23h-3" fill="none" />
    </svg>
  );
}

function ProfileIcon({ selected }) {
  return (
    <svg viewBox="0 0 28 28" aria-hidden="true" fill={selected ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="14" cy="8" r="4.5" />
      <path d="M5 24v-2a9 9 0 0 1 18 0v2H5Z" />
    </svg>
  );
}

function ExploreView({ onCreatePod, initialPlace = null }) {
  const [sheetHeight, setSheetHeight] = useState(INITIAL_SHEET_HEIGHT);
  const [selectedPlace, setSelectedPlace] = useState(initialPlace);
  useLocalActivity();
  const favorites = readFavorites();
  const previousFocus = useRef(null);
  const selectPlace = useCallback(place => {
    previousFocus.current = document.activeElement;
    setSelectedPlace(place);
  }, []);
  function closeDetail() {
    setSelectedPlace(null);
    requestAnimationFrame(() => previousFocus.current?.focus({ preventScroll: true }));
  }
  return (
    <div className={`explore-view${selectedPlace ? ' has-detail' : ''}`} style={{ '--sheet-height': `${sheetHeight}px` }}>
      <NaverMap places={restaurants} onSelect={selectPlace} />
      <div className="explore-list-view" inert={Boolean(selectedPlace)}>
        <ExploreSearch places={restaurants} onSelect={selectPlace} suspended={Boolean(selectedPlace)} />
        <RestaurantSheet onHeightChange={setSheetHeight} places={restaurants} onSelect={selectPlace} />
      </div>
      {selectedPlace && <RestaurantDetail key={selectedPlace.id} place={selectedPlace} onBack={closeDetail}
        onCreatePod={onCreatePod}
        favorite={favorites.has(selectedPlace.id)} onToggleFavorite={() => toggleFavorite(selectedPlace.id)} />}
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('explore');
  const [podEntry, setPodEntry] = useState(null);
  const [podsVersion, setPodsVersion] = useState(0);
  const [detailEntry, setDetailEntry] = useState(null);
  const podTrigger = useRef(null);
  function openCreatePod(place = null) {
    podTrigger.current = document.activeElement;
    setPodEntry({ place });
  }
  function closeCreatePod() {
    setPodEntry(null);
    requestAnimationFrame(() => podTrigger.current?.focus({ preventScroll: true }));
  }
  function completeCreatePod() {
    setPodEntry(null);
    setActiveTab('mates');
    requestAnimationFrame(() => document.getElementById('pods-heading')?.focus());
  }
  const currentTab = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="app-shell">
      <main inert={Boolean(podEntry)} className={`placeholder${activeTab === 'explore' ? ' explore-screen' : activeTab === 'mates' ? ' mates-screen' : ' my-screen'}`} id="main-content" aria-labelledby="page-title">
        <h1 id="page-title" className="visually-hidden" aria-live="polite">{currentTab.label}</h1>
        {activeTab === 'explore' && <ExploreView onCreatePod={openCreatePod} initialPlace={detailEntry} />}
        {activeTab === 'mates' && <PodsPage key={podsVersion} onCreatePod={() => openCreatePod()} />}
        {activeTab === 'more' && <MyPage onSelectRestaurant={place => { setDetailEntry(place); setActiveTab('explore'); }} />}
      </main>
      {podEntry && <CreatePod initialPlace={podEntry.place} places={restaurants} onClose={closeCreatePod} onCreated={() => setPodsVersion(value => value + 1)} onComplete={completeCreatePod} />}
      <nav className="navigation" aria-label="주 메뉴">
        {tabs.map(({ id, label, icon: Icon }) => {
          const selected = activeTab === id;
          return (
            <button
              key={id}
              className={`nav-item${selected ? ' is-selected' : ''}`}
              type="button"
              aria-current={selected ? 'page' : undefined}
              onClick={() => { setPodEntry(null); setDetailEntry(null); setActiveTab(id); }}
            >
              <Icon selected={selected} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>,
);
