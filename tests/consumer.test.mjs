/* Author: Codex | Project: Polaris | Date: 2026-09-27
 * File: consumer.test.mjs | Description: Exercise public contracts as independent vanilla consumers would. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createDesignEngine, createContentEngine, selectedFontCSS } from '../packages/design-system/src/engine.js';

/** A small app owns its role choices without importing the showcase fixtures. */
function appProfile() {
  const shades = { 100: '#ffffff', 300: '#cccccc', 500: '#777777', 700: '#333333', 900: '#000000' };
  const fontRole = { font: 'interface', weight: 400, size: 16, lineHeight: 1.5, tracking: 0, width: 100 };
  return {
    version: 1, id: 'consumer', revision: 'initial', label: 'Independent consumer',
    palette: Object.fromEntries(['neutral', 'primary', 'secondary', 'accent'].map(name => [name, { ...shades }])),
    semantic: {
      page: 'neutral.900', surface: 'neutral.700', surfaceRaised: 'neutral.500', surfaceInset: 'neutral.900',
      text: 'neutral.100', textMuted: 'neutral.300', border: 'neutral.500', focus: 'accent.100',
      primaryFill: 'primary.500', primaryText: 'neutral.100', secondaryFill: 'neutral.100', secondaryText: 'neutral.900',
      headerFill: 'neutral.700', headerText: 'neutral.100',
    },
    status: { success: '#008844', warning: '#cc8800', error: '#cc0000', info: '#0066cc' },
    data: ['#cc0000', '#0066cc'], media: ['#008844', '#cc8800'],
    material: { opacity: 0.8, blur: 20, saturation: 1.2, borderOpacity: 0.15 },
    fonts: {
      interface: { family: 'Consumer Sans', fallback: 'sans-serif', assets: [{ url: '/fonts/interface.ttf', weight: '200 900', style: 'normal' }], axes: { wght: [200, 900], wdth: [75, 125] }, weights: [400] },
      technical: { family: 'Consumer Mono', fallback: 'monospace', assets: [{ url: '/fonts/technical.woff2', weight: '400', style: 'normal' }], axes: {}, weights: [400] },
      unused: { family: 'Unused Script', fallback: 'cursive', assets: [{ url: '/fonts/unused.woff2', weight: '400', style: 'normal' }], axes: {}, weights: [400] },
    },
    typography: { scale: 1, roles: { sans_body: { ...fontRole }, control: { ...fontRole }, mono: { ...fontRole, font: 'technical', width: null } } },
    personal: ['material.blur', 'typography.scale'],
  };
}

/** In-memory DOM/storage ports make actual applied values observable without a browser. */
function ports() {
  const values = new Map(), storageValues = new Map(), stylesheets = [];
  const target = {
    style: {
      getPropertyValue: name => values.get(name)?.value ?? '',
      getPropertyPriority: name => values.get(name)?.priority ?? '',
      setProperty: (name, value, priority = '') => values.set(name, { value, priority }),
      removeProperty: name => values.delete(name),
    },
    ownerDocument: {
      head: { append: element => stylesheets.push(element) },
      createElement: () => ({ dataset: {}, textContent: '', remove() { stylesheets.splice(stylesheets.indexOf(this), 1); } }),
    },
  };
  const storage = {
    getItem: key => storageValues.get(key) ?? null,
    setItem: (key, value) => storageValues.set(key, value),
    removeItem: key => storageValues.delete(key),
  };
  return { target, storage, values, storageValues, stylesheets };
}

test('a secondary white action can change independently of white foreground text and media', () => {
  const io = ports(), engine = createDesignEngine({ profile: appProfile(), mode: 'development', ...io });
  const next = engine.profile;
  next.semantic.secondaryFill = 'secondary.300';
  next.palette.secondary[300] = '#ffcc88';
  engine.preview(next);
  assert.equal(io.target.style.getPropertyValue('--polaris-secondary-fill'), '#ffcc88');
  assert.equal(io.target.style.getPropertyValue('--polaris-text'), '#ffffff');
  assert.equal(io.target.style.getPropertyValue('--polaris-media-1'), '#008844');
  assert.equal(io.target.style.getPropertyValue('--polaris-status-success'), '#008844');
  engine.dispose();
});

test('app launch restores a preview without mounting any lab and production ignores that experiment', () => {
  const storage = ports().storage;
  const first = createDesignEngine({ profile: appProfile(), mode: 'development', target: ports().target, storage });
  const next = first.profile;
  next.typography.roles.sans_body.width = 115;
  next.palette.neutral[900] = '#112233';
  first.preview(next);
  first.dispose();
  const dev = ports(), prod = ports();
  const restored = createDesignEngine({ profile: appProfile(), mode: 'development', target: dev.target, storage });
  const published = createDesignEngine({ profile: appProfile(), target: prod.target, storage });
  assert.equal(dev.target.style.getPropertyValue('--polaris-page'), '#112233');
  assert.equal(dev.target.style.getPropertyValue('--polaris-font-sans-body-width'), '115%');
  assert.equal(prod.target.style.getPropertyValue('--polaris-page'), '#000000');
  assert.equal(prod.target.style.getPropertyValue('--polaris-font-sans-body-width'), '100%');
  assert.notEqual(restored.storageKey, published.storageKey);
  assert.match(prod.stylesheets[0].textContent, /interface\.ttf/);
  assert.doesNotMatch(prod.stylesheets[0].textContent, /unused\.woff2/);
  restored.dispose(); published.dispose();
});

