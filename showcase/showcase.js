/* Author: Codex | Project: Polaris | Date: 2026-09-27
 * File: showcase.js | Description: Real vanilla and React consumers of the packaged design engines. */
import { createDesignEngine, createContentEngine, mountHeader, FAMILIES, SHADES, TYPE_ROLES, contrastReport } from './runtime/src/index.js';
import { profiles } from './runtime/generated/profiles.js';
import { content } from './runtime/generated/content.js';

const params = new URLSearchParams(location.search);
const app = params.get('app') === 'lyra' ? 'lyra' : 'photography';
const mode = params.get('mode') === 'production' ? 'production' : 'development';
const engine = createDesignEngine({ profile: profiles[app], mode, target: document.documentElement, assetBase: new URL('./runtime/', import.meta.url), onError: error => console.warn('Polaris preferences:', error.message) });
const copy = createContentEngine(content, { mode, app, revision: '2026-09-27.1' });
const $ = id => document.getElementById(id);
const text = key => copy.text(key);
const node = (tag, className, value) => { const item = document.createElement(tag); if (className) item.className = className; if (value !== undefined) item.textContent = value; return item; };
function applyCopy() { document.querySelectorAll('[data-copy]').forEach(item => { item.textContent = text(item.dataset.copy); }); }
applyCopy();
for (const name of ['lyra', 'photography']) { const link = $(`${name}-link`); link.href = `?app=${name}&mode=${mode}`; if (app === name) link.setAttribute('aria-current', 'page'); }
for (const name of ['production', 'development']) { const link = $(`${name}-link`); link.href = `?app=${app}&mode=${name}`; if (mode === name) link.setAttribute('aria-current', 'page'); }
$('mode-description').textContent = text(mode === 'development' ? 'showcase.developmentHint' : 'showcase.productionHint');
if (mode === 'development') {
  const [{ mountLabs }, { developerFonts }] = await Promise.all([import('./runtime/src/labs.js'), import('./runtime/generated/developer-fonts.js')]);
  mountLabs(engine, { fonts: developerFonts });
} else {
  $('personal-settings').hidden = false;
  $('personal-scale').value = engine.profile.typography.scale; $('personal-value').textContent = `${engine.profile.typography.scale}×`;
  $('personal-scale').addEventListener('input', () => { try { engine.setPersonal({ 'typography.scale': Number($('personal-scale').value) }); $('personal-value').textContent = `${engine.profile.typography.scale}×`; } catch (error) { $('action-status').textContent = error.message; } });
  $('reset-personal').addEventListener('click', () => { engine.reset(); $('personal-scale').value = engine.profile.typography.scale; $('personal-value').textContent = `${engine.profile.typography.scale}×`; });
}

const icons = { home: '⌂', search: '⌕', library: '♫', share: '↗', settings: '⚙', help: '?' };
function actionsFor(example) {
  const values = example === 'icons' ? [['home', 'icon', 'left'], ['search', 'icon', 'left'], ['library', 'icon', 'left'], ['share', 'icon', 'right'], ['settings', 'icon', 'right'], ['help', 'icon', 'right']]
    : example === 'buttons' ? [['home', 'button', 'left'], ['library', 'button', 'left'], ['about', 'button', 'right'], ['contact', 'button', 'right']]
      : example === 'overflow' ? [['home', 'button', 'left'], ['library', 'button', 'left'], ['search', 'icon', 'left'], ['about', 'button', 'right'], ['contact', 'button', 'right'], ['settings', 'icon', 'right'], ['help', 'icon', 'right']]
        : [['home', 'icon', 'left'], ['library', 'button', 'left'], ['about', 'button', 'right'], ['contact', 'button', 'right']];
  return values.map(([id, kind, side], i) => ({ id, kind, side, icon: icons[id], label: text(`header.${id}`), priority: i === 0 ? 10 : 0, onClick: () => { $('action-status').textContent = copy.text('header.actionFeedback', { action: text(`header.${id}`) }); } }));
}
let header, reactConsumer;
const brand = { label: app === 'lyra' ? 'Lyra' : 'Photography', image: app === 'lyra' ? '../brand/lyra.png' : '../logo.svg', href: './' };
function mountReferenceHeader() {
  const actions = actionsFor($('header-example').value);
  if (reactConsumer) reactConsumer.setHeader({ brand, actions });
  else { header?.dispose(); header = mountHeader({ container: $('header'), brand, actions }); }
  $('header-units').textContent = text(`showcase.header${$('header-example').value[0].toUpperCase()}${$('header-example').value.slice(1)}`);
}
if (app === 'photography') {
  const { mountPhotography } = await import('./photography.js');
  reactConsumer = mountPhotography({ engine, copy, headerContainer: $('header'), container: $('consumer') });
} else {
  $('consumer').classList.add('lyra-reference');
  const artwork = node('div', 'album-art'); artwork.setAttribute('aria-hidden', 'true'); artwork.append(node('div', 'vinyl-disc'));
  const panel = node('div', 'consumer-copy');
  const label = node('p', 'eyebrow', text('showcase.labelSample')); label.dataset.polarisRole = 'label';
  const title = node('h2', '', text('showcase.lyraHeading')); title.dataset.polarisRole = 'sans_heading';
  const description = node('p', '', text('showcase.lyraBody')); description.dataset.polarisRole = 'sans_body';
  const actions = node('div', 'consumer-actions');
  for (const kind of ['primary', 'secondary']) { const action = node('button', `polaris-button polaris-button-${kind}`, text(`showcase.${kind}Action`)); action.addEventListener('click', () => { $('action-status').textContent = copy.text('header.actionFeedback', { action: action.textContent }); }); actions.append(action); }
  const id = node('p', 'consumer-id', text('showcase.monoSample')); id.dataset.polarisRole = 'mono';
  panel.append(label, title, description, actions, id); $('consumer').append(artwork, panel);
}
mountReferenceHeader(); $('header-example').addEventListener('change', mountReferenceHeader);

