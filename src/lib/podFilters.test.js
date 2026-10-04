import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterPods, canJoinPod, pickRandomPod, emptyPodFilters, countPodFilters, findConflicts, mealPeriod } from './podFilters.js';

const now = new Date('2026-10-03T10:00');
const base = { id: 'one', restaurantId: '1', date: '2026-10-03', time: '12:00', capacity: 4, participants: 1 };
const pods = [base,
  { ...base, id: 'two', restaurantId: '15', time: '19:00', capacity: 6 },
  { ...base, id: 'three', restaurantId: '12', date: '2026-10-04', capacity: null },
  { ...base, id: 'four', restaurantId: '19', time: '21:00', capacity: 8 },
];

test('filters combine food, exact date, time and maximum headcount', () => {
  assert.equal(filterPods(pods, emptyPodFilters).length, 4);
  assert.deepEqual(filterPods(pods, { food: '고기구이', date: '2026-10-03', time: 'lunch', capacity: 'small' }), [base]);
  assert.deepEqual(filterPods(pods, { food: '고기구이', time: 'dinner' }), []);
  assert.deepEqual(filterPods(pods, { capacity: 'unlimited' }), [pods[2]]);
  assert.deepEqual(filterPods(pods, { capacity: 'large' }), [pods[3]]);
  assert.deepEqual(filterPods(pods, { capacity: 'medium' }), [pods[1]]);
});

test('time slots include the start, exclude the end, and cross midnight', () => {
  const timed = ['05:59', '06:00', '10:59', '11:00', '14:59', '15:00', '17:00', '20:59', '21:00'].map(time => ({ ...base, time }));
  assert.deepEqual(filterPods(timed, { time: 'lunch' }).map(p => p.time), ['11:00', '14:59']);
  assert.deepEqual(filterPods(timed, { time: 'night' }).map(p => p.time), ['05:59', '21:00']);
  assert.deepEqual(filterPods(timed, { time: 'dinner' }).map(p => p.time), ['17:00', '20:59']);
});

test('random picks only filtered eligible pods, never owned/joined/full/past/canceled', () => {
  const excluded = [{ ...base, isMine: true }, { ...base, joined: true }, { ...base, participants: 4 },
    { ...base, time: '09:00' }, { ...base, cancelledAt: '2026-10-03' }, { ...base, time: '10:00' }];
  assert.ok(excluded.every(pod => !canJoinPod(pod, now)));
  assert.equal(pickRandomPod([...excluded, ...pods], { food: '양식' }, now, () => 0), pods[1]);
  assert.equal(pickRandomPod(pods, emptyPodFilters, now, () => 0), pods[0]);
  assert.equal(pickRandomPod(pods, emptyPodFilters, now, () => .999), pods[3]);
  assert.equal(pickRandomPod(excluded, emptyPodFilters, now), null);
  assert.equal(pickRandomPod(pods, { food: '동남아' }, now), null);
  assert.equal(canJoinPod({ ...base, capacity: null, participants: 100 }, now), true);
});

test('filter count reflects only selected filters', () => {
  assert.equal(countPodFilters(emptyPodFilters), 0);
  assert.equal(countPodFilters({ ...emptyPodFilters, food: '양식', time: 'lunch' }), 2);
});

test('pods overlap only on the same date and the same meal', () => {
  assert.equal(mealPeriod('11:00'), '점심'); assert.equal(mealPeriod('15:59'), '점심'); assert.equal(mealPeriod('17:30'), '저녁');
  const appointments = [{ ...base, id: 'lunch', time: '12:30' }, { ...base, id: 'dinner', time: '19:00' }, { ...base, id: 'other-day', date: '2026-10-04' }];
  assert.deepEqual(findConflicts({ ...base, id: 'new', time: '11:40' }, appointments).map(p => p.id), ['lunch']);
  assert.deepEqual(findConflicts({ ...base, id: 'new', time: '18:00' }, appointments).map(p => p.id), ['dinner']);
  assert.deepEqual(findConflicts({ ...base, id: 'lunch', time: '12:30' }, appointments), []);
  assert.deepEqual(findConflicts({ ...base, id: 'new', date: '2026-10-05' }, appointments), []);
});
