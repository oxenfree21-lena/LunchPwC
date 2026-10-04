import { restaurantDetails } from '../data/restaurantDetails.js';

export const emptyPodFilters = { food: '', date: '', time: '', capacity: '' };
export const foodTypes = [...new Set(Object.values(restaurantDetails).map(item => item.category?.split(' · ')[0]).filter(Boolean))];
export const timeSlots = [
  ['morning', '아침 · 06–11시', 6, 11],
  ['lunch', '점심 · 11–15시', 11, 15],
  ['afternoon', '오후 · 15–17시', 15, 17],
  ['dinner', '저녁 · 17–21시', 17, 21],
  ['night', '늦은 밤 · 21–06시', 21, 30],
];

export function filterPods(pods, filters) {
  return pods.filter(pod => {
    const category = restaurantDetails[pod.restaurantId]?.category?.split(' · ')[0];
    if (filters.food && category !== filters.food) return false;
    if (filters.date && pod.date !== filters.date) return false;
    if (filters.time) {
      const slot = timeSlots.find(([key]) => key === filters.time);
      let hour = Number(pod.time.split(':')[0]);
      if (filters.time === 'night' && hour < 6) hour += 24;
      if (slot && (hour < slot[2] || hour >= slot[3])) return false;
    }
    if (filters.capacity === 'small' && !(pod.capacity >= 2 && pod.capacity <= 4)) return false;
    if (filters.capacity === 'medium' && !(pod.capacity >= 5 && pod.capacity <= 6)) return false;
    if (filters.capacity === 'large' && !(pod.capacity !== null && pod.capacity >= 7)) return false;
    if (filters.capacity === 'unlimited' && pod.capacity !== null) return false;
    return true;
  });
}

export function countPodFilters(filters) {
  return Object.values(filters).filter(Boolean).length;
}

export function canJoinPod(pod, now = new Date()) {
  return !pod.isMine && !pod.joined && !pod.cancelledAt
    && new Date(`${pod.date}T${pod.time}`).getTime() > now.getTime()
    && (pod.capacity === null || pod.participants < pod.capacity);
}

export function pickRandomPod(pods, filters, now = new Date(), random = Math.random) {
  const candidates = filterPods(pods, filters).filter(pod => canJoinPod(pod, now));
  return candidates.length ? candidates[Math.floor(random() * candidates.length)] : null;
}

// Pods on the same date in the same meal (lunch before 16:00, dinner after) overlap.
export const mealPeriod = time => time < '16:00' ? '점심' : '저녁';

export function findConflicts(pod, appointments) {
  return appointments.filter(item => item.id !== pod.id && item.date === pod.date && mealPeriod(item.time) === mealPeriod(pod.time));
}