function renderReference(profile) {
  const palette = $('palette'); palette.replaceChildren();
  for (const family of FAMILIES) {
    const card = node('article', 'palette-card'); card.append(node('h3', '', text(`lab.${family}`)));
    const shades = node('div', 'swatch-row');
    for (const shade of SHADES) { const swatch = node('div', 'swatch'); swatch.style.background = profile.palette[family][shade]; swatch.title = `${family} ${shade}: ${profile.palette[family][shade]}`; swatch.setAttribute('aria-label', swatch.title); shades.append(swatch); }
    card.append(shades, node('p', 'palette-caption', profile.palette[family]['500'])); palette.append(card);
  }
  const semantic = $('semantic-preview'); semantic.replaceChildren();
  for (const result of contrastReport(profile)) { const item = node('span', 'contrast-chip', `${result.foreground} / ${result.background} · ${result.ratio.toFixed(1)}:1`); item.dataset.pass = result.passes; semantic.append(item); }
  const type = $('typography'); type.replaceChildren();
  const samples = { serif_heading: 'serifHeadingSample', sans_heading: 'sansHeadingSample', serif_body: 'serifBodySample', sans_body: 'sansBodySample', label: 'labelSample', control: 'controlSample', script: 'scriptSample', mono: 'monoSample' };
  for (const role of TYPE_ROLES) {
    const spec = profile.typography.roles[role], card = node('article', `type-card${spec ? '' : ' disabled-role'}`);
    card.append(node('h3', 'type-label', text(`role.${role}`)));
    if (spec) { const sample = node('p', 'type-sample', text(`showcase.${samples[role]}`)); sample.dataset.polarisRole = role; card.append(sample, node('p', 'type-meta', `${profile.fonts[spec.font].family} · ${spec.weight} · ${spec.size}px${spec.width === null ? '' : ` · wdth ${spec.width}`}`)); }
    else card.append(node('p', '', text('showcase.optionalRole')));
    type.append(card);
  }
  $('material-values').textContent = `${text('lab.opacity')} ${Math.round(profile.material.opacity * 100)}% · ${text('lab.blur')} ${profile.material.blur}`;
  $('statuses').replaceChildren(...Object.keys(profile.status).map(role => { const item = node('span', 'status-chip', text(`showcase.${role}`)); item.style.color = `var(--polaris-status-${role})`; return item; }));
  for (const name of ['data', 'media']) $(name === 'data' ? 'data-palette' : 'media-palette').replaceChildren(...profile[name].map((color, i) => { const block = node('span'); block.style.background = color; block.title = `${name} ${i + 1}: ${color}`; block.setAttribute('aria-label', block.title); return block; }));
}
renderReference(engine.profile); engine.subscribe(renderReference);

if (mode === 'development') {
  const panel = $('content-editor'); panel.hidden = false;
  const title = node('h2', '', text('content.title')), description = node('p', '', text('content.description'));
  const label = node('label', 'content-label', text('content.label')), area = node('textarea'); area.rows = 4; area.value = text('showcase.description'); label.append(area);
  const controls = node('div', 'consumer-actions'), message = node('p'); message.setAttribute('role', 'status');
  for (const [key, action] of [['apply', () => { const next = { ...content, 'showcase.description': area.value }; copy.preview(next); applyCopy(); message.textContent = text('content.applied'); }], ['reset', () => { copy.reset(); area.value = text('showcase.description'); applyCopy(); message.textContent = text('content.resetDone'); }]]) { const button = node('button', 'polaris-button', text(`content.${key}`)); button.addEventListener('click', () => { try { action(); } catch (error) { message.textContent = error.message; } }); controls.append(button); }
  panel.append(title, description, label, controls, message);
}

// Read-only observability for the interactive reference; consumers use package exports.
globalThis.polarisShowcase = { engine, copy, get header() { return header; }, app, mode };
