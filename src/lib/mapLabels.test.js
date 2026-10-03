import test from 'node:test';
import assert from 'node:assert/strict';
import { layoutMapLabels } from './mapLabels.js';

const viewport = { left: 0, top: 0, right: 800, bottom: 600 };
const point = (id, x, y, rating = 4) => ({ id, x, y, rating, width: 100, height: 32 });

test('crowded dots show one representative and reveal more when zoom spreads them', () => {
  const crowded = [point('1', 300, 300, 5), point('2', 320, 300), point('3', 340, 300)];
  assert.deepEqual([...layoutMapLabels(crowded, viewport).keys()], ['1']);
  const expanded = crowded.map(p => ({ ...p, x: 300 + (p.x - 300) * 8, y: 300 + (p.y - 300) * 8 }));
  assert.equal(layoutMapLabels(expanded, viewport).size, 3);
});

test('priority is stable regardless of data ordering', () => {
  const points = [point('10', 300, 300, 5), point('2', 300, 300, 5), point('1', 310, 300, 3)];
  assert.deepEqual([...layoutMapLabels(points, viewport).keys()], ['2']);
  assert.deepEqual([...layoutMapLabels([...points].reverse(), viewport).keys()], ['2']);
});

test('shown boxes do not overlap or extend outside the viewport', () => {
  const points = Array.from({ length: 40 }, (_, id) => point(String(id), 15 + id % 8 * 105, 20 + Math.floor(id / 8) * 55, id % 3 + 3));
  const positions = layoutMapLabels(points, viewport);
  assert.ok(positions.size > 0 && positions.size < points.length);
  const boxes = points.filter(p => positions.has(p.id)).map(p => {
    const offset = positions.get(p.id);
    return { x: p.x + offset.left - 6, y: p.y + offset.top - 6, width: p.width, height: p.height };
  });
  boxes.forEach((box, index) => {
    assert.ok(box.x >= 0 && box.y >= 0 && box.x + box.width <= 800 && box.y + box.height <= 600);
    for (const other of boxes.slice(index + 1)) {
      assert.ok(box.x + box.width <= other.x || other.x + other.width <= box.x
        || box.y + box.height <= other.y || other.y + other.height <= box.y);
    }
  });
});
