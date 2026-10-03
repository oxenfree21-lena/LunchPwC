import { beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { createDemoPods, readSavedPods } from './pods.js';
import { readFavorites, toggleFavorite, readReviews, saveReview, joinPod, cancelParticipation, cancelCreatedPod, readParticipation, readUpcomingAppointments, participationKey } from './localActivity.js';

const storage = new Map();
globalThis.localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
};
globalThis.window = new EventTarget();
beforeEach(() => storage.clear());

test('favorites survive rereads and can be removed; changes notify mounted screens', () => {
  let changes = 0;
  const listener = () => changes++;
  window.addEventListener('lunchpwc:activity-changed', listener);
  toggleFavorite('10');
  assert.deepEqual([...readFavorites()], ['10']);
  toggleFavorite('10');
  assert.equal(readFavorites().size, 0);
  assert.equal(changes, 2);
  window.removeEventListener('lunchpwc:activity-changed', listener);
});

test('new reviews preserve existing reviews and remain scoped to their restaurant', () => {
  const review = { author: '나', menu: '고기국수', review: '맛있어요', rating: 4, tags: ['혼밥'] };
  storage.set('lunchpwc:reviews:10', JSON.stringify([review]));
  saveReview('10', { ...review, rating: 5, review: '또 방문했어요' });
  assert.equal(readReviews('10').length, 2);
  assert.equal(readReviews('10')[0].review, '또 방문했어요');
  assert.ok(readReviews('10')[0].createdAt);
  assert.equal(readReviews('3').length, 0);
});

test('signups keep their date across days and cancellation removes the appointment', () => {
  const now = new Date('2026-10-03T09:00');
  const pod = createDemoPods(now).find(pod => pod.id === 'demo-pod-7');
  joinPod(pod);
  assert.ok(readParticipation().has(participationKey(pod)));
  const nextDay = new Date('2026-10-04T09:00');
  const [appointment] = readUpcomingAppointments(nextDay);
  assert.equal(appointment.date, pod.date);
  assert.equal(appointment.participants, pod.participants + 1);
  cancelParticipation(appointment);
  assert.equal(readUpcomingAppointments(nextDay).length, 0);
});

test('legacy signup keys work, passed meetings are excluded, own pods are included', () => {
  const now = new Date('2026-10-03T09:00');
  const pod = createDemoPods(now).find(pod => pod.id === 'demo-pod-7');
  storage.set('lunchpwc:joined-pods', JSON.stringify([participationKey(pod), 'demo-pod-1:2026-10-02:12:00']));
  storage.set('lunchpwc:pods', JSON.stringify([{ ...pod, id: 'own-pod', date: '2026-10-05', capacity: 4 }]));
  const appointments = readUpcomingAppointments(now);
  assert.equal(appointments.length, 2);
  assert.equal(appointments[0].isMine, true);
  assert.equal(appointments[1].id, pod.id);
});

test('invalid stored data is ignored', () => {
  storage.set('lunchpwc:favorites', '{broken');
  storage.set('lunchpwc:reviews:10', JSON.stringify([null, { rating: 8 }]));
  storage.set('lunchpwc:joined-pods', JSON.stringify([null, 123, 'bad-key']));
  assert.equal(readFavorites().size, 0);
  assert.equal(readReviews('10').length, 0);
  assert.equal(readUpcomingAppointments().length, 0);
});

test('canceling an owned pod removes it from both lists without changing other signups', () => {
  const now = new Date('2026-10-03T09:00');
  const pod = createDemoPods(now).find(pod => pod.id === 'demo-pod-7');
  storage.set('lunchpwc:pods', JSON.stringify([{ ...pod, id: 'own-pod' }, { ...pod, id: 'other-own-pod' }]));
  joinPod(pod);
  cancelCreatedPod({ ...pod, isMine: false });
  assert.equal(readSavedPods().length, 2);
  cancelCreatedPod({ ...pod, id: 'own-pod', isMine: true });
  assert.deepEqual(readSavedPods().map(item => item.id), ['other-own-pod']);
  assert.equal(readUpcomingAppointments(now).length, 2);
  assert.ok(readParticipation().has(participationKey(pod)));
  assert.ok(JSON.parse(storage.get('lunchpwc:pods'))[0].cancelledAt);
});
