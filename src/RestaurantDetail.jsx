import React, { useEffect, useRef, useState } from 'react';
import { PhotoSlots } from './RestaurantList';
import ReviewSheet from './ReviewSheet';
import { readReviews, saveReview, useLocalActivity, withMyReviews } from './data/localActivity';
import { restaurantReviews } from './data/restaurantReviews';
import { demoDisclaimer, restaurantDetails, distanceInMeters, formatDistance, formatPrice } from './data/restaurantDetails';

const tabs = ['메뉴', '리뷰', '정보'];
const VISIBLE_REVIEWS = 4;

function Stars({ rating }) {
  return <div className="review-stars" role="img" aria-label={`${rating}점`}>
    <span className="review-stars-fill" style={{ width: `${rating / 5 * 100}%` }} aria-hidden="true">★★★★★</span>
    <span aria-hidden="true">★★★★★</span>
  </div>;
}

export default function RestaurantDetail({ place: selectedPlace, onBack, favorite, onToggleFavorite, onCreatePod }) {
  const [activeTab, setActiveTab] = useState('메뉴');
  const [writing, setWriting] = useState(false);
  useLocalActivity();
  const place = withMyReviews(selectedPlace);
  const myReviews = readReviews(place.id);
  const [favoriteError, setFavoriteError] = useState('');
  const reviewCount = place.reviewCount;
  const reviews = [...myReviews, ...(restaurantReviews[place.id] ?? [])].slice(0, VISIBLE_REVIEWS);
  const backButton = useRef(null);
  const details = restaurantDetails[place.id] ?? {};
  const distance = formatDistance(distanceInMeters(place));

  useEffect(() => { backButton.current?.focus({ preventScroll: true }); }, []);

  function selectTab(tab) {
    setActiveTab(tab);
    setWriting(false);
  }

  return <section className="restaurant-detail" aria-labelledby="detail-name" onKeyDown={event => {
    if (event.key === 'Escape') { if (writing) setWriting(false); else onBack(); }
  }}>
    <header className="detail-toolbar">
      <button ref={backButton} type="button" className="detail-back" aria-label="식당 목록으로 돌아가기" onClick={onBack}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m14 5-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <span>식당 정보</span>
    </header>
    <div className="detail-scroll">
      <div className="detail-summary">
        <p className="detail-category">{details.category ?? '종류 확인 중'}</p>
        <h2 id="detail-name">{place.name}</h2>
        <div className="detail-meta">
          <span className="detail-rating"><span aria-hidden="true">★</span> {place.rating.toFixed(1)}</span>
          <span>리뷰 {reviewCount}</span>
          <span className="detail-distance">{distance}</span>
          <button type="button" className={`detail-heart${favorite ? ' is-saved' : ''}`} aria-label="찜하기" aria-pressed={favorite} onClick={() => {
            try { onToggleFavorite(); setFavoriteError(''); }
            catch { setFavoriteError('찜을 저장하지 못했어요. 다시 시도해주세요.'); }
          }}>
            <svg viewBox="0 0 24 24" fill={favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M20.5 4.8a5 5 0 0 0-7.1 0L12 6.2l-1.4-1.4a5 5 0 0 0-7.1 7.1L12 20l8.5-8.1a5 5 0 0 0 0-7.1Z" strokeLinejoin="round" /></svg>
          </button>
        </div>
        {favoriteError && <p className="pod-error" role="alert">{favoriteError}</p>}
        <PhotoSlots id={place.id} name={place.name} />
        <div className="detail-actions">
          <button type="button" className="detail-create-pod" onClick={() => onCreatePod(place)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M12 5v14M5 12h14" strokeLinecap="round" /></svg>
            팟 만들기
          </button>
          <button type="button" className="detail-write" onClick={() => setWriting(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m15 5 4 4M4 20l4-1 12-12a2.8 2.8 0 0 0-4-4L4 15l-1 6M13 21h8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            리뷰 쓰기
          </button>
        </div>
      </div>
      <div className="detail-tabs" role="tablist" aria-label="식당 상세 정보">
        {tabs.map((tab, index) => <button key={tab} type="button" role="tab" id={`detail-tab-${index}`} aria-selected={activeTab === tab}
          aria-controls="detail-tab-panel" tabIndex={activeTab === tab ? 0 : -1} onClick={() => selectTab(tab)}
          onKeyDown={event => {
            if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
            event.preventDefault();
            const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 : (index + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
            selectTab(tabs[next]);
            event.currentTarget.parentElement.children[next].focus();
          }}>{tab}{tab === '리뷰' && <span>{reviewCount}</span>}</button>)}
      </div>
      <div className="detail-panel" id="detail-tab-panel" role="tabpanel" aria-labelledby={`detail-tab-${tabs.indexOf(activeTab)}`}>
        {activeTab === '메뉴' && (details.menus?.length ? <ul className="detail-menu">
          {details.menus.map(item => <li key={item.name}>
            <span>{item.name}{item.signature && <small>대표</small>}</span>
            <span className="detail-menu-price">{item.price.toLocaleString('ko-KR')}원</span>
          </li>)}
        </ul> : <div className="detail-empty">메뉴 준비 중</div>)}
        {activeTab === '리뷰' && reviews.map((review, index) => <article className="detail-review" key={review.id ?? index}>
            <div className="review-author"><span className="review-avatar" aria-hidden="true">{review.author.slice(0, 1)}</span><strong>{review.author}</strong></div>
            <Stars rating={review.rating} />
            {review.menu && <div className="review-menu-name">{review.menu}</div>}
            <p>{review.review}</p>
            {review.tags?.length > 0 && <div className="review-selected-tags">{review.tags.map(tag => <span key={tag}>{tag}</span>)}</div>}
          </article>
        )}
        {/* Placeholder until the full review list exists; intentionally does nothing. */}
        {activeTab === '리뷰' && reviewCount > reviews.length && <button type="button" className="detail-more-reviews">리뷰 더보기</button>}
        {activeTab === '정보' && <dl className="detail-info">
          <div><dt>분류</dt><dd>{details.category ?? '확인 중'}</dd></div>
          <div><dt>가격대</dt><dd>{formatPrice(details)}</dd></div>
          <div><dt>거리</dt><dd>{distance}</dd></div>
          <div><dt>주소</dt><dd className={details.address ? undefined : 'info-pending'}>{details.address ?? '준비 중'}</dd></div>
          <div><dt>영업시간</dt><dd className={details.hours ? undefined : 'info-pending'}>{details.hours ?? '준비 중'}</dd></div>
        </dl>}
        <p className="detail-disclaimer">{demoDisclaimer}</p>
      </div>
    </div>
    {writing && <ReviewSheet name={place.name} onClose={() => setWriting(false)} onSubmit={review => {
      saveReview(place.id, review);
      setActiveTab('리뷰');
      setWriting(false);
    }} />}
  </section>;
}
