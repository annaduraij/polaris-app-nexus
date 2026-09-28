/* Author: Codex | Project: Polaris | Date: 2026-09-27
 * File: engine.js | Description: Long-lived, scoped design state with isolated preview and personal persistence. */
import { validateProfile, validateEnvelope, validateContent, applyPersonal, CONTRACT_VERSION } from './contracts.js';
const clone = value => structuredClone(value);
const kebab = value => value.replace(/[A-Z]/g, c => `-${c.toLowerCase()}`).replaceAll('_', '-');

export function compileTokens(profile) {
  validateProfile(profile);
  const vars = {};
  for (const [family, shades] of Object.entries(profile.palette)) for (const [shade, color] of Object.entries(shades)) vars[`--polaris-${family}-${shade}`] = color;
  for (const [role, ref] of Object.entries(profile.semantic)) { const [family, shade] = ref.split('.'); vars[`--polaris-${kebab(role)}`] = profile.palette[family][shade]; }
  for (const [role, color] of Object.entries(profile.status)) vars[`--polaris-status-${role}`] = color;
  for (const name of ['data', 'media']) profile[name].forEach((color, index) => { vars[`--polaris-${name}-${index + 1}`] = color; });
  vars['--polaris-glass-opacity'] = String(profile.material.opacity);
  vars['--polaris-glass-blur'] = `${profile.material.blur}px`;
  vars['--polaris-glass-saturation'] = String(profile.material.saturation);
  vars['--polaris-glass-border-opacity'] = String(profile.material.borderOpacity);
  for (const [role, spec] of Object.entries(profile.typography.roles)) {
    const font = profile.fonts[spec.font], prefix = `--polaris-font-${kebab(role)}`;
    vars[`${prefix}-family`] = ['system-ui', 'ui-monospace'].includes(font.family) ? `${font.family}, ${font.fallback}` : `"${font.family}", ${font.fallback}`;
    vars[`${prefix}-weight`] = String(spec.weight);
    vars[`${prefix}-size`] = `${spec.size * profile.typography.scale}px`;
    vars[`${prefix}-line-height`] = String(spec.lineHeight);
    vars[`${prefix}-tracking`] = `${spec.tracking}em`;
    vars[`${prefix}-width`] = spec.width === null ? 'normal' : `${spec.width}%`;
    vars[`${prefix}-variation`] = spec.width === null ? 'normal' : `"wdth" ${spec.width}, "wght" ${spec.weight}`;
  }
  return vars;
}

/** Inform authors when semantic foreground/background pairs miss normal-text contrast. */
export function contrastReport(profile) {
  const tokens = compileTokens(profile);
  const luminance = hex => {
    const rgb = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
    return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
  };
  return [['text', 'page'], ['text-muted', 'page'], ['primary-text', 'primary-fill'], ['secondary-text', 'secondary-fill'], ['header-text', 'header-fill']].map(([foreground, background]) => {
    const a = luminance(tokens[`--polaris-${foreground}`]), b = luminance(tokens[`--polaris-${background}`]);
    const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    return { foreground, background, ratio, passes: ratio >= 4.5 };
  });
}

/** Emit faces only for enabled roles, with real font-stretch ranges for variable width. */
export function selectedFontCSS(profile, assetBase) {
  validateProfile(profile);
  const selected = new Set(Object.values(profile.typography.roles).map(role => role.font));
  return [...selected].flatMap(id => {
    const font = profile.fonts[id];
    return font.assets.map(asset => {
      const url = assetBase ? new URL(asset.url, assetBase).href : asset.url;
      return `@font-face{font-family:"${font.family}";src:url("${url}");font-weight:${asset.weight};font-style:${asset.style};font-display:swap;${font.axes.wdth ? `font-stretch:${font.axes.wdth[0]}% ${font.axes.wdth[1]}%;` : ''}}`;
    });
  }).join('\n');
}

