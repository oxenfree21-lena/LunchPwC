// Restaurant ids with photos in public/restaurants/{id}_01.jpg ~ _03.jpg.
// Originals from the content team are resized to 480px JPEG before adding here.
const photoIds = new Set(Array.from({ length: 22 }, (_, index) => String(index + 1)));

export function restaurantPhotos(id) {
  return photoIds.has(String(id)) ? ['01', '02', '03'].map(index => `/restaurants/${id}_${index}.jpg`) : [];
}