test('authorized production preferences survive reload while forbidden paths reject atomically', () => {
  const io = ports(), engine = createDesignEngine({ profile: appProfile(), ...io });
  engine.setPersonal({ 'typography.scale': 1.25 });
  const before = engine.export();
  assert.throws(() => engine.setPersonal({ 'material.opacity': 0.3 }));
  assert.equal(engine.export(), before);
  assert.equal(io.storage.getItem(engine.storageKey), JSON.stringify(JSON.parse(before)));
  assert.equal(io.target.style.getPropertyValue('--polaris-font-sans-body-size'), '20px');
  engine.dispose();
  const fresh = ports(), restored = createDesignEngine({ profile: appProfile(), target: fresh.target, storage: io.storage });
  assert.equal(fresh.target.style.getPropertyValue('--polaris-font-sans-body-size'), '20px');
  restored.reset();
  assert.equal(fresh.target.style.getPropertyValue('--polaris-font-sans-body-size'), '16px');
  assert.equal(io.storage.getItem(restored.storageKey), null);
  restored.dispose();
});

test('an app can opt into public color and font choices with capability validation', () => {
  const profile = appProfile();
  profile.personal.push('palette.secondary.300', 'semantic.secondaryFill', 'typography.roles.sans_body.font', 'typography.roles.sans_body.width');
  const io = ports(), engine = createDesignEngine({ profile, ...io });
  engine.setPersonal({ 'palette.secondary.300': '#aaddff', 'semantic.secondaryFill': 'secondary.300' });
  assert.equal(io.target.style.getPropertyValue('--polaris-secondary-fill'), '#aaddff');
  assert.equal(io.target.style.getPropertyValue('--polaris-text'), '#ffffff');
  const before = engine.export();
  assert.throws(() => engine.setPersonal({ 'typography.roles.sans_body.font': 'technical' }), /width/);
  assert.equal(engine.export(), before);
  engine.setPersonal({ 'typography.roles.sans_body.font': 'technical', 'typography.roles.sans_body.width': null });
  assert.equal(io.target.style.getPropertyValue('--polaris-font-sans-body-family'), '"Consumer Mono", monospace');
  engine.dispose();
});

test('a late invalid typography field cannot partially import preceding palette edits', () => {
  const io = ports(), engine = createDesignEngine({ profile: appProfile(), mode: 'development', ...io });
  const before = engine.export(), envelope = JSON.parse(before);
  envelope.value.palette.neutral[900] = '#abcdef';
  envelope.value.typography.roles.mono.width = 120;
  assert.throws(() => engine.import(JSON.stringify(envelope)), /width/);
  assert.equal(engine.export(), before);
  assert.equal(io.target.style.getPropertyValue('--polaris-page'), '#000000');
  assert.equal(io.storage.getItem(engine.storageKey), null);
  engine.dispose();
});

test('stale or corrupt persistence falls back to the approved profile and reports the error', () => {
  for (const saved of ['not json', JSON.stringify({ version: 99, app: 'consumer', revision: 'initial', kind: 'personal', value: {} })]) {
    const io = ports(), errors = [];
    io.storage.setItem('polaris:v1:consumer:initial:personal', saved);
    const engine = createDesignEngine({ profile: appProfile(), ...io, onError: error => errors.push(error) });
    assert.equal(io.target.style.getPropertyValue('--polaris-page'), '#000000');
    assert.equal(errors.length, 1);
    engine.dispose();
  }
});

test('disabled roles remove their tokens and font faces; disposal restores host-owned inline styles', () => {
  const io = ports();
  io.target.style.setProperty('--polaris-page', '#654321', 'important');
  const engine = createDesignEngine({ profile: appProfile(), mode: 'development', ...io });
  const next = engine.profile;
  delete next.typography.roles.mono;
  engine.preview(next);
  assert.equal(io.target.style.getPropertyValue('--polaris-font-mono-family'), '');
  assert.doesNotMatch(io.stylesheets[0].textContent, /technical\.woff2/);
  assert.doesNotMatch(selectedFontCSS(next), /unused\.woff2/);
  engine.dispose();
  assert.equal(io.target.style.getPropertyValue('--polaris-page'), '#654321');
  assert.equal(io.target.style.getPropertyPriority('--polaris-page'), 'important');
  assert.equal(io.stylesheets.length, 0);
  assert.throws(() => engine.preview(next), /disposed/);
});

test('content preview is isolated and cannot silently add unknown keys or modify production copy', () => {
  const defaults = { title: 'Library', count: '{count} songs' };
  const production = createContentEngine(defaults);
  const preview = createContentEngine(defaults, { mode: 'development' });
  preview.preview({ title: 'Collection', count: '{count} tracks' });
  assert.equal(preview.text('count', { count: 12 }), '12 tracks');
  assert.equal(production.text('title'), 'Library');
  assert.throws(() => production.preview(defaults), /development/);
  assert.throws(() => preview.preview({ ...defaults, surprise: 'Unexpected' }));
  assert.equal(preview.text('title'), 'Collection');
  assert.throws(() => preview.text('missing'));
  assert.throws(() => preview.text('count'));
});

test('invalid font asset configuration leaves the host untouched when mounting fails', () => {
  const io = ports();
  io.target.style.setProperty('--polaris-page', '#654321');
  assert.throws(() => createDesignEngine({ profile: appProfile(), ...io, assetBase: 'invalid base' }));
  assert.equal(io.target.style.getPropertyValue('--polaris-page'), '#654321');
  assert.equal(io.values.size, 1);
  assert.equal(io.stylesheets.length, 0);
});
