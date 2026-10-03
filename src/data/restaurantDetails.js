// Public menu listings checked on 2026-10-03. These are selected menu prices,
// not an inferred per-person bill. Original demo ratings/reviews stay in the CSV.
const dining = id => `https://www.diningcode.com/profile.php?rid=${id}`;
const polle = (id, name) => `https://polle.com/place/${id}/${encodeURIComponent(name)}`;

export const restaurantDetails = {
  1: { category: '한식 · 고기', menu: '철판제육 · 해남묵은지김치전골', priceMin: 10000, priceMax: 10000, priceBasis: '점심특선', source: polle('31ij2Z', '뼈탄집') },
  2: { category: '한식 · 고기', menu: '흑돼지간장구이정식 · 육회비빔밥', priceMin: 12000, priceMax: 12000, priceBasis: '평일 점심', source: polle('5vjS2P', '고산식육점'), note: '간장구이정식은 2인 이상 주문' },
  3: { category: '한식 · 고기', menu: '미나리김치찌개', priceMin: 11000, priceMax: 11000, priceBasis: '점심 메뉴', source: dining('y8Hik4mLXG0t') },
  4: { category: '한식 · 고기', menu: '갈비삼겹 · 통갈매기살', priceMin: 18000, priceMax: 19000, priceBasis: '고기 150g', source: dining('tnmCpHryiode') },
  5: { category: '한식 · 한우', menu: '한우구이', priceMin: null, priceMax: null, priceBasis: '', source: 'https://pf.kakao.com/_bBsDG', note: '용산점 가격은 콘텐츠팀 확인 필요. 다른 지점 가격을 가져오지 않음.' },
  6: { category: '한식 · 고기', menu: '금돈삼겹살 · 마블목살', priceMin: 17000, priceMax: 17000, priceBasis: '고기 170g', source: dining('lc86skBVf1cN') },
  7: { category: null, menu: '', priceMin: null, priceMax: null, priceBasis: '', source: null, note: '돈뜰의 용산 매장 정보를 확인하지 못함. 원본 이름·좌표 유지, 콘텐츠팀에 지점 확인 필요.' },
  8: { category: '한식 · 고기', menu: '간장제육과 7첩보리밥한상', priceMin: 12000, priceMax: 12000, priceBasis: '평일 점심', source: dining('0xjUQyu4oUO6') },
  9: { category: '한식 · 곰탕', menu: '돼지곰탕 · 열곰탕 · 약곰탕', priceMin: 11000, priceMax: 16000, priceBasis: '곰탕 보통', source: dining('eYH8ils6BYNF') },
  10: { category: '한식 · 제주음식', menu: '제주 고기국수 · 고사리육개장', priceMin: 12000, priceMax: 12000, priceBasis: '식사 메뉴', source: 'https://www.tabling.co.kr/place/677ccbe766de5f06987e19a9' },
  11: { category: '한식 · 해장국', menu: '소뼈해장국 · 한우곱창국밥', priceMin: 11000, priceMax: 15000, priceBasis: '식사 메뉴', source: 'https://www.tabling.co.kr/restaurant/13060' },
  12: { category: '중식', menu: '짜장면 · 짬뽕 · 중화국밥', priceMin: 8000, priceMax: 13000, priceBasis: '식사 메뉴', source: dining('9rNKYBXGHxMP') },
  13: { category: '동남아 · 라오스', menu: '까오소이 · 까오삐약 · 도가니국수', priceMin: 12000, priceMax: 13500, priceBasis: '국수 메뉴', source: dining('U05Z0XquZT53') },
  14: { category: '동남아 · 베트남', menu: '소고기쌀국수 · 분짜비빔쌀국수', priceMin: 13000, priceMax: 15000, priceBasis: '식사 메뉴', source: dining('UGWxSNf2166J') },
  15: { category: '양식', menu: '잠봉뵈르 파스타 · 라자냐 · 리조또', priceMin: 19000, priceMax: 25000, priceBasis: '파스타·리조또', source: polle('3WOA2N', '쌤쌤쌤') },
  16: { category: '양식 · 퓨전', menu: '고추오일 명란크림 · 차돌 고사리 파스타', priceMin: 22500, priceMax: 23500, priceBasis: '대표 파스타', source: dining('gebN73fJbiyW'), note: '제공 이름은 심퍼티쿠스, 검색된 매장명은 심퍼티쿠시 용산점. 원본 이름은 보존하며 콘텐츠팀 확인 필요.' },
  17: { category: '양식 · 피자', menu: '부라타 뽀모도로 파스타 · 갈릭 옥수수 피자', priceMin: 21000, priceMax: 25000, priceBasis: '메뉴 한 접시', source: dining('icvC7yiGUtMh') },
  18: { category: '양식 · 와인다이닝', menu: '전복 에스까르고 · 뽈뽀', priceMin: 32000, priceMax: 35000, priceBasis: '메뉴 한 접시', source: dining('PK34Wt5gwcjq'), note: '평일 점심 운영 여부 별도 확인 필요' },
  19: { category: '양식 · 스페인', menu: '꿀대구 · 뽈뽀', priceMin: 26000, priceMax: 29000, priceBasis: '메뉴 한 접시', source: dining('VIFZJGkOgZsj') },
  20: { category: '일식 · 이자카야', menu: '전복내장 파스타 · 고등어 봉초밥', priceMin: 23000, priceMax: 27000, priceBasis: '메뉴 한 접시', source: dining('ZKvWB4MOuHRS') },
  21: { category: '한식 · 주점', menu: '실비카세 반상', priceMin: 49000, priceMax: 49000, priceBasis: '2인상', source: dining('IYKmOV6XZkjQ'), note: '저녁 영업 매장. 점심 식당으로 분류하지 않음.' },
  22: { category: '양식 · 와인바', menu: '브리치즈 파스타 · 닭 목살 양념구이', priceMin: 20000, priceMax: 25000, priceBasis: '메뉴 한 접시', source: dining('bpINc4C9WiEq') },
};

export const detailsCheckedAt = '2026-10-03';

// Replace this one reference once the company's entrance coordinates are supplied.
export const distanceOrigin = { label: '신용산역', lat: 37.52917, lng: 126.96783 };

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
