/* Author: Codex | Project: Polaris | Date: 2026-09-27
 * File: glass-slider.test.mjs | Description: Gesture and control-reset regressions for Glass Lab ranges. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { bindGlassSlider } from '../packages/design-system/src/glass-slider.js';
import { POLARIS_MATERIAL, resetGlassControl, resolveGlass } from '../packages/design-system/src/glass.js';
function slider() {
  const events = new Map(), calls = { adjust: 0, reset: 0 };
  const input = { value: '50', min: '0', max: '100', step: '1',
    ownerDocument: { defaultView: { getComputedStyle: () => ({ direction: 'ltr' }) } },
    addEventListener: (name, callback) => events.set(name, callback), focus() {}, setPointerCapture() {}, releasePointerCapture() {},
    getBoundingClientRect: () => ({ width: 216 }) };
  bindGlassSlider(input, { adjust: () => calls.adjust++, reset: () => { calls.reset++; input.value = '28'; } });
  const send = (name, values = {}) => events.get(name)?.({ pointerId: 1, button: 0, clientX: 10, clientY: 10, preventDefault() {}, ...values });
  return { input, send, calls };
}
test('track click prevents the native jump and resets; dragging adjusts without resetting', () => {
  const s = slider(); let prevented = false;
  s.send('pointerdown', { preventDefault: () => { prevented = true; } }); s.send('pointerup');
  assert.equal(prevented, true); assert.equal(s.calls.reset, 1); assert.equal(s.calls.adjust, 0); assert.equal(s.input.value, '28');
  s.send('pointerdown'); s.send('pointermove', { clientX: 50 }); s.send('pointerup', { clientX: 50 });
  assert.equal(s.input.value, '48'); assert.equal(s.calls.adjust, 1); assert.equal(s.calls.reset, 1);
});
test('cancelled gestures do not reset; native input and keyboard reset remain available', () => {
  const s = slider(); s.send('pointerdown'); s.send('pointercancel'); s.send('pointerup');
  assert.equal(s.calls.reset, 0);
  s.send('input'); assert.equal(s.calls.adjust, 1);
  s.send('keydown', { key: 'ArrowRight' }); assert.equal(s.calls.reset, 0);
  s.send('keydown', { key: 'Delete' }); assert.equal(s.calls.reset, 1);
  s.send('pointerdown', { button: 2 }); s.send('pointerup'); assert.equal(s.calls.reset, 1);
});
test('shared reset restores exact app role values only for that control', () => {
  const approved = { ...POLARIS_MATERIAL, layers: { surface: { opacity: .86, saturation: 1, borderOpacity: .08 } } };
  const edited = { ...POLARIS_MATERIAL, opacity: .1, blur: 56, layers: { surface: { opacity: .3, blur: 4, saturation: 2, borderOpacity: .9, tint: 'primaryFill' } } };
  const reset = resetGlassControl(edited, approved, 'transmission');
  assert.equal(reset.opacity, approved.opacity); assert.equal(reset.layers.surface.opacity, .86);
  assert.equal(reset.blur, 56); assert.equal(reset.layers.surface.blur, 4); assert.equal(reset.layers.surface.tint, 'primaryFill');
  const split = resetGlassControl(edited, approved, 'effect', 'surface');
  assert.equal(split.layers.surface.saturation, 1); assert.equal(split.layers.surface.borderOpacity, .08);
  assert.equal(split.layers.surface.opacity, .3); assert.equal(split.opacity, .1);
  assert.deepEqual(resolveGlass(split).functional, resolveGlass(edited).functional);
});
