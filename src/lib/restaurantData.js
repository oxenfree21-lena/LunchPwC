// Handles quoted commas, escaped quotes, line breaks, and Excel's UTF-8 BOM.
export function parseRestaurants(csv) {
  const rows = [];
  let row = [], field = '', quoted = false;
  const text = csv.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (!quoted && (char === ',' || char === '\n' || char === '\r')) {
      row.push(field); field = '';
      if (char !== ',') {
        if (row.some(value => value.trim())) rows.push(row);
        row = [];
        if (char === '\r' && text[i + 1] === '\n') i++;
      }
    } else field += char;
  }
  if (quoted) throw new Error('식당 CSV의 따옴표를 확인해주세요.');
  if (field || row.length) { row.push(field); rows.push(row); }
  const [headers, ...records] = rows;
  const required = ['id', 'name', 'latitude', 'longitude', 'rating', 'author', 'review'];
  if (!headers || required.some(key => !headers.includes(key))) throw new Error('식당 CSV의 열 이름을 확인해주세요.');
  const ids = new Set();
  return records.map((values, index) => {
    const record = Object.fromEntries(headers.map((key, i) => [key, values[i]]));
    const place = {
      id: record.id, name: record.name,
      lat: Number(record.latitude), lng: Number(record.longitude), rating: Number(record.rating),
      author: record.author, review: record.review,
    };
    if (values.length !== headers.length || required.some(key => !record[key]?.trim())
      || ids.has(place.id) || !Number.isFinite(place.lat) || Math.abs(place.lat) > 90
      || !Number.isFinite(place.lng) || Math.abs(place.lng) > 180
      || !Number.isFinite(place.rating) || place.rating < 0 || place.rating > 5) {
      throw new Error(`식당 CSV ${index + 2}행의 값을 확인해주세요.`);
    }
    ids.add(place.id);
    return place;
  });
}
