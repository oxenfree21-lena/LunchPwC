import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseRestaurants } from './restaurantData.js';
import { restaurantDetails } from '../data/restaurantDetails.js';
import { searchRestaurants } from './restaurantSearch.js';

const places = parseRestaurants(readFileSync(new URL('../data/restaurants.csv', import.meta.url), 'utf8'));
const search = query => searchRestaurants(places, restaurantDetails, query);

test('searches local names regardless of whitespace', () => {
  assert.equal(search('  쌤쌤썸  ')[0].id, '15');
  assert.equal(search('중화 객잔 담')[0].id, '12');
});

test('finds menu and category matches with all query terms', () => {
  assert.deepEqual(search('고기국수').map(place => place.id), ['10']);
  assert.ok(search('파스타').length > 1);
  assert.deepEqual(search('한식 고기국수').map(place => place.id), ['10']);
  assert.ok(search('중식').every(place => restaurantDetails[place.id].category === '중식'));
});

test('unknown, blank and review-only terms do not return unrelated restaurants', () => {
  for (const query of ['', '   ', '없는식당123', '감사보고서']) assert.equal(search(query).length, 0);
  assert.ok(search('소뜰').some(place => place.id === '7'));
});
