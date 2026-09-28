/* Author: Codex | Project: Polaris | Date: 2026-09-27
 * File: glass.test.mjs | Description: Material role validation, coordinated editing and legacy preview compatibility. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { profiles } from '../packages/design-system/generated/profiles.js';
import { validateProfile, compileTokens, createDesignEngine, resolveGlass, editGlass, glassPreset, glassPresetName, glassSliderChanges, glassEffect, POLARIS_MATERIAL } from '../packages/design-system/src/index.js';
import Ajv from 'ajv/dist/2020.js';
import { readFileSync } from 'node:fs';
const profile = () => structuredClone(profiles.lyra);
const schema = new Ajv({ strict: false }).compile(JSON.parse(readFileSync(new URL('../packages/design-system/contracts/design-profile.v1.schema.json', import.meta.url))));
test('all four roles compile independently and semantic tint follows Chroma', () => {
  const p = profile(); p.material.layers = { surface: { opacity: .4, blur: 8, tint: 'primaryFill' } };
  validateProfile(p); assert.ok(schema(p));
  const tokens = compileTokens(p);
  assert.equal(tokens['--polaris-glass-surface-opacity'], '0.4');
  assert.equal(tokens['--polaris-glass-surface-blur'], '8px');
  p.palette.primary['500'] = '#123456';
  assert.equal(compileTokens(p)['--polaris-glass-surface-tint'], '#123456');
  assert.notEqual(tokens['--polaris-glass-container-opacity'], tokens['--polaris-glass-surface-opacity']);
});
test('split is isolated; shared changes preserve calibrated differences within limits', () => {
  const base = { ...POLARIS_MATERIAL, layers: { surface: { opacity: .8 }, functional: { blur: 12 } } };
  const split = editGlass(base, { opacity: .3, tint: 'primaryFill' }, 'surface');
  assert.deepEqual(resolveGlass(split).container, resolveGlass(base).container);
  assert.equal(resolveGlass(split).surface.opacity, .3);
  const shared = editGlass(base, { opacity: .82, blur: 30 });
  assert.equal(resolveGlass(shared).surface.opacity, .8714);
  assert.equal(resolveGlass(shared).functional.blur, 20);
  assert.equal(base.opacity, .72);
  for (const layer of Object.values(resolveGlass(editGlass(base, { opacity: 0, blur: 0 })))) { assert.equal(layer.opacity, 0); assert.equal(layer.blur, 0); }
  for (const layer of Object.values(resolveGlass(editGlass(base, { opacity: 1, blur: 60 })))) { assert.equal(layer.opacity, 1); assert.equal(layer.blur, 60); }
  assert.deepEqual(glassSliderChanges(base, 'clarity', 1), { blur: 0 });
  assert.deepEqual(glassSliderChanges(base, 'transmission', 1), { opacity: 0 });
  const effect = glassSliderChanges(base, 'effect', .8);
  assert.ok(effect.saturation > base.saturation && effect.borderOpacity > base.borderOpacity);
  for (const saturation of [0, .3, 1, 1.75, 2]) {
    const exact = { ...base, saturation };
    assert.equal(glassEffect({ ...exact, ...glassSliderChanges(exact, 'effect', .5) }), .5);
  }
});
test('Dramatic preserves app calibration; quieter presets and Polaris reset are material-only', () => {
  const base = { ...POLARIS_MATERIAL, layers: { surface: { blur: 0, tint: 'secondaryFill' } } };
  assert.deepEqual(glassPreset(base, 'dramatic'), base);
  for (const name of ['subdued', 'moderate', 'dramatic']) assert.equal(glassPresetName(glassPreset(base, name), base), name);
  assert.ok(glassPreset(base, 'subdued').opacity > glassPreset(base, 'moderate').opacity);
  const p = profile(), before = structuredClone(p);
  p.material = { ...POLARIS_MATERIAL, layers: resolveGlass(POLARIS_MATERIAL) };
  assert.deepEqual(p.palette, before.palette); assert.deepEqual(p.typography, before.typography);
});
test('runtime and JSON schema reject malformed layers and unsafe tint references', () => {
  for (const layers of [{ surprise: {} }, { surface: { blur: 61 } }, { background: { opacity: -1 } }, { functional: { tint: '#123456' } }, { surface: { bogus: true } }]) {
    const p = profile(); p.material.layers = layers;
    assert.throws(() => validateProfile(p)); assert.equal(schema(p), false);
  }
});
test('legacy previews gain calibrated roles without losing color or typography edits', () => {
  const approved = profile(); approved.material.layers = { functional: { opacity: .84, blur: 12 } };
  const saved = profile(); saved.material.opacity = .58; saved.palette.primary['500'] = '#112233'; saved.typography.scale = 1.2;
  const storage = { getItem: () => JSON.stringify({ version: 1, app: saved.id, revision: saved.revision, kind: 'preview', value: saved }) };
  const values = new Map();
  const engine = createDesignEngine({ profile: approved, mode: 'customization', storage,
    target: { style: { getPropertyValue: key => values.get(key) || '', setProperty: (key, value) => values.set(key, value), removeProperty: key => values.delete(key) } } });
  assert.equal(resolveGlass(engine.profile.material).functional.opacity, .7);
  assert.equal(engine.profile.palette.primary['500'], '#112233'); assert.equal(engine.profile.typography.scale, 1.2);
  engine.dispose();
});
