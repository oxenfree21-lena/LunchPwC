import { myProfile } from './profile.js';

export const PODS_STORAGE_KEY = 'lunchpwc:pods';
export const CANCELLED_DEMO_PODS_KEY = 'lunchpwc:cancelled-demo-pods';

function dateValue(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Demo pods from the planning sheet (2026-10-04), moved to weekdays 10/15, 10/16 and 10/19
// in the original order (P07 on Thursday 10/22 to match its title). Headcounts include the host. Deadlines are stored only.
export function createDemoPods() {
  const rows = [
    ['P01', 1, '점심', '양식', '🍝', '15', '쌤쌤썸', '2026-10-15', '12:00', '11:30', 'AP 1층 2코어', 1, 4, '뇨끼 먹고 오후 버틸 사람 구함', '처음 보는 분도 환영, 업무 얘기는 금지', '파스타먹는날'],
    ['P02', 3, '점심', '한식', '🍲', '9', '백솥', '2026-10-15', '11:50', '11:20', 'AP 1층 1코어', 2, 4, '국밥 한 그릇에 말 없이 힐링하실 분', '말을 많이 안 해도 괜찮아요', '따뜻한국물'],
    ['P03', 4, '점심', '한식', '🍲', '10', '제주정', '2026-10-16', '12:10', '11:40', 'AP 1층 2코어', 1, 3, '혼밥 탈출 프로젝트: 고기국수 편', '낯가려도 괜찮아요. 국수가 빨리 나와요', '면치기장인'],
    ['P04', 8, '점심', '양식', '🍝', '15', '쌤쌤썸', '2026-10-16', '11:40', '11:10', 'AP 1층 2코어', 3, 6, '입사 n일차? 회사 근처 맛집 투어 1탄', '회사 근처 맛집, 먼저 와 본 동료가 알려 드려요', '용리단길산책러'],
    ['P05', 7, '점심', '양식', '🍝', '16', '심퍼티카스', '2026-10-19', '12:00', '11:30', 'AP 1층 3코어', 4, 6, '엘리베이터에서만 보던 사이 졸업해요', '오픈 시간에 맞춰 가서 대기 없이 앉아요', '점심탐험가'],
    ['P06', 11, '점심', '고기구이', '🥩', '5', '정직한우', '2026-10-19', '12:00', '11:30', '식당 앞', 5, 8, '마지막 점심은 한우로 배웅해요', '룸이 있어서 여럿이 앉기 좋아요', '고기굽는곰'],
    ['P07', 2, '저녁', '고기구이', '🥩', '1', '뼈불집', '2026-10-22', '19:00', '18:30', 'AP 1층 2코어', 3, 6, '목요일은 사실상 금요일, 삼겹살 콜?', '1/N 정산, 1인 3~4만 원 예상', '고기굽는곰'],
    ['P08', 5, '저녁', '중식', '🥟', '12', '중화객잔 담', '2026-10-15', '18:30', '18:00', 'AP 1층 1코어', 3, 5, '야근 전 탄수화물 충전 원정대', '빨리 나와서 1시간 안에 돌아와요', '부먹찍먹'],
    ['P09', 9, '저녁', '일식', '🍣', '20', '핫피엔딩', '2026-10-16', '19:00', '18:30', 'AP 1층 2코어', 5, 8, '바쁜 시기 끝! 해피엔딩은 여기서', '오랜만에 다 같이 얼굴 봐요', '초밥한판'],
    ['P10', 10, '저녁', '양식', '🍝', '19', '타파코코', '2026-10-19', '20:30', '20:00', '식당 앞', 2, 4, '조용히 타파스 먹으며 하루 마감', '3~4명이 딱 좋아요', '파스타먹는날'],
  ];
  return rows.map(([id, sourceVersion, mealTime, category, icon, restaurantId, restaurantName, date, time, deadline, meeting, participants, capacity, title, note, host]) => ({
    id, sourceVersion, mealTime, category, icon, title: `${icon} ${title}`, date, time, deadline, restaurantId, restaurantName,
    capacity, participants, meeting, note, host,
    // Sample pods hosted under my nickname count as mine.
    isMine: host === myProfile.nickname,
  }));
}

// Demo pods minus the ones I hosted and canceled in this browser.
export function readDemoPods() {
  let cancelled = [];
  try {
    const value = JSON.parse(localStorage.getItem(CANCELLED_DEMO_PODS_KEY) || '[]');
    if (Array.isArray(value)) cancelled = value;
  } catch { /* Ignore broken storage and show every demo pod. */ }
  return createDemoPods().filter(pod => !(pod.isMine && cancelled.includes(pod.id)));
}

export function readSavedPods() {
  try {
    const saved = JSON.parse(localStorage.getItem(PODS_STORAGE_KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter(pod => pod && !pod.cancelledAt && typeof pod.id === 'string' && typeof pod.restaurantName === 'string'
      && typeof pod.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(pod.date) && Number.isFinite(new Date(`${pod.date}T12:00`).getTime())
      && typeof pod.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(pod.time)
      && (pod.capacity === null || (Number.isInteger(pod.capacity) && pod.capacity >= 2)) && typeof pod.meeting === 'string')
      .map(({ gender, cohortMin, cohortMax, ...pod }) => ({ ...pod,
        title: typeof pod.title === 'string' && pod.title.trim() ? pod.title : `${pod.restaurantName} 같이 가요`,
        host: typeof pod.host === 'string' && pod.host ? pod.host : myProfile.nickname, participants: 1, isMine: true }));
  } catch { return []; }
}

export function formatPodDate(date, today = new Date()) {
  if (date === dateValue(today)) return '오늘';
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date === dateValue(tomorrow)) return '내일';
  const value = new Date(`${date}T12:00`);
  return `${value.getMonth() + 1}.${value.getDate()} (${['일', '월', '화', '수', '목', '금', '토'][value.getDay()]})`;
}
