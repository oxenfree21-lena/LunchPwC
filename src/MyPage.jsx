import React, { useState } from 'react';
import { formatPodDate } from './data/pods';
import { restaurants } from './data/restaurants';
import { restaurantDetails } from './data/restaurantDetails';
import { cancelCreatedPod, cancelParticipation, readFavorites, readReviews, readUpcomingAppointments, toggleFavorite, useLocalActivity, participationKey, withMyReviews } from './data/localActivity';
import { myProfile } from './data/profile';
import PodConfirmation from './PodConfirmation';
import PodCancelFlow from './PodCancelFlow';

function MyIcon({ type }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {type === 'heart' ? <path d="M20.5 4.8a5 5 0 0 0-7.1 0L12 6.2l-1.4-1.4a5 5 0 0 0-7.1 7.1L12 20l8.5-8.1a5 5 0 0 0 0-7.1Z" />
      : type === 'review' ? <><path d="M14 4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-8M12 15l1-4 7-7a2.1 2.1 0 0 1 3 3l-7 7-4 1Z" /></>
        : type === 'time' ? <><circle cx="12" cy="12" r="8" /><path d="M12 7v5l3 2" /></>
          : type === 'place' ? <><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2" /></>
            : <><circle cx="9" cy="8" r="3" /><path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v2" /></>}
  </svg>;
}

export default function MyPage({ onSelectRestaurant }) {
  useLocalActivity();
  const [confirmedPod, setConfirmedPod] = useState(null);
  const [cancellingPod, setCancellingPod] = useState(null);
  const [error, setError] = useState('');
  const appointments = readUpcomingAppointments();
  const favoriteIds = readFavorites();
  const favorites = restaurants.filter(place => favoriteIds.has(place.id)).map(withMyReviews);
  const reviews = restaurants.flatMap(place => readReviews(place.id).map(review => ({ ...review, place })))
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  function update(action) {
    try { action(); setError(''); }
    catch { setError('변경사항을 저장하지 못했어요. 다시 시도해주세요.'); }
  }

  return <div className="my-page">
    <header className="my-profile">
      <svg className="my-avatar" viewBox="0 0 56 56" role="img" aria-label="기본 프로필 사진">
        <circle cx="28" cy="28" r="28" fill="#f2f4f6" />
        <circle cx="28" cy="21" r="8" fill="#b0b8c1" />
        <path d="M13 43a15 15 0 0 1 30 0c-8 5-22 5-30 0Z" fill="#b0b8c1" />
      </svg>
      <h2>{myProfile.nickname}</h2>
    </header>

    {error && <p className="my-error" role="alert">{error}</p>}
    <div className="my-sections">
      <section className="my-section my-appointments" aria-labelledby="my-appointments-heading">
        <h2 id="my-appointments-heading">다가오는 약속 <span>{appointments.length}</span></h2>
        {appointments.length === 0 && <div className="my-empty"><MyIcon type="time" /><p>다가오는 약속이 없어요</p></div>}
        {appointments.map(appointment => <article className="my-appointment" key={participationKey(appointment)}>
          <div className="my-appointment-top"><span className="my-confirmed">{appointment.isMine ? '내가 만든 팟' : '참여 중'}</span><span className="my-appointment-date">{formatPodDate(appointment.date)} · {appointment.time}</span></div>
          <h3>{appointment.restaurantName}</h3>
          <p className="my-appointment-title" title={appointment.title}>{appointment.title}</p>
          <dl className="my-appointment-info">
            <div className="my-appointment-meeting"><dt><MyIcon type="place" /><span className="visually-hidden">만남 장소</span></dt><dd title={appointment.meeting}>{appointment.meeting}</dd></div>
            <div><dt><MyIcon type="people" /><span className="visually-hidden">참여 인원</span></dt><dd>{appointment.capacity === null ? `${appointment.participants}명 · 인원 제한 없음` : `${appointment.participants} / ${appointment.capacity}명`}</dd></div>
          </dl>
          <div className="my-appointment-actions">
            <button type="button" className="pod-join is-joined" onClick={() => setConfirmedPod(appointment)}>약속 보기</button>
            <button type="button" className="pod-cancel" onClick={() => setCancellingPod(appointment)}>{appointment.isMine ? '약속 취소하기' : '참여 취소하기'}</button>
          </div>
        </article>)}
      </section>
      <section className="my-section my-reviews" aria-labelledby="my-reviews-heading">
        <h2 id="my-reviews-heading">내 리뷰 <span>{reviews.length}</span></h2>
        {reviews.length === 0 ? <div className="my-empty"><MyIcon type="review" /><p>아직 작성한 리뷰가 없어요</p></div>
          : <ul className="my-review-list">{reviews.map((review, index) => <li key={`${review.place.id}:${review.id || index}`}>
            <article>
              <div className="my-review-heading"><button type="button" className="my-place-link" onClick={() => onSelectRestaurant(review.place)}>{review.place.name}</button><span className="my-rating" aria-label={`${review.rating}점`}>★ {review.rating.toFixed(1)}</span></div>
              <p className="my-review-menu">{review.menu}</p>
              <p className="my-review-text">{review.review}</p>
              {review.tags.length > 0 && <div className="review-selected-tags">{review.tags.map(tag => <span key={tag}>{tag}</span>)}</div>}
            </article>
          </li>)}</ul>}
      </section>
      <section className="my-section my-favorites" aria-labelledby="my-favorites-heading">
        <h2 id="my-favorites-heading">찜한 식당 <span>{favorites.length}</span></h2>
        {favorites.length === 0 ? <div className="my-empty"><MyIcon type="heart" /><p>아직 찜한 식당이 없어요</p></div>
          : <ul className="my-favorite-list">{favorites.map(place => <li key={place.id}>
            <button type="button" className="my-favorite-open" onClick={() => onSelectRestaurant(place)}>
              <strong>{place.name}</strong><span>{restaurantDetails[place.id]?.category || '종류 확인 중'}<span className="my-rating">★ {place.rating.toFixed(1)}</span></span>
            </button>
            <button type="button" className="my-unfavorite" aria-label={`${place.name} 찜 해제`} onClick={() => update(() => toggleFavorite(place.id))}><MyIcon type="heart" /></button>
          </li>)}</ul>}
      </section>
    </div>
    {confirmedPod && <PodConfirmation pod={confirmedPod} onClose={() => setConfirmedPod(null)} />}
    {cancellingPod && <PodCancelFlow pod={cancellingPod} onClose={() => setCancellingPod(null)}
      onConfirm={() => cancellingPod.isMine ? cancelCreatedPod(cancellingPod) : cancelParticipation(cancellingPod)} />}
  </div>;
}
