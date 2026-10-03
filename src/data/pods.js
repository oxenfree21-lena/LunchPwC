export const PODS_STORAGE_KEY = 'lunchpwc:pods';

function dateValue(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Demo schedule is anchored to October 15, 2026. Headcounts include the host.
export function createDemoPods(today = new Date('2026-10-15T12:00:00')) {
  function day(offset = 0) {
    const date = new Date(today);
    date.setDate(date.getDate() + offset);
    return dateValue(date);
  }
  const nextWeekday = weekday => (weekday - today.getDay() + 7) % 7;
  const nextWednesday = (8 - (today.getDay() || 7)) + 2;
  const rows = [
    ['🍚 오늘 점심 같이 드실 분!', day(), '12:00', '15', '쌤쌤쌤', 4, 1, '회사 1층 로비', ''],
    ['🍻 [번개] 금요일 저녁 같이 드실 분 구해요', day(nextWeekday(5)), '19:00', '1', '뼈탄집', 6, 2, '뼈탄집 입구 앞', '', { gender: 'male' }],
    ['🍲 어제 회식하신 분들, 해장하러 가요', day(), '11:50', '9', '백옥', 4, 2, '회사 1층 로비', '', { cohortMin: 33, cohortMax: 36 }],
    ['🙋 매일 혼밥하시는 분 계신가요?', day(), '12:10', '10', '제주옥', 3, 1, '제주옥 입구 앞', ''],
    ['🌙 야근러 저녁 원정대 모집', day(), '18:30', '12', '중화객잔 수', 5, 2, '회사 1층 로비', '1시간 안에 복귀'],
    ['🗓️ 토요일 출근하시는 분들 점심 같이 해요', day(nextWeekday(6)), '12:30', '6', '금은돈', null, 3, '금은돈 입구 앞', ''],
    ['🤝 감사·세무·딜·어드바이저리 섞어서 밥 먹어요', day(nextWednesday), '12:00', '16', '심퍼티쿠스', 6, 2, '회사 1층 로비', '본부별 1~2명씩'],
    ['🎉 올해 입사하신 분들 환영 점심', day(nextWeekday(2)), '12:00', '15', '쌤쌤쌤', 6, 2, '쌤쌤쌤 입구 앞', '신입 4명 + 선배 2명 · 예약 완료', { cohortMin: 35, cohortMax: 36 }],
    ['🥳 바쁜 시즌 끝! 해방 기념 번개', day(nextWeekday(5)), '19:00', '20', '핫피엔도', 8, 3, '핫피엔도 입구 앞', ''],
    ['🍷 회식 1차만 하고 탈출하실 분', day(), '21:00', '19', '타파코파', 4, 1, '타파코파 입구 앞', ''],
    ['👋 ○○ 시니어님 송별 점심', day(nextWeekday(4)), '12:00', '5', '솔직한우', null, 5, '솔직한우 1층 입구', '룸 예약 · 팀원과 지인 누구나'],
  ];
  return rows.map(([title, date, time, restaurantId, restaurantName, capacity, participants, meeting, note, conditions], index) => ({
    id: `demo-pod-${index + 1}`, title, date, time, restaurantId, restaurantName, capacity, participants, meeting, note,
    gender: 'any', cohortMin: null, cohortMax: null, ...conditions,
  }));
}

export function readSavedPods() {
  try {
    const saved = JSON.parse(localStorage.getItem(PODS_STORAGE_KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter(pod => pod && !pod.cancelledAt && typeof pod.id === 'string' && typeof pod.restaurantName === 'string'
      && typeof pod.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(pod.date) && Number.isFinite(new Date(`${pod.date}T12:00`).getTime())
      && typeof pod.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(pod.time)
      && (pod.capacity === null || (Number.isInteger(pod.capacity) && pod.capacity >= 2)) && typeof pod.meeting === 'string')
      .map(pod => ({ ...pod, gender: ['male', 'female'].includes(pod.gender) ? pod.gender : 'any',
        cohortMin: Number.isInteger(pod.cohortMin) ? pod.cohortMin : null, cohortMax: Number.isInteger(pod.cohortMax) ? pod.cohortMax : null,
        title: typeof pod.title === 'string' && pod.title.trim() ? pod.title : `${pod.restaurantName} 같이 가요`, participants: 1, isMine: true }));
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
