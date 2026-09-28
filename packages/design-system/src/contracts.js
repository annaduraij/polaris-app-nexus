/* Author: Codex | Project: Polaris | Date: 2026-09-27
 * File: contracts.js | Description: Strict runtime validation for version-one design contracts. */

export const CONTRACT_VERSION = 1;
export const FAMILIES = ['neutral', 'primary', 'secondary', 'accent'];
export const SHADES = ['100', '300', '500', '700', '900'];
export const TYPE_ROLES = ['serif_heading', 'sans_heading', 'serif_body', 'sans_body', 'label', 'control', 'script', 'mono'];
export const SEMANTIC_ROLES = ['page', 'surface', 'surfaceRaised', 'surfaceInset', 'text', 'textMuted', 'border', 'focus', 'primaryFill', 'primaryText', 'secondaryFill', 'secondaryText', 'headerFill', 'headerText'];
export const PERSONAL_PATHS = ['material.opacity', 'material.blur', 'typography.scale'];
export function isPersonalPath(path) {
  return typeof path === 'string' && (PERSONAL_PATHS.includes(path) || /^palette\.(neutral|primary|secondary|accent)\.(100|300|500|700|900)$/.test(path) || SEMANTIC_ROLES.some(role => path === `semantic.${role}`) || TYPE_ROLES.some(role => ['font', 'weight', 'size', 'lineHeight', 'tracking', 'width'].some(field => path === `typography.roles.${role}.${field}`)));
}
export function applyPersonal(profile, values) {
  const candidate = structuredClone(profile);
  for (const [path, value] of Object.entries(values)) {
    ensure(profile.personal.includes(path) && isPersonalPath(path), `personal.${path}`, 'override is not permitted');
    const keys = path.split('.');
    let target = candidate;
    for (const key of keys.slice(0, -1)) { ensure(target && Object.hasOwn(target, key), `personal.${path}`, 'role must already be enabled'); target = target[key]; }
    target[keys.at(-1)] = value;
  }
  return candidate;
}
const ID = /^[a-z][a-z0-9_-]{0,63}$/;
const HEX = /^#[0-9a-f]{6}$/i;
const REF = /^(neutral|primary|secondary|accent)\.(100|300|500|700|900)$/;
export class ContractError extends Error {
  constructor(path, message) { super(`${path}: ${message}`); this.name = 'ContractError'; }
}
function ensure(condition, path, message) { if (!condition) throw new ContractError(path, message); }
function object(value, path, keys, required = keys) {
  ensure(value !== null && typeof value === 'object' && !Array.isArray(value) && [Object.prototype, null].includes(Object.getPrototypeOf(value)), path, 'must be a plain object');
  for (const key of Object.keys(value)) ensure(keys.includes(key), `${path}.${key}`, 'unknown field');
  for (const key of required) ensure(Object.hasOwn(value, key), `${path}.${key}`, 'required');
}
function number(value, path, min, max) { ensure(typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max, path, `must be between ${min} and ${max}`); }
function string(value, path, max = 200) { ensure(typeof value === 'string' && value.length > 0 && value.length <= max && !/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value), path, 'must be nonempty text'); }
function identifier(value, path) { ensure(typeof value === 'string' && ID.test(value), path, 'must be a lowercase identifier'); }
export function validateCatalog(catalog) {
  object(catalog, 'fonts', Object.keys(catalog));
  ensure(Object.keys(catalog).length > 0 && Object.keys(catalog).length <= 80, 'fonts', 'requires 1–80 entries');
  for (const [id, font] of Object.entries(catalog)) {
    identifier(id, `fonts.${id}`);
    const p = `fonts.${id}`;
    object(font, p, ['family', 'fallback', 'assets', 'axes', 'weights']);
    string(font.family, `${p}.family`, 100);
    ensure(!/["'{};\\\n]/.test(font.family), `${p}.family`, 'unsafe family name');
    ensure(['serif', 'sans-serif', 'monospace', 'cursive', 'system-ui'].includes(font.fallback), `${p}.fallback`, 'invalid generic family');
    ensure(Array.isArray(font.assets) && font.assets.length <= 12, `${p}.assets`, 'must be an asset list');
    object(font.axes, `${p}.axes`, ['wght', 'wdth'], []);
    for (const [axis, range] of Object.entries(font.axes)) {
      ensure(Array.isArray(range) && range.length === 2, `${p}.axes.${axis}`, 'requires min and max');
      range.forEach((n, i) => number(n, `${p}.axes.${axis}.${i}`, axis === 'wght' ? 1 : 25, axis === 'wght' ? 1000 : 200));
      ensure(range[0] <= range[1], `${p}.axes.${axis}`, 'range must ascend');
    }
    ensure(Array.isArray(font.weights) && font.weights.length > 0, `${p}.weights`, 'requires supported weights');
    font.weights.forEach((n, i) => number(n, `${p}.weights.${i}`, 1, 1000));
    for (const [i, asset] of font.assets.entries()) {
      object(asset, `${p}.assets.${i}`, ['url', 'weight', 'style']);
      ensure(typeof asset.url === 'string' && /^(?:\.\.?\/|\/|https:\/\/)[^\s"'(){};\\]+\.(?:woff2|ttf)$/.test(asset.url), `${p}.assets.${i}.url`, 'requires a safe font URL');
      ensure(typeof asset.weight === 'string' && /^\d{1,4}(?: \d{1,4})?$/.test(asset.weight), `${p}.assets.${i}.weight`, 'invalid weight descriptor');
      const weights = asset.weight.split(' ').map(Number);
      ensure(weights.every(n => n >= 1 && n <= 1000) && (weights.length === 1 || weights[0] <= weights[1]), `${p}.assets.${i}.weight`, 'invalid weight range');
      ensure(['normal', 'italic'].includes(asset.style), `${p}.assets.${i}.style`, 'invalid style');
    }
  }
  return catalog;
}

/** Validate a complete profile before touching CSS, storage, or active engine state. */
export function validateProfile(profile) {
  object(profile, 'profile', ['version', 'id', 'revision', 'label', 'palette', 'semantic', 'status', 'data', 'media', 'material', 'fonts', 'typography', 'personal']);
  ensure(profile.version === CONTRACT_VERSION, 'profile.version', 'unsupported contract version');
  identifier(profile.id, 'profile.id');
  string(profile.revision, 'profile.revision', 80);
  string(profile.label, 'profile.label', 100);
  object(profile.palette, 'palette', FAMILIES);
  for (const family of FAMILIES) {
    object(profile.palette[family], `palette.${family}`, SHADES);
    for (const shade of SHADES) ensure(HEX.test(profile.palette[family][shade]), `palette.${family}.${shade}`, 'must be a six-digit hex color');
  }
  object(profile.semantic, 'semantic', SEMANTIC_ROLES);
  for (const [name, reference] of Object.entries(profile.semantic)) ensure(typeof reference === 'string' && REF.test(reference), `semantic.${name}`, 'must reference a family shade');
  object(profile.status, 'status', ['success', 'warning', 'error', 'info']);
  for (const [key, color] of Object.entries(profile.status)) ensure(HEX.test(color), `status.${key}`, 'must be a hex color');
  for (const name of ['data', 'media']) {
    ensure(Array.isArray(profile[name]) && profile[name].length >= 1 && profile[name].length <= (name === 'media' ? 5 : 12), name, 'invalid palette length');
    profile[name].forEach((color, i) => ensure(HEX.test(color), `${name}.${i}`, 'must be a hex color'));
  }
  object(profile.material, 'material', ['opacity', 'blur', 'saturation', 'borderOpacity', 'tint', 'layers'], ['opacity', 'blur', 'saturation', 'borderOpacity']);
  if (profile.material.tint !== undefined) ensure(SEMANTIC_ROLES.includes(profile.material.tint), 'material.tint', 'must reference a semantic color');
  if (profile.material.layers !== undefined) {
    object(profile.material.layers, 'material.layers', ['background', 'container', 'surface', 'functional'], []);
    for (const [role, layer] of Object.entries(profile.material.layers)) {
      const path = `material.layers.${role}`;
      object(layer, path, ['opacity', 'blur', 'saturation', 'borderOpacity', 'tint'], []);
      for (const [key, max] of [['opacity', 1], ['blur', 60], ['saturation', 2], ['borderOpacity', 1]]) if (layer[key] !== undefined) number(layer[key], `${path}.${key}`, 0, max);
      if (layer.tint !== undefined) ensure(SEMANTIC_ROLES.includes(layer.tint), `${path}.tint`, 'must reference a semantic color');
    }
  }
  number(profile.material.opacity, 'material.opacity', 0, 1);
  number(profile.material.blur, 'material.blur', 0, 60);
  number(profile.material.saturation, 'material.saturation', 0, 2);
  number(profile.material.borderOpacity, 'material.borderOpacity', 0, 1);
  validateCatalog(profile.fonts);
  object(profile.typography, 'typography', ['scale', 'roles']);
  number(profile.typography.scale, 'typography.scale', 0.75, 2);
  object(profile.typography.roles, 'typography.roles', TYPE_ROLES, []);
  ensure(Object.keys(profile.typography.roles).length > 0, 'typography.roles', 'requires at least one role');
  for (const [role, spec] of Object.entries(profile.typography.roles)) {
    const p = `typography.roles.${role}`;
    object(spec, p, ['font', 'weight', 'size', 'lineHeight', 'tracking', 'width']);
    const font = profile.fonts[spec.font];
    ensure(Boolean(font), `${p}.font`, 'font is not in the catalog');
    number(spec.weight, `${p}.weight`, 1, 1000);
    ensure(font.axes.wght ? spec.weight >= font.axes.wght[0] && spec.weight <= font.axes.wght[1] : font.weights.includes(spec.weight), `${p}.weight`, 'unsupported font weight');
    number(spec.size, `${p}.size`, 8, 120);
    number(spec.lineHeight, `${p}.lineHeight`, 0.8, 2.5);
    number(spec.tracking, `${p}.tracking`, -0.1, 0.5);
    if (font.axes.wdth) number(spec.width, `${p}.width`, ...font.axes.wdth);
    else ensure(spec.width === null, `${p}.width`, 'font has no width axis; use null');
  }
  ensure(Array.isArray(profile.personal) && new Set(profile.personal).size === profile.personal.length, 'personal', 'must be a unique permission list');
  for (const path of profile.personal) ensure(isPersonalPath(path), 'personal', `unsupported override ${path}`);
  return profile;
}

export function validateContent(value, expectedKeys) {
  object(value, 'content', expectedKeys ?? Object.keys(value));
  ensure(Object.keys(value).length > 0 && Object.keys(value).length < 1000, 'content', 'requires 1–999 keys');
  for (const [key, copy] of Object.entries(value)) {
    ensure(/^[a-z][a-zA-Z0-9_.-]*$/.test(key) && !['__proto__', 'constructor', 'prototype'].includes(key), `content.${key}`, 'invalid key');
    string(copy, `content.${key}`, 4000);
  }
  return value;
}

export function validateEnvelope(value, profile, kind) {
  object(value, 'preferences', ['version', 'app', 'revision', 'kind', 'value']);
  ensure(value.version === CONTRACT_VERSION && value.app === profile.id && value.revision === profile.revision && value.kind === kind, 'preferences', 'version, app, revision or preference kind does not match');
  if (kind === 'preview') {
    validateProfile(value.value);
    ensure(value.value.id === profile.id && value.value.revision === profile.revision, 'preferences.value', 'profile identity does not match');
  } else {
    object(value.value, 'preferences.value', profile.personal, []);
    validateProfile(applyPersonal(profile, value.value));
  }
  return value;
}
