import csv from './restaurants.csv?raw';
import { parseRestaurants } from '../lib/restaurantData';

export const restaurants = parseRestaurants(csv);
