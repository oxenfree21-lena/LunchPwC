import { restaurantDetails } from '../data/restaurantDetails.js';
import { myProfile } from '../data/profile.js';

export const emptyPodFilters = { food: '', date: '', time: '', capacity: '', gender: '', cohortMin: '', cohortMax: '' };
export const genderOptions = [['any', '제한 없음'], ['male', '남자'], ['female', '여자']];
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
    // Gender and cohort filters keep pods that someone matching them could join.
    if (filters.gender && !genderAllows(pod, filters.gender)) return false;
    if (filters.cohortMin || filters.cohortMax) {
      const [podMin, podMax] = [pod.cohortMin ?? -Infinity, pod.cohortMax ?? Infinity];
      const [min, max] = [filters.cohortMin ? Number(filters.cohortMin) : -Infinity, filters.cohortMax ? Number(filters.cohortMax) : Infinity];
      if (podMin > max || min > podMax) return false;
    }
    return true;
  });
}

export function countPodFilters(filters) {
  return ['food', 'date', 'time', 'capacity', 'gender'].filter(key => filters[key]).length
    + (filters.cohortMin || filters.cohortMax ? 1 : 0);
}

function genderAllows(pod, gender) {
  return !pod.gender || pod.gender === 'any' || pod.gender === gender;
}

export function formatCohortRange(min, max) {
  if (min == null && max == null) return '';
  if (min === max) return `${min}사번`;
  return `${min ?? ''}~${max ?? ''}사번`;
}

export function formatPodConditions(pod) {
  return [pod.gender === 'male' ? '남자만' : pod.gender === 'female' ? '여자만' : '', formatCohortRange(pod.cohortMin ?? null, pod.cohortMax ?? null)].filter(Boolean);
}

export function meetsPodConditions(pod, profile = myProfile) {
  if (profile.gender && !genderAllows(pod, profile.gender)) return false;
  if (pod.cohortMin != null && profile.cohort < pod.cohortMin) return false;
  if (pod.cohortMax != null && profile.cohort > pod.cohortMax) return false;
  return true;
}

export function canJoinPod(pod, now = new Date(), profile = myProfile) {
  return !pod.isMine && !pod.joined && !pod.cancelledAt && meetsPodConditions(pod, profile)
    && new Date(`${pod.date}T${pod.time}`).getTime() > now.getTime()
    && (pod.capacity === null || pod.participants < pod.capacity);
}

export function pickRandomPod(pods, filters, now = new Date(), random = Math.random) {
  const candidates = filterPods(pods, filters).filter(pod => canJoinPod(pod, now));
  return candidates.length ? candidates[Math.floor(random() * candidates.length)] : null;
}
