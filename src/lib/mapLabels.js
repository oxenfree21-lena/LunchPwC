const intersects = (a, b) => a.x < b.x + b.width && a.x + a.width > b.x
  && a.y < b.y + b.height && a.y + a.height > b.y;

// Pixel spacing naturally reveals more labels as geographic points spread on zoom.
// Higher-rated restaurants represent crowded areas; id breaks ties consistently.
export function layoutMapLabels(points, viewport, obstacles = []) {
  const visible = points.filter(p => p.x >= viewport.left && p.x <= viewport.right
    && p.y >= viewport.top && p.y <= viewport.bottom);
  const ordered = [...visible].sort((a, b) => b.rating - a.rating || String(a.id).localeCompare(String(b.id), 'en', { numeric: true }));
  const dots = visible.map(p => ({ x: p.x - 8, y: p.y - 8, width: 16, height: 16 }));
  const occupied = [...obstacles];
  const representatives = [];
  const positions = new Map();
  for (const point of ordered) {
    if (representatives.some(p => Math.hypot(p.x - point.x, p.y - point.y) < 48)) continue;
    const { x, y, width, height } = point;
    // Labels always stay centered below their dot, even near viewport edges.
    const dx = -width / 2, dy = 12;
    const box = { x: x + dx - 4, y: y + dy - 4, width: width + 8, height: height + 8 };
    if (box.x < viewport.left + 4 || box.y < viewport.top + 4
      || box.x + box.width > viewport.right - 4 || box.y + box.height > viewport.bottom - 4
      || occupied.some(other => intersects(box, other)) || dots.some(dot => intersects(box, dot))) continue;
    positions.set(point.id, { left: dx + 6, top: dy + 6 });
    occupied.push(box);
    representatives.push(point);
  }
  return positions;
}
