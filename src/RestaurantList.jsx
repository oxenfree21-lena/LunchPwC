import React from 'react';
import { restaurantDetails, distanceOrigin, distanceInMeters, formatDistance, formatPrice } from './data/restaurantDetails';

function PhotoSlots({ name }) {
  return (
    <div className="restaurant-photos" role="img" aria-label={`${name} 사진 준비 중, 사진 3장 자리`}>
      {[0, 1, 2].map(index => <div className="restaurant-photo-slot" key={index} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3"><rect x="3.5" y="4" width="17" height="16" rx="3"/><circle cx="9" cy="9.5" r="1.5"/><path d="m4 17 5-5 4 4 3-3 4 4"/></svg>
        {index === 0 && <span>사진 준비 중</span>}
      </div>)}
    </div>
  );
}

export default function RestaurantList({ places }) {
  const sorted = places.map(place => ({ ...place, distance: distanceInMeters(place) }))
    .sort((a, b) => a.distance - b.distance);
  return <>
    <ol className="restaurant-list">
      {sorted.map(place => {
        const details = restaurantDetails[place.id] ?? {};
        return <li className="restaurant-list-item" key={place.id}>
          <article aria-labelledby={`restaurant-name-${place.id}`}>
            <div className="restaurant-list-title">
              <h3 id={`restaurant-name-${place.id}`}>{place.name}</h3>
              <span className="restaurant-list-rating" aria-label={`데모 평점 ${place.rating.toFixed(1)}점`}><span aria-hidden="true">★</span> {place.rating.toFixed(1)}</span>
            </div>
            <div className="restaurant-list-meta">
              <div className="restaurant-list-location">
                <span className="restaurant-category">{details.category ?? '종류 확인 중'}</span>
                <span className="restaurant-distance" aria-label={`${distanceOrigin.label}에서 직선거리 ${formatDistance(place.distance)}`}>{formatDistance(place.distance)}</span>
              </div>
              <span className="restaurant-list-price" title={details.priceBasis || undefined} aria-label={`${details.priceBasis ? `${details.priceBasis} 기준 ` : ''}${formatPrice(details)}`}>{formatPrice(details)}</span>
            </div>
            <PhotoSlots name={place.name} />
          </article>
        </li>;
      })}
    </ol>
    <p className="restaurant-list-note">공개 메뉴 기준 가격으로, 매장 가격과 다를 수 있어요.</p>
  </>;
}
