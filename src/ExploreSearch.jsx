import React, { useEffect, useRef, useState } from 'react';
import { restaurantDetails, distanceInMeters, formatDistance } from './data/restaurantDetails';
import { searchRestaurants } from './lib/restaurantSearch';

const popularTerms = ['쌤쌤쌤', '고기국수', '파스타', '뼈탄집', '한식'];

export default function ExploreSearch({ places, onSelect, suspended = false }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const container = useRef(null);
  const input = useRef(null);
  const panel = useRef(null);
  const results = searchRestaurants(places, restaurantDetails, query);
  const searching = Boolean(query.trim());

  useEffect(() => {
    if (!open || suspended) return;
    const dismiss = event => {
      if (event.target.closest?.('.restaurant-detail')) return;
      if (!container.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open, suspended]);

  function close() {
    setOpen(false);
    input.current?.blur();
  }

  return <div className="explore-search-container" ref={container} onKeyDown={event => {
    if (event.key === 'Escape') { event.stopPropagation(); close(); }
  }}>
    <form className="explore-search" role="search" aria-label="등록된 식당 검색" onSubmit={event => {
      event.preventDefault();
      setOpen(true);
      input.current?.blur();
    }}>
      <button type="submit" className="search-submit" aria-label="검색">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.75" cy="10.75" r="6.75" /><path d="m16 16 4.5 4.5" /></svg>
      </button>
      <input ref={input} type="search" aria-label="맛집 또는 메뉴 검색" placeholder="맛집이나 메뉴를 찾아보세요"
        value={query} maxLength={80} autoComplete="off" enterKeyHint="search" aria-expanded={open} aria-controls="restaurant-search-panel"
        onFocus={() => setOpen(true)} onClick={() => setOpen(true)}
        onChange={event => { setQuery(event.target.value); setOpen(true); }}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' && open) { event.preventDefault(); panel.current?.querySelector('button')?.focus(); }
        }} />
      {query && <button type="button" className="search-clear" aria-label="검색어 지우기" onClick={() => { setQuery(''); input.current?.focus(); }}>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17" /></svg>
      </button>}
      {open && <button type="button" className="search-close" onClick={close}>닫기</button>}
    </form>
    {open && <section className="restaurant-search-panel" id="restaurant-search-panel" aria-label={searching ? '식당 검색 결과' : '인기 검색어'} ref={panel}>
      <header className="search-panel-heading">
        <h2>{searching ? '검색 결과' : '실시간 인기 검색어'}</h2>
        {searching ? <span role="status">{results.length}곳</span> : <span className="search-demo-badge">데모</span>}
      </header>
      {searching ? results.length > 0 ? <ul className="search-results">
        {results.map(place => {
          const details = restaurantDetails[place.id] ?? {};
          return <li key={place.id}><button type="button" onClick={() => onSelect(place)} aria-label={`${place.name} 검색 결과 상세 보기`}>
            <span className="search-result-top"><strong>{place.name}</strong><span className="search-result-rating">★ {place.rating.toFixed(1)}</span></span>
            <span className="search-result-meta">{details.category || '종류 확인 중'}<span>{formatDistance(distanceInMeters(place))}</span></span>
            {details.menu && <span className="search-result-menu">{details.menu}</span>}
          </button></li>;
        })}
      </ul> : <div className="search-empty"><p>검색 결과가 없어요</p><span>다른 식당 이름이나 메뉴로 검색해보세요</span></div>
        : <ol className="search-popular">{popularTerms.map((term, index) => <li key={term}>
          <button type="button" onClick={() => { setQuery(term); input.current?.focus(); }}><span>{index + 1}</span><strong>{term}</strong><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M7 17 17 7M7 7h10v10" /></svg></button>
        </li>)}</ol>}
    </section>}
  </div>;
}
