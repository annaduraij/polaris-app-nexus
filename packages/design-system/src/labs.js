/* Author: Codex | Project: Polaris | Date: 2026-09-27
 * File: labs.js | Description: Disposable, accessible developer controls over the long-lived design engine. */
import { FAMILIES, SHADES, TYPE_ROLES, validateCatalog } from './contracts.js';
import { content } from '../generated/content.js';
import { contrastReport } from './engine.js';

/** Optional development entry point: importing this module never creates a lab. */
export function mountLabs(engine, { container = document.body, fonts = {}, copy = content } = {}) {
  if (engine.mode !== 'development') return { dispose() {} };
  if (Object.keys(fonts).length) validateCatalog(fonts);
  const doc = container.ownerDocument;
  const t = key => copy[key] ?? content[key] ?? key;
  const launcher = doc.createElement('div'); launcher.className = 'polaris-lab-launcher';
  const dialogs = [], renderers = [];
  let activeRole = Object.keys(engine.profile.typography.roles)[0], internalChange = false, contrastContainer;
  const el = (tag, className, text) => { const node = doc.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; };
  const button = (text, click) => { const node = el('button', 'polaris-button', text); node.type = 'button'; node.addEventListener('click', click); return node; };
  function shell(name) {
    const dialog = el('dialog', 'polaris-lab'); dialog.setAttribute('aria-label', t(`lab.${name}`));
    const trigger = button(t(`lab.${name}`), () => dialog.showModal()); trigger.setAttribute('aria-haspopup', 'dialog');
    const head = el('header', 'polaris-lab-head');
    const close = button(t('lab.close'), () => dialog.close());
    head.append(el('h2', '', t(`lab.${name}`)), close);
    const body = el('div', 'polaris-lab-body'), status = el('p', 'polaris-lab-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    dialog.append(head, el('p', 'polaris-lab-note', t('lab.previewOnly')), body, status);
    dialog.addEventListener('close', () => trigger.focus());
    launcher.append(trigger); container.append(dialog); dialogs.push(dialog);
    return { body, status };
  }
  function update(mutate, status, rerender = false) {
    try {
      const next = engine.profile; mutate(next);
      internalChange = true; engine.preview(next); status.textContent = t('lab.updated'); refreshContrast();
      if (rerender) renderers.forEach(render => render());
    } catch (error) { status.textContent = error.message; if (rerender) renderers.forEach(render => render()); }
    finally { internalChange = false; }
  }
  function field(parent, label, value, options, change) {
    const wrapper = el('label', 'polaris-field'); wrapper.append(el('span', '', label));
    const input = el(options.choices ? 'select' : 'input');
    if (options.choices) for (const [key, title] of options.choices) { const option = el('option', '', title); option.value = key; input.append(option); }
    else { input.type = options.type ?? 'number'; if (options.min !== undefined) input.min = options.min; if (options.max !== undefined) input.max = options.max; if (options.step !== undefined) input.step = options.step; }
    input.value = value ?? ''; input.disabled = Boolean(options.disabled);
    input.addEventListener('change', () => { if (!input.checkValidity()) { input.reportValidity(); return; } change(input.type === 'number' ? Number(input.value) : input.value); });
    wrapper.append(input); parent.append(wrapper); return input;
  }
  function section(parent, title) { const group = el('fieldset', 'polaris-fieldset'); group.append(el('legend', '', title)); parent.append(group); return group; }
  function transfer(parent, status) {
    const group = section(parent, t('lab.transfer'));
    const wrapper = el('label', 'polaris-field'); wrapper.append(el('span', '', t('lab.transferLabel')));
    const area = el('textarea'); area.rows = 6; area.spellcheck = false; wrapper.append(area); group.append(wrapper);
    const row = el('div', 'polaris-lab-actions');
    row.append(button(t('lab.export'), () => { area.value = engine.export(); status.textContent = t('lab.exported'); area.focus(); area.select(); }), button(t('lab.import'), () => {
      try { engine.import(area.value); status.textContent = t('lab.imported'); } catch (error) { status.textContent = error.message; }
    }), button(t('lab.reset'), () => { try { engine.reset(); status.textContent = t('lab.resetDone'); } catch (error) { status.textContent = error.message; } }));
    group.append(row);
  }
  const chroma = shell('chroma');
  function refreshContrast() {
    if (!contrastContainer) return;
    contrastContainer.querySelectorAll('p').forEach(item => item.remove());
    for (const item of contrastReport(engine.profile)) contrastContainer.append(el('p', '', `${item.foreground} / ${item.background}: ${item.ratio.toFixed(2)}:1 · ${t(item.passes ? 'lab.contrastPass' : 'lab.contrastWarning')}`));
  }
  function renderChroma() {
    chroma.body.replaceChildren(); const profile = engine.profile;
    for (const family of FAMILIES) {
      const group = section(chroma.body, t(`lab.${family}`)); group.classList.add('polaris-shades');
      for (const shade of SHADES) field(group, `${t(`lab.${family}`)} ${shade}`, profile.palette[family][shade], { type: 'color' }, value => update(next => { next.palette[family][shade] = value; }, chroma.status));
    }
    const semantic = section(chroma.body, t('lab.semantic'));
    const choices = FAMILIES.flatMap(family => SHADES.map(shade => [`${family}.${shade}`, `${t(`lab.${family}`)} ${shade}`]));
    for (const [role, reference] of Object.entries(profile.semantic)) field(semantic, t(`semantic.${role}`), reference, { choices }, value => update(next => { next.semantic[role] = value; }, chroma.status));
    const material = section(chroma.body, t('lab.material'));
    for (const [key, min, max, step] of [['opacity', 0, 1, .01], ['blur', 0, 60, 1], ['saturation', 0, 2, .05], ['borderOpacity', 0, 1, .01]]) field(material, t(`lab.${key}`), profile.material[key], { min, max, step }, value => update(next => { next.material[key] = value; }, chroma.status));
    const status = section(chroma.body, t('lab.status'));
    for (const [role, color] of Object.entries(profile.status)) field(status, t(`showcase.${role}`), color, { type: 'color' }, value => update(next => { next.status[role] = value; }, chroma.status));
    for (const name of ['data', 'media']) {
      const group = section(chroma.body, t(`lab.${name}`)); group.classList.add('polaris-shades');
      profile[name].forEach((color, i) => field(group, `${t(`lab.${name}`)} ${i + 1}`, color, { type: 'color' }, value => update(next => { next[name][i] = value; }, chroma.status)));
    }
    contrastContainer = section(chroma.body, t('lab.contrast')); refreshContrast();
    transfer(chroma.body, chroma.status);
  }
  const typography = shell('typography');
  function renderTypography() {
    typography.body.replaceChildren(); const profile = engine.profile;
    field(typography.body, t('lab.scale'), profile.typography.scale, { min: .75, max: 2, step: .05 }, value => update(next => { next.typography.scale = value; }, typography.status));
    field(typography.body, t('lab.chooseRole'), activeRole, { choices: TYPE_ROLES.map(role => [role, t(`role.${role}`)]) }, value => { activeRole = value; renderTypography(); });
    const enabled = el('label', 'polaris-checkbox'), checkbox = el('input'); checkbox.type = 'checkbox'; checkbox.checked = Object.hasOwn(profile.typography.roles, activeRole);
    enabled.append(checkbox, el('span', '', t('lab.enabled'))); typography.body.append(enabled);
    checkbox.addEventListener('change', () => update(next => {
      if (checkbox.checked) { const first = Object.values(next.typography.roles)[0]; next.typography.roles[activeRole] = structuredClone(first); }
      else delete next.typography.roles[activeRole];
    }, typography.status, true));
    const spec = profile.typography.roles[activeRole];
    if (spec) {
      const catalog = { ...fonts, ...profile.fonts }, font = catalog[spec.font];
      const group = section(typography.body, t(`role.${activeRole}`));
      field(group, t('lab.font'), spec.font, { choices: Object.entries(catalog).map(([id, entry]) => [id, entry.family]) }, value => update(next => {
        const selected = catalog[value], role = next.typography.roles[activeRole]; next.fonts[value] = structuredClone(selected); role.font = value;
        role.weight = selected.axes.wght ? Math.max(selected.axes.wght[0], Math.min(selected.axes.wght[1], role.weight)) : selected.weights.reduce((best, n) => Math.abs(n - role.weight) < Math.abs(best - role.weight) ? n : best);
        role.width = selected.axes.wdth ? Math.max(selected.axes.wdth[0], Math.min(selected.axes.wdth[1], role.width ?? 100)) : null;
      }, typography.status, true));
      field(group, t('lab.weight'), spec.weight, font.axes.wght ? { min: font.axes.wght[0], max: font.axes.wght[1], step: 1 } : { choices: font.weights.map(n => [String(n), String(n)]) }, value => update(next => { next.typography.roles[activeRole].weight = Number(value); }, typography.status));
      for (const [key, min, max, step] of [['size', 8, 120, 1], ['lineHeight', .8, 2.5, .05], ['tracking', -.1, .5, .01]]) field(group, t(`lab.${key}`), spec[key], { min, max, step }, value => update(next => { next.typography.roles[activeRole][key] = value; }, typography.status));
      field(group, t('lab.width'), spec.width ?? 100, { disabled: !font.axes.wdth, min: font.axes.wdth?.[0] ?? 100, max: font.axes.wdth?.[1] ?? 100, step: 1 }, value => update(next => { next.typography.roles[activeRole].width = value; }, typography.status));
      typography.body.append(el('p', 'polaris-lab-note', font.axes.wdth ? t('lab.widthAvailable').replace('{min}', font.axes.wdth[0]).replace('{max}', font.axes.wdth[1]) : t('lab.widthUnavailable')));
    }
    transfer(typography.body, typography.status);
  }
  renderers.push(renderChroma, renderTypography); renderers.forEach(render => render()); container.append(launcher);
  const unsubscribe = engine.subscribe(() => { if (!internalChange) renderers.forEach(render => render()); });
  return { dispose() { unsubscribe(); for (const dialog of dialogs) { if (dialog.open) dialog.close(); dialog.remove(); } launcher.remove(); } };
}
