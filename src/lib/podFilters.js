import { restaurantDetails } from '../data/restaurantDetails.js';

export const emptyPodFilters = { food: '', date: '', time: '', capacity: '' };
export const foodTypes = [...new Set(Object.values(restaurantDetails).map(item => item.category?.split(' · ')[0]).filter(Boolean))];
// Pods only run at lunch or dinner (see podOptions), split at 16:00.
export const mealPeriod = time => time < '16:00' ? '점심' : '저녁';
export const timeSlots = [
  ['lunch', '점심 · 11:00–13:00', '점심'],
  ['dinner', '저녁 · 17:30–21:00', '저녁'],
];
export const JOIN_CLOSES_MINUTES = 30;

export function filterPods(pods, filters) {
  return pods.filter(pod => {
    const category = restaurantDetails[pod.restaurantId]?.category?.split(' · ')[0];
    if (filters.food && category !== filters.food) return false;
    if (filters.date && pod.date !== filters.date) return false;
    if (filters.time && mealPeriod(pod.time) !== timeSlots.find(([key]) => key === filters.time)?.[2]) return false;
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

// Signups close 30 minutes before the meal, when the pod is confirmed.
export function joinClosesAt(pod) {
  return new Date(`${pod.date}T${pod.time}`).getTime() - JOIN_CLOSES_MINUTES * 60 * 1000;
}

export function canJoinPod(pod, now = new Date()) {
  return !pod.isMine && !pod.joined && !pod.cancelledAt
    && joinClosesAt(pod) > now.getTime()
    && (pod.capacity === null || pod.participants < pod.capacity);
}

export function pickRandomPod(pods, filters, now = new Date(), random = Math.random) {
  const candidates = filterPods(pods, filters).filter(pod => canJoinPod(pod, now));
  return candidates.length ? candidates[Math.floor(random() * candidates.length)] : null;
}

// Pods on the same date in the same meal overlap.

export function findConflicts(pod, appointments) {
  return appointments.filter(item => item.id !== pod.id && item.date === pod.date && mealPeriod(item.time) === mealPeriod(pod.time));
}
