import { restaurantMenus } from './restaurantMenus.js';

// Fictional restaurant info from the content team (2026-10-04). Menus live in restaurantMenus.js.
const info = {
  1: { category: '고기구이', address: '서울 용산구 한강대로40길 17, 1층', hours: '매일 11:00~23:00 (테이블 이용 2시간)', tags: ['회식', '단체 식사', '웨이팅 필수'] },
  2: { category: '고기구이', address: '서울 용산구 한강대로38가길 9, 1층', hours: '월~토 11:30~22:00 (브레이크 14:30~17:00) · 일 휴무', tags: ['분위기 좋은', '단체 식사'] },
  3: { category: '고기구이', address: '서울 용산구 한강대로 52, 지하 1층', hours: '매일 11:00~23:00 (금·토 ~01:00)', tags: ['빠른 식사', '단체 식사', '회식'] },
  4: { category: '고기구이', address: '서울 용산구 한강대로40길 31, 2층', hours: '매일 11:30~24:00 (브레이크 15:00~17:00)', tags: ['분위기 좋은', '조용한'] },
  5: { category: '고기구이', address: '서울 용산구 한강대로21나길 14, 1~4층', hours: '매일 11:30~22:00', tags: ['회식', '단체 식사', '분위기 좋은'] },
  6: { category: '고기구이', address: '서울 용산구 한강대로15길 22, 1층', hours: '평일 11:30~22:00 · 주말 12:00~21:00', tags: ['조용한', '단체 식사', '회식'] },
  7: { category: '고기구이', address: '서울 용산구 한강대로40길 5, 3층', hours: '평일 11:30~22:00 (브레이크 15:00~17:00) · 주말 12:00~21:00', tags: ['조용한', '분위기 좋은', '회식'] },
  8: { category: '고기구이', address: '서울 용산구 한강대로11길 7, 1층', hours: '월~토 11:30~22:00 · 일 휴무', tags: ['혼밥', '조용한'] },
  9: { category: '한식', address: '서울 용산구 한강대로15길 30, 1층', hours: '매일 10:30~21:00', tags: ['혼밥', '빠른 식사'] },
  10: { category: '한식', address: '서울 용산구 한강대로38길 4, 1층', hours: '월~토 11:00~21:00 · 일 휴무', tags: ['혼밥', '웨이팅 필수'] },
  11: { category: '한식', address: '서울 용산구 한강대로80길 6, 1층', hours: '매일 10:00~22:00', tags: ['단체 식사', '분위기 좋은'] },
  12: { category: '중식', address: '서울 용산구 한강대로40길 23, 1층', hours: '매일 11:00~21:30 (브레이크 15:00~16:30)', tags: ['단체 식사', '빠른 식사', '회식'] },
  13: { category: '아시안', address: '서울 용산구 한강대로40길 41, 1층', hours: '매일 11:00~21:00', tags: ['분위기 좋은', '혼밥'] },
  14: { category: '아시안', address: '서울 용산구 한강대로38가길 12, 1층', hours: '매일 11:00~22:00 (브레이크 15:00~17:00)', tags: ['분위기 좋은', '웨이팅 필수'] },
  15: { category: '양식', address: '서울 용산구 한강대로40길 26, 1층', hours: '화~일 11:30~21:30 (브레이크 15:00~17:30) · 월 휴무', tags: ['분위기 좋은', '웨이팅 필수'] },
  16: { category: '양식', address: '서울 용산구 한강대로40길 35, 2층', hours: '매일 11:30~21:00 (브레이크 15:00~17:00)', tags: ['분위기 좋은', '단체 식사'] },
  17: { category: '양식', address: '서울 용산구 한강대로62가길 3, 1층', hours: '화~일 11:30~22:00 · 월 휴무', tags: ['분위기 좋은'] },
  18: { category: '양식', address: '서울 용산구 한강대로21길 19, 1층', hours: '화~일 11:30~22:00 (브레이크 15:00~17:30) · 월 휴무', tags: ['분위기 좋은', '조용한'] },
  19: { category: '양식', address: '서울 용산구 한강대로40길 38, 1층', hours: '화~토 11:30~22:00 (브레이크 14:30~17:00) · 일·월 휴무', tags: ['분위기 좋은', '웨이팅 필수'] },
  20: { category: '일식', address: '서울 용산구 한강대로40길 29, 1층', hours: '월~토 11:30~22:00 (브레이크 14:30~17:00) · 일 휴무', tags: ['분위기 좋은', '조용한', '회식'] },
  21: { category: '한식', address: '서울 용산구 한강대로62길 4, 1층', hours: '화~토 11:30~22:00 (브레이크 14:00~17:30) · 일·월 휴무', tags: ['가성비', '단체 식사', '회식'] },
  22: { category: '양식', address: '서울 용산구 한강대로40길 20, 2층', hours: '화~일 12:00~22:00 · 월 휴무', tags: ['분위기 좋은', '조용한'] },
};

// Shown under the map list and on every restaurant detail page.
export const demoDisclaimer = '식당 이름, 메뉴, 가격, 주소, 영업시간, 리뷰는 모두 데모용 가상 정보이고, 사진은 AI로 생성한 이미지예요. 실제 식당과는 관련이 없어요.';

export const situationTags = [...new Set(Object.values(info).flatMap(details => details.tags))];

export const restaurantDetails = Object.fromEntries(Object.entries(info).map(([id, details]) => {
  const menus = restaurantMenus[id] ?? [];
  const prices = menus.map(item => item.price);
  return [id, { ...details, menus, menu: menus.map(item => item.name).join(' · '),
    priceMin: prices.length ? Math.min(...prices) : null, priceMax: prices.length ? Math.max(...prices) : null }];
}));

// Company building, fitted to the content team's per-restaurant distances (all within 2m).
export const distanceOrigin = { label: '회사', lat: 37.52894, lng: 126.96862 };

export function distanceInMeters(place, origin = distanceOrigin) {
  const radians = degrees => degrees * Math.PI / 180;
  const a = Math.sin(radians(place.lat - origin.lat) / 2) ** 2
    + Math.cos(radians(origin.lat)) * Math.cos(radians(place.lat))
    * Math.sin(radians(place.lng - origin.lng) / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatDistance(meters) {
  return meters >= 1000 ? `${(meters / 1000).toFixed(1)}km` : `${Math.round(meters / 10) * 10}m`;
}

export function formatPrice(details) {
  if (details.priceMin == null) return '가격 확인 중';
  const min = details.priceMin.toLocaleString('ko-KR');
  return details.priceMin === details.priceMax ? `${min}원` : `${min}~${details.priceMax.toLocaleString('ko-KR')}원`;
}
