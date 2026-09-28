/* Author: Codex | Project: Polaris | Date: 2026-09-27
 * File: runtime.test.mjs | Description: Persistence, lifecycle, import atomicity and YAML content engine regression tests. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { profiles } from '../packages/design-system/generated/profiles.js';
import { createDesignEngine, createContentEngine } from '../packages/design-system/src/engine.js';
function fixture() {
  const values = new Map(), styles = new Map();
  const storage = { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
  const target = { style: { setProperty: (key, value) => styles.set(key, value), removeProperty: key => styles.delete(key), getPropertyValue: key => styles.get(key) ?? '', getPropertyPriority: () => '' } };
  return { storage, target, styles, values };
}
test('developer edits hydrate before any lab exists, survive view subscription disposal, and stay out of production', () => {
  const f = fixture(), start = mode => createDesignEngine({ ...f, profile: profiles.lyra, mode });
  let engine = start('development'); const next = engine.profile; next.palette.primary['500'] = '#123456'; const off = engine.subscribe(() => {});
  engine.preview(next); off(); assert.equal(f.styles.get('--polaris-primary-fill'), '#123456'); engine.dispose();
  engine = start('development'); assert.equal(f.styles.get('--polaris-primary-fill'), '#123456'); engine.dispose();
  engine = start('production'); assert.equal(f.styles.get('--polaris-primary-fill'), profiles.lyra.palette.primary['500']); assert.throws(() => engine.preview(next), /development-only/);
});
test('invalid imports and failed storage writes leave current state intact', () => {
  const f = fixture(), engine = createDesignEngine({ ...f, profile: profiles.lyra, mode: 'development' });
  const before = engine.export(), imported = JSON.parse(before); imported.value.typography.roles.control.size = 900;
  assert.throws(() => engine.import(JSON.stringify(imported))); assert.equal(engine.export(), before);
  f.storage.setItem = () => { throw new Error('quota'); }; const next = engine.profile; next.material.blur = 11;
  assert.throws(() => engine.preview(next), /quota/); assert.equal(engine.export(), before); assert.equal(f.styles.get('--polaris-glass-blur'), '24px');
});
test('corrupt storage recovers approved defaults and reports the error', () => {
  const f = fixture(), errors = []; const initial = createDesignEngine({ ...f, profile: profiles.lyra, mode: 'development' }); const key = initial.storageKey; initial.dispose();
  f.storage.setItem(key, '{bad'); const engine = createDesignEngine({ ...f, profile: profiles.lyra, mode: 'development', onError: error => errors.push(error) });
  assert.equal(errors.length, 1); assert.equal(engine.profile.palette.primary['500'], profiles.lyra.palette.primary['500']);
});
test('personal preferences can only change approved paths, persist separately and reset', () => {
  const f = fixture(), engine = createDesignEngine({ ...f, profile: profiles.lyra });
  engine.setPersonal({ 'typography.scale': 1.25 }); assert.equal(engine.profile.typography.scale, 1.25);
  assert.throws(() => engine.setPersonal({ 'palette.primary.500': '#123456' }), /unknown field/);
  engine.reset(); assert.equal(engine.profile.typography.scale, 1); assert.equal(f.values.size, 0);
});
test('content is runtime safe, retains interpolation contracts and isolates developer persistence', () => {
  const { storage } = fixture(), defaults = { heading: 'Hello {name}', title: 'Approved copy' };
  const a = createContentEngine(defaults, { mode: 'development', storage, app: 'lyra' });
  a.preview({ heading: 'Welcome {name}', title: 'Preview' });
  const b = createContentEngine(defaults, { mode: 'development', storage, app: 'lyra' }); assert.equal(b.text('heading', { name: '<b>Jay</b>' }), 'Welcome <b>Jay</b>');
  assert.throws(() => b.text('missing')); assert.throws(() => b.text('heading')); assert.throws(() => b.preview({ heading: 'Hello {other}', title: 'Bad' }));
  assert.equal(createContentEngine(defaults, { mode: 'production', storage, app: 'lyra' }).text('title'), 'Approved copy');
  assert.throws(() => createContentEngine(defaults, { mode: 'production' }).preview(defaults));
  b.reset(); assert.equal(b.text('title'), 'Approved copy'); assert.equal(storage.getItem(b.storageKey), null);
});
