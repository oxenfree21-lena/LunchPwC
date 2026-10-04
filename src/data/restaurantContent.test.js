import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseRestaurants } from '../lib/restaurantData.js';
import { restaurantDetails } from './restaurantDetails.js';
import { restaurantReviews } from './restaurantReviews.js';

const places = parseRestaurants(readFileSync(new URL('./restaurants.csv', import.meta.url), 'utf8'));

test('every restaurant has info, four menus with one signature, and four sample reviews', () => {
  assert.equal(places.length, 22);
  for (const place of places) {
    const details = restaurantDetails[place.id];
    assert.ok(details.category && details.address && details.hours, place.name);
    assert.equal(details.menus.length, 4, place.name);
    assert.equal(details.menus.filter(item => item.signature).length, 1, place.name);
    assert.equal(restaurantReviews[place.id].length, 4, place.name);
    assert.ok(place.reviewCount >= restaurantReviews[place.id].length, place.name);
    assert.ok(restaurantReviews[place.id].every(review => review.rating >= 0.5 && review.rating <= 5 && review.rating * 2 % 1 === 0));
  }
});
