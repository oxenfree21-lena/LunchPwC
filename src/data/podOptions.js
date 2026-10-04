// Pod creation choices. Planning: lunch 11:00~13:00 in 10-minute steps.
// Dinner 17:30~21:00 is the content team's proposal and still needs planning sign-off.
function times(start, end, step) {
  const toMinutes = value => Number(value.slice(0, 2)) * 60 + Number(value.slice(3));
  const result = [];
  for (let minutes = toMinutes(start); minutes <= toMinutes(end); minutes += step) {
    result.push(`${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`);
  }
  return result;
}

export const podTimeGroups = [
  ['점심', times('11:00', '13:00', 10)],
  ['저녁', times('17:30', '21:00', 30)],
];
// null means no maximum, for larger dinners. A pod goes ahead once two people join.
export const podCapacityOptions = [2, 3, 4, 5, 6, 7, 8, null];
// Planning team's choices (10/4); the last option opens a text field.
export const meetingPlaces = ['회사 1층 2코어', '회사 17층(S-Bridge)', '식당 앞'];
export const CUSTOM_MEETING = '직접 입력';
export const MEETING_MAX = 30;
export const POD_NOTE_MAX = 30;
export const POD_RULE = '2명 이상 모이면 약속 30분 전에 확정돼요';
