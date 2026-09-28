/* Author: Codex | Project: Polaris | Date: 2026-09-27
 * File: header.test.mjs | Description: Weighted and measured responsive header layout invariants. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { planHeader } from '../packages/design-system/src/header.js';
const actions = (kind, count, side) => Array.from({ length: count }, (_, i) => ({ id: `${side}-${i}`, label: `Action ${i}`, kind, side }));
test('three icons or two rectangles fit each side, including four total rectangles', () => {
  for (const [kind, count] of [['icon', 3], ['button', 2]]) {
    const plan = planHeader([...actions(kind, count, 'left'), ...actions(kind, count, 'right')]);
    assert.equal(plan.overflow.length, 0); assert.deepEqual(plan.units, { left: 3, right: 3 });
  }
});
test('overflow trigger consumes one right unit, evicting actions if needed', () => {
  const plan = planHeader([...actions('icon', 4, 'left'), ...actions('button', 2, 'right')]);
  assert.equal(plan.left.length, 3); assert.equal(plan.right.length, 1); assert.equal(plan.overflow.length, 2); assert.deepEqual(plan.units, { left: 3, right: 2.5 });
});
test('real text widths can collapse actions before weighted capacity is reached', () => {
  const data = [...actions('button', 2, 'left'), ...actions('button', 2, 'right')];
  const plan = planHeader(data, { leftWidth: 140, rightWidth: 140, widths: Object.fromEntries(data.map(a => [a.id, 120])) });
  assert.equal(plan.left.length, 1); assert.equal(plan.right.length, 0); assert.equal(plan.overflow.length, 3);
});
test('priorities preserve the main action and all actions remain reachable exactly once', () => {
  const data = [...actions('button', 5, 'left'), ...actions('icon', 4, 'right')]; data[4].priority = 10;
  for (const width of [0, 40, 90, 160, 400, 900]) {
    const plan = planHeader(data, { leftWidth: width, rightWidth: width });
    assert.ok(plan.units.left <= 3 && plan.units.right <= 3);
    assert.equal(new Set([...plan.left, ...plan.right, ...plan.overflow].map(a => a.id)).size, data.length);
    assert.equal(plan.left.length + plan.right.length + plan.overflow.length, data.length);
    if (width >= 96) assert.ok(plan.left.some(a => a.id === 'left-4'));
  }
});
test('invalid or duplicate actions do not produce a layout', () => {
  const data = actions('icon', 1, 'left'); assert.throws(() => planHeader([...data, ...data])); assert.throws(() => planHeader([{ id: 'bad', kind: 'large', side: 'left' }]));
});
