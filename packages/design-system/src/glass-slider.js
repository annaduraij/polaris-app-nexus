/* Author: Codex | Project: Polaris | Date: 2026-09-27
 * File: glass-slider.js | Description: Click-to-reset range gestures with relative dragging and native keyboard input. */
export function bindGlassSlider(input, { adjust, reset }) {
  let gesture;
  input.addEventListener('pointerdown', event => {
    if (event.button !== 0 || event.isPrimary === false) return;
    // Suppress the native track jump; only a drag deliberately edits the value.
    event.preventDefault(); input.focus(); input.setPointerCapture(event.pointerId);
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY, value: Number(input.value), dragged: false };
  });
  input.addEventListener('pointermove', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
    if (!gesture.dragged && Math.hypot(dx, dy) < 4) return;
    gesture.dragged = true;
    const min = Number(input.min), max = Number(input.max), step = Number(input.step) || 1;
    const direction = input.ownerDocument.defaultView.getComputedStyle(input).direction === 'rtl' ? -1 : 1;
    const value = gesture.value + direction * dx / Math.max(1, input.getBoundingClientRect().width - 16) * (max - min);
    input.value = String(Math.min(max, Math.max(min, min + Math.round((value - min) / step) * step)));
    adjust();
  });
  input.addEventListener('pointerup', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const shouldReset = !gesture.dragged; gesture = undefined;
    input.releasePointerCapture(event.pointerId);
    if (shouldReset) reset();
  });
  input.addEventListener('pointercancel', () => { gesture = undefined; });
  input.addEventListener('lostpointercapture', () => { gesture = undefined; });
  input.addEventListener('input', adjust);
  input.addEventListener('keydown', event => {
    if (event.key === 'Delete' || event.key === 'Backspace') { event.preventDefault(); reset(); }
  });
}
