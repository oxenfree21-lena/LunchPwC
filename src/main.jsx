import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import NaverMap from './NaverMap';
import RestaurantSheet, { INITIAL_SHEET_HEIGHT } from './RestaurantSheet';
import { restaurants } from './data/restaurants';
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

function ExploreSearch() {
  return (
    <div className="explore-search">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="10.75" cy="10.75" r="6.75" />
        <path d="m16 16 4.5 4.5" />
      </svg>
      <input
        type="search"
        aria-label="맛집 또는 메뉴 검색 (준비 중)"
        placeholder="맛집이나 메뉴를 찾아보세요"
        readOnly
      />
    </div>
  );
}

function ExploreView() {
  const [sheetHeight, setSheetHeight] = useState(INITIAL_SHEET_HEIGHT);
  return (
    <div className="explore-view" style={{ '--sheet-height': `${sheetHeight}px` }}>
      <NaverMap places={restaurants} />
      <ExploreSearch />
      <RestaurantSheet onHeightChange={setSheetHeight} places={restaurants} />
    </div>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('explore');
  const currentTab = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="app-shell">
      <main className={`placeholder${activeTab === 'explore' ? ' explore-screen' : ''}`} id="main-content" aria-labelledby="page-title">
        <h1 id="page-title" className={activeTab === 'explore' ? 'visually-hidden' : undefined} aria-live="polite">{currentTab.label}</h1>
        {activeTab === 'explore' && <ExploreView />}
      </main>
      <nav className="navigation" aria-label="주 메뉴">
        {tabs.map(({ id, label, icon: Icon }) => {
          const selected = activeTab === id;
          return (
            <button
              key={id}
              className={`nav-item${selected ? ' is-selected' : ''}`}
              type="button"
              aria-current={selected ? 'page' : undefined}
              onClick={() => setActiveTab(id)}
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
