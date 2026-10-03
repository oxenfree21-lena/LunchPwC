import React, { useEffect, useRef, useState } from 'react';
import RestaurantList from './RestaurantList';

const COLLAPSED_HEIGHT = 80;
export const INITIAL_SHEET_HEIGHT = 360;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export default function RestaurantSheet({ onHeightChange, places, onSelect }) {
  const sheetRef = useRef(null);
  const gesture = useRef(null);
  const suppressClick = useRef(false);
  const snapIndex = useRef(1);
  const heightRef = useRef(INITIAL_SHEET_HEIGHT);
  const stops = useRef([COLLAPSED_HEIGHT, 300, 600]);
  const [height, setHeight] = useState(INITIAL_SHEET_HEIGHT);
  const [dragging, setDragging] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 768px)').matches);

  function updateHeight(value) {
    heightRef.current = value;
    setHeight(value);
    onHeightChange(value);
  }

  function snapTo(index) {
    snapIndex.current = clamp(index, 0, stops.current.length - 1);
    updateHeight(stops.current[snapIndex.current]);
  }

  useEffect(() => {
    const parent = sheetRef.current.parentElement;
    const desktop = window.matchMedia('(min-width: 768px)');
    function resize() {
      setIsDesktop(desktop.matches);
      gesture.current = null;
      setDragging(false);
      if (desktop.matches) return;
      // Leave the floating search bar accessible even when fully expanded.
      const max = Math.max(COLLAPSED_HEIGHT, parent.clientHeight - 104);
      stops.current = [COLLAPSED_HEIGHT, Math.max(COLLAPSED_HEIGHT, Math.min(380, max * 0.6)), max];
      snapTo(snapIndex.current);
    }
    const observer = new ResizeObserver(resize);
    observer.observe(parent);
    desktop.addEventListener('change', resize);
    return () => {
      observer.disconnect();
      desktop.removeEventListener('change', resize);
    };
  }, [onHeightChange]);

  function startDrag(event) {
    if (!event.isPrimary || event.button !== 0) return;
    suppressClick.current = false;
    gesture.current = { pointerId: event.pointerId, y: event.clientY, height: heightRef.current, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  }

  function moveDrag(event) {
    const active = gesture.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const distance = active.y - event.clientY;
    if (Math.abs(distance) > 5) active.moved = true;
    if (active.moved) updateHeight(clamp(active.height + distance, stops.current[0], stops.current[2]));
  }

  function finishDrag(event, cancelled = false) {
    const active = gesture.current;
    if (!active || active.pointerId !== event.pointerId) return;
    gesture.current = null;
    setDragging(false);
    suppressClick.current = active.moved;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (cancelled) { snapTo(snapIndex.current); return; }
    if (!active.moved) return; // The following click toggles the sheet.
    const delta = active.y - event.clientY;
    const nearest = stops.current.reduce((best, value, index) => Math.abs(value - heightRef.current) < Math.abs(stops.current[best] - heightRef.current) ? index : best, 0);
    // A short deliberate pull advances one stop, while a long pull can skip stops.
    const target = nearest === snapIndex.current && Math.abs(delta) > 32
      ? snapIndex.current + Math.sign(delta)
      : nearest;
    snapTo(target);
  }

  return (
    <section
      ref={sheetRef}
      className={`restaurant-sheet${dragging ? ' is-dragging' : ''}`}
      style={{ '--mobile-sheet-height': `${height}px` }}
      aria-label="식당 목록"
    >
      <button
        type="button"
        className="sheet-handle"
        aria-label={height > COLLAPSED_HEIGHT ? '식당 목록 접기' : '식당 목록 펼치기'}
        aria-expanded={height > COLLAPSED_HEIGHT}
        aria-controls="restaurant-sheet-content"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={finishDrag}
        onPointerCancel={event => finishDrag(event, true)}
        onLostPointerCapture={event => finishDrag(event, true)}
        onClick={event => {
          if (suppressClick.current && event.detail !== 0) { suppressClick.current = false; return; }
          snapTo(snapIndex.current === 0 ? 1 : 0);
        }}
        onKeyDown={event => {
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            snapTo(snapIndex.current + (event.key === 'ArrowUp' ? 1 : -1));
          } else if (event.key === 'Escape') snapTo(0);
        }}
      >
        <span aria-hidden="true" />
      </button>
      <header className="restaurant-sheet-header">
        <h2>주변 식당 <span>{places.length}</span></h2>
      </header>
      <div id="restaurant-sheet-content" className="sheet-content" inert={!isDesktop && height <= COLLAPSED_HEIGHT}>
        <RestaurantList places={places} onSelect={onSelect} />
      </div>
    </section>
  );
}
