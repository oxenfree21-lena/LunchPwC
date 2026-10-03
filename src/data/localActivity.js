import { useEffect, useReducer } from 'react';
import { createDemoPods, readSavedPods, PODS_STORAGE_KEY } from './pods.js';

const CHANGE_EVENT = 'lunchpwc:activity-changed';
const FAVORITES_KEY = 'lunchpwc:favorites';
const JOINED_KEY = 'lunchpwc:joined-pods';
const JOINED_DETAILS_KEY = 'lunchpwc:joined-pod-details';
export const participationKey = pod => `${pod.id}:${pod.date}:${pod.time}`;

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch { return []; }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

// React to changes in this tab as well as other tabs on the same origin.
export function useLocalActivity() {
  const [, refresh] = useReducer(value => value + 1, 0);
  useEffect(() => {
    const onStorage = event => { if (!event.key || event.key.startsWith('lunchpwc:')) refresh(); };
    window.addEventListener(CHANGE_EVENT, refresh);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, refresh);
      window.removeEventListener('storage', onStorage);
    };
  }, []);
}

export function readFavorites() {
  return new Set(readArray(FAVORITES_KEY).filter(id => typeof id === 'string'));
}

export function toggleFavorite(id) {
  const next = readFavorites();
  if (next.has(id)) next.delete(id); else next.add(id);
  write(FAVORITES_KEY, [...next]);
}

export function readReviews(restaurantId) {
  return readArray(`lunchpwc:reviews:${restaurantId}`).filter(review => review
    && typeof review.author === 'string' && typeof review.review === 'string'
    && typeof review.menu === 'string' && Number.isInteger(review.rating)
    && review.rating >= 1 && review.rating <= 5 && Array.isArray(review.tags)
    && review.tags.every(tag => typeof tag === 'string'));
}

export function saveReview(restaurantId, review) {
  write(`lunchpwc:reviews:${restaurantId}`, [{ ...review, id: crypto.randomUUID(), author: '나', createdAt: new Date().toISOString() }, ...readReviews(restaurantId)]);
}

export function readParticipation() {
  return new Set(readArray(JOINED_KEY).filter(key => typeof key === 'string'));
}

export function joinPod(pod) {
  const key = participationKey(pod);
  // Keep the date and details at signup, even if the demo schedule changes later.
  const snapshots = readArray(JOINED_DETAILS_KEY).filter(item => item && participationKey(item) !== key);
  localStorage.setItem(JOINED_DETAILS_KEY, JSON.stringify([...snapshots, { ...pod, joined: true, participants: pod.participants + 1 }]));
  write(JOINED_KEY, [...new Set([...readParticipation(), key])]);
}

export function cancelParticipation(pod) {
  const next = readParticipation();
  next.delete(participationKey(pod));
  write(JOINED_KEY, [...next]);
}

export function cancelCreatedPod(pod) {
  if (!pod.isMine || !readSavedPods().some(saved => saved.id === pod.id)) return;
  write(PODS_STORAGE_KEY, readArray(PODS_STORAGE_KEY).map(saved => saved?.id === pod.id
    ? { ...saved, cancelledAt: new Date().toISOString() } : saved));
}

export function readUpcomingAppointments(now = new Date()) {
  const snapshots = readArray(JOINED_DETAILS_KEY);
  const demos = createDemoPods(now);
  const joined = [...readParticipation()].flatMap(key => {
    const match = /^(.*):(\d{4}-\d{2}-\d{2}):(\d{2}:\d{2})$/.exec(key);
    if (!match) return [];
    const snapshot = snapshots.find(pod => pod && participationKey(pod) === key
      && typeof pod.restaurantName === 'string' && typeof pod.meeting === 'string');
    if (snapshot) return [{ ...snapshot, joined: true }];
    // Preserve signups made before snapshots were introduced.
    const original = demos.find(pod => pod.id === match[1]);
    return original ? [{ ...original, date: match[2], time: match[3], participants: original.participants + 1, joined: true }] : [];
  });
  return [...readSavedPods(), ...joined]
    .filter(pod => new Date(`${pod.date}T${pod.time}`).getTime() >= now.getTime())
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
}
