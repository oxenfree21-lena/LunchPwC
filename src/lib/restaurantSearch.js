const normalize = value => String(value ?? '').normalize('NFKC').toLocaleLowerCase('ko-KR').replace(/[\s·,]+/g, '');

// Search only the supplied local restaurant records; no map/place search API.
export function searchRestaurants(places, details, query) {
  const terms = query.trim().split(/\s+/).map(normalize).filter(Boolean);
  if (!terms.length) return [];
  const needle = normalize(query);
  return places.filter(place => {
    const detail = details[place.id] ?? {};
    const fields = [place.name, detail.category, detail.menu].map(normalize);
    return terms.every(term => fields.some(field => field.includes(term)));
  }).sort((a, b) => {
    const score = place => normalize(place.name) === needle ? 0 : normalize(place.name).startsWith(needle) ? 1 : normalize(place.name).includes(needle) ? 2 : 3;
    return score(a) - score(b) || b.rating - a.rating;
  });
}