/** Mount once at application startup. Labs are disposable views of this engine. */
export function createDesignEngine({ profile, target = globalThis.document?.documentElement, mode = 'production', storage, assetBase, onError = () => {} } = {}) {
  validateProfile(profile);
  if (!['production', 'development', 'customization'].includes(mode)) throw new Error('mode must be production, development or customization');
  if (!target?.style) throw new Error('A target element with a style declaration is required');
  const approved = clone(profile), kind = mode === 'production' ? 'personal' : 'preview';
  // Public customization uses the same validated preview format, with independent browser storage.
  const scope = mode === 'customization' ? 'customization' : kind;
  const key = `polaris:v${CONTRACT_VERSION}:${profile.id}:${profile.revision}:${scope}`;
  let active = clone(approved), personal = {}, disposed = false;
  const listeners = new Set(), previous = new Map();
  let appliedKeys = [];
  let persistence = storage;
  if (storage === undefined && globalThis.window) { try { persistence = globalThis.localStorage; } catch (error) { onError(error); } }
  const doc = target.ownerDocument;
  let fontStyle;
  function checkAlive() { if (disposed) throw new Error('Design engine has been disposed'); }
  function notify() { for (const callback of listeners) { try { callback(clone(active)); } catch (error) { onError(error); } } }
  function prepare(next) { return { tokens: compileTokens(next), css: selectedFontCSS(next, assetBase) }; }
  function apply(next, prepared = prepare(next)) {
    const { tokens, css } = prepared;
    for (const name of appliedKeys) if (!(name in tokens)) {
      const [value, priority] = previous.get(name);
      value ? target.style.setProperty(name, value, priority) : target.style.removeProperty(name);
    }
    for (const [name, value] of Object.entries(tokens)) {
      if (!previous.has(name)) previous.set(name, [target.style.getPropertyValue(name), target.style.getPropertyPriority?.(name) ?? '']);
      target.style.setProperty(name, value);
    }
    if (fontStyle) fontStyle.textContent = css;
    active = clone(next); appliedKeys = Object.keys(tokens); notify();
  }
  function envelope(value) { return { version: CONTRACT_VERSION, app: approved.id, revision: approved.revision, kind, value: clone(value) }; }
  function fromPersonal(values) {
    return applyPersonal(approved, values);
  }
  function persistAndApply(value) {
    checkAlive();
    const data = envelope(value);
    validateEnvelope(data, approved, kind);
    const next = kind === 'preview' ? value : fromPersonal(value);
    const prepared = prepare(next);
    // Storage failure cannot publish a state the next reload would lose.
    persistence?.setItem(key, JSON.stringify(data));
    if (kind === 'personal') personal = clone(value);
    apply(next, prepared);
  }
  try {
    const stored = persistence?.getItem(key);
    if (stored) {
      if (stored.length > 150000) throw new Error('Stored preferences exceed 150 KB');
      const data = validateEnvelope(JSON.parse(stored), approved, kind);
      if (kind === 'personal') personal = clone(data.value);
      active = kind === 'preview' ? clone(data.value) : fromPersonal(data.value);
    }
  } catch (error) { onError(error); }
  const initialPrepared = prepare(active);
  fontStyle = doc?.createElement('style');
  if (fontStyle) { fontStyle.dataset.polarisFonts = profile.id; doc.head.append(fontStyle); }
  apply(active, initialPrepared);
  return {
    mode, storageKey: key,
    get profile() { return clone(active); },
    get approved() { return clone(approved); },
    subscribe(callback) { checkAlive(); listeners.add(callback); return () => listeners.delete(callback); },
    preview(next) { if (kind !== 'preview') throw new Error('Preview editing requires development or customization mode'); persistAndApply(next); },
    setPersonal(values) {
      if (mode !== 'production') throw new Error('Personal preferences belong to the production engine');
      persistAndApply({ ...personal, ...values });
    },
    reset() { checkAlive(); persistence?.removeItem(key); personal = {}; apply(approved); },
    export() { checkAlive(); return JSON.stringify(envelope(kind === 'preview' ? active : personal), null, 2); },
    import(text) {
      checkAlive();
      if (typeof text !== 'string' || text.length > 150000) throw new Error('Import must be JSON under 150 KB');
      const data = validateEnvelope(JSON.parse(text), approved, kind);
      persistAndApply(data.value);
    },
    dispose() {
      if (disposed) return;
      for (const [name, [value, priority]] of previous) value ? target.style.setProperty(name, value, priority) : target.style.removeProperty(name);
      fontStyle?.remove(); listeners.clear(); disposed = true;
    },
  };
}

/** Plain-text runtime copy lookup; generated declarations provide a closed key union. */
export function createContentEngine(defaults, { mode = 'production', app = 'content', revision = '1', storage, onError = () => {} } = {}) {
  validateContent(defaults);
  defaults = clone(defaults);
  if (!['production', 'development'].includes(mode)) throw new Error('Invalid content engine mode');
  if (!/^[a-z][a-z0-9_-]{0,63}$/.test(app) || typeof revision !== 'string' || !revision || revision.length > 80) throw new Error('Invalid content scope');
  let content = clone(defaults);
  const key = `polaris:v${CONTRACT_VERSION}:${app}:${revision}:content-preview`;
  const listeners = new Set();
  let persistence = storage;
  if (mode === 'development' && storage === undefined && globalThis.window) { try { persistence = globalThis.localStorage; } catch (error) { onError(error); } }
  const envelope = value => ({ version: CONTRACT_VERSION, app, revision, kind: 'content-preview', value: clone(value) });
  function validate(next) {
    validateContent(next, Object.keys(defaults));
    const params = value => [...new Set(value.match(/\{[a-zA-Z][a-zA-Z0-9_]*\}/g) ?? [])].sort().join(',');
    for (const name of Object.keys(defaults)) if (params(next[name]) !== params(defaults[name])) throw new Error(`Content placeholders must match: ${name}`);
  }
  function read(text) {
    if (typeof text !== 'string' || text.length > 150000) throw new Error('Content import must be JSON under 150 KB');
    const data = JSON.parse(text);
    if (!data || Object.keys(data).sort().join(',') !== 'app,kind,revision,value,version' || data.version !== CONTRACT_VERSION || data.app !== app || data.revision !== revision || data.kind !== 'content-preview') throw new Error('Content preview scope does not match');
    validate(data.value); return data.value;
  }
  function notify() { for (const fn of listeners) { try { fn(clone(content)); } catch (error) { onError(error); } } }
  function preview(next) {
    if (mode !== 'development') throw new Error('Content previews are development-only');
    validate(next); persistence?.setItem(key, JSON.stringify(envelope(next))); content = clone(next); notify();
  }
  if (mode === 'development') { try { const stored = persistence?.getItem(key); if (stored) content = clone(read(stored)); } catch (error) { onError(error); } }
  return {
    storageKey: key,
    get content() { return clone(content); },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    text(key, values = {}) {
      if (!Object.hasOwn(content, key)) throw new Error(`Unknown content key: ${key}`);
      return content[key].replace(/\{([a-zA-Z][a-zA-Z0-9_]*)\}/g, (_, token) => {
        if (!Object.hasOwn(values, token) || !['string', 'number'].includes(typeof values[token])) throw new Error(`Missing text parameter: ${token}`);
        return String(values[token]);
      });
    },
    preview,
    export() { return JSON.stringify(envelope(content), null, 2); },
    import(text) { if (mode !== 'development') throw new Error('Content previews are development-only'); preview(read(text)); },
    reset() { if (mode === 'development') persistence?.removeItem(key); content = clone(defaults); notify(); },
  };
}
