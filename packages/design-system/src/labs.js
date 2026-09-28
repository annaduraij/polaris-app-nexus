/* Author: Codex | Project: Polaris | Date: 2026-09-27
 * File: labs.js | Description: Disposable, accessible developer controls over the long-lived design engine. */
import { FAMILIES, SHADES, TYPE_ROLES, validateCatalog } from './contracts.js';
import { content } from '../generated/content.js';
import { polarisLogo } from '../generated/logo.js';
import { labIcons } from '../generated/lab-icons.js';
import { GLASS_ROLES, GLASS_FIELDS, POLARIS_MATERIAL, resolveGlass, editGlass, glassEffect, glassSliderChanges, glassPreset, glassPresetName, resetGlassControl } from './glass.js';
import { bindGlassSlider } from './glass-slider.js';
import { contrastReport } from './engine.js';
let launcherCount = 0;

/** Optional appearance controls: importing this module never creates a lab. */
export function mountLabs(engine, { container = document.body, fonts = {}, copy = content } = {}) {
  if (!['development', 'customization'].includes(engine.mode)) return { dispose() {} };
  if (Object.keys(fonts).length) validateCatalog(fonts);
  const doc = container.ownerDocument;
  const t = key => copy[key] ?? content[key] ?? key;
  const launcher = doc.createElement('div'); launcher.className = 'polaris-lab-launcher';
  const dialogs = [], renderers = [];
  let activeRole = 'heading', separateFamilies = false, internalChange = false, contrastContainer;
  const el = (tag, className, text) => { const node = doc.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; };
  const button = (text, click) => { const node = el('button', 'polaris-button', text); node.type = 'button'; node.addEventListener('click', click); return node; };
  const choices = el('div', 'polaris-lab-choices'); choices.id = `polaris-lab-choices-${++launcherCount}`; choices.hidden = true; choices.setAttribute('role', 'menu'); choices.setAttribute('aria-label', t('lab.launcher'));
  choices.setAttribute('aria-orientation', 'vertical');
  const launcherButton = button('', () => { if (choices.hidden) openChoices(); else closeChoices(); }); launcherButton.className = 'polaris-lab-trigger'; launcherButton.setAttribute('aria-label', t('lab.launcher')); launcherButton.setAttribute('aria-haspopup', 'menu'); launcherButton.setAttribute('aria-controls', choices.id); launcherButton.setAttribute('aria-expanded', 'false');
  // Embed the build-owned canonical logo; unique gradient IDs support multiple lab instances.
  const template = doc.createElement('template'); template.innerHTML = polarisLogo;
  const svg = template.content.firstElementChild; svg.setAttribute('aria-hidden', 'true'); svg.removeAttribute('aria-labelledby');
  svg.querySelectorAll('title, desc').forEach(node => node.remove());
  svg.querySelector('linearGradient').id = `${choices.id}-gold`;
  svg.querySelector('path').setAttribute('fill', `url(#${choices.id}-gold)`);
  launcherButton.append(svg); launcher.append(choices, launcherButton);
  function openChoices() { choices.hidden = false; launcherButton.setAttribute('aria-expanded', 'true'); choices.querySelector('button')?.focus(); }
  function closeChoices(returnFocus = true) { choices.hidden = true; launcherButton.setAttribute('aria-expanded', 'false'); if (returnFocus && launcherButton.isConnected) launcherButton.focus(); }
  function outsideClick(event) { if (!choices.hidden && !launcher.contains(event.target)) closeChoices(false); }
  doc.addEventListener('click', outsideClick);
  launcher.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !choices.hidden) { event.preventDefault(); closeChoices(); return; }
    if (event.target === launcherButton && ['ArrowDown', 'ArrowUp'].includes(event.key)) { event.preventDefault(); openChoices(); return; }
    if (choices.hidden || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); const items = [...choices.querySelectorAll('button')], index = items.indexOf(doc.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items[next]?.focus();
  });
  launcher.addEventListener('focusout', event => { if (event.relatedTarget && !launcher.contains(event.relatedTarget)) closeChoices(false); });
  function shell(name) {
    const dialog = el('dialog', 'polaris-lab'); dialog.setAttribute('aria-label', t(`lab.${name}`));
    const trigger = button('', () => { closeChoices(false); dialog.showModal(); }); trigger.setAttribute('aria-haspopup', 'dialog'); trigger.setAttribute('role', 'menuitem');
    trigger.setAttribute('aria-label', t(`lab.${name}`)); trigger.title = t(`lab.${name}`);
    const iconTemplate = doc.createElement('template'); iconTemplate.innerHTML = labIcons[name];
    const icon = iconTemplate.content.firstElementChild; icon.setAttribute('aria-hidden', 'true');
    const defs = doc.createElementNS(icon.namespaceURI, 'defs'), aurora = doc.createElementNS(icon.namespaceURI, 'linearGradient');
    aurora.id = `${choices.id}-${name}-aurora`; aurora.setAttribute('gradientUnits', 'userSpaceOnUse');
    for (const [key, value] of Object.entries({ x1: 8, y1: 4, x2: 16, y2: 20 })) aurora.setAttribute(key, value);
    for (const [offset, tone] of [['0%', 'emerald'], ['35%', 'teal'], ['68%', 'cyan'], ['100%', 'violet']]) {
      const stop = doc.createElementNS(icon.namespaceURI, 'stop'); stop.setAttribute('offset', offset); stop.setAttribute('stop-color', `var(--polaris-tool-aurora-${tone})`); aurora.append(stop);
    }
    defs.append(aurora); icon.prepend(defs); icon.setAttribute('stroke', `url(#${aurora.id})`);
    icon.querySelectorAll('[fill="currentColor"]').forEach(detail => detail.setAttribute('fill', `url(#${aurora.id})`));
    trigger.append(icon);
    const head = el('header', 'polaris-lab-head');
    const close = button(t('lab.close'), () => dialog.close());
    head.append(el('h2', '', t(`lab.${name}`)), close);
    const body = el('div', 'polaris-lab-body'), status = el('p', 'polaris-lab-status'); status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');
    dialog.append(head, el('p', 'polaris-lab-note', t(engine.mode === 'customization' ? 'lab.customizationOnly' : 'lab.previewOnly')), body, status);
    dialog.addEventListener('close', () => { if (launcherButton.isConnected) launcherButton.focus(); });
    if (name === 'typography') choices.prepend(trigger); else choices.append(trigger);
    container.append(dialog); dialogs.push(dialog);
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
  // Group existing contract roles without rewriting saved profiles just to change the editor view.
  const simpleRoles = ['heading', 'body', 'label', 'control', 'script', 'mono'];
  const members = role => ['heading', 'body'].includes(role) ? [`serif_${role}`, `sans_${role}`] : [role];
  const enabledMembers = (profile, role) => members(role).filter(key => Object.hasOwn(profile.typography.roles, key));
  function editRoles(next, edit) { for (const key of enabledMembers(next, activeRole)) edit(next.typography.roles[key], next); }
  function renderTypography() {
    typography.body.replaceChildren(); const profile = engine.profile;
    field(typography.body, t('lab.scale'), profile.typography.scale, { min: .75, max: 2, step: .05 }, value => update(next => { next.typography.scale = value; }, typography.status));
    const familyToggle = el('label', 'polaris-checkbox'), familyCheckbox = el('input'); familyCheckbox.type = 'checkbox'; familyCheckbox.checked = separateFamilies;
    familyToggle.append(familyCheckbox, el('span', '', t('lab.separateFamilies'))); typography.body.append(familyToggle);
    familyCheckbox.addEventListener('change', () => {
      separateFamilies = familyCheckbox.checked;
      activeRole = separateFamilies ? (enabledMembers(profile, activeRole)[0] ?? members(activeRole).at(-1)) : activeRole.replace(/^(serif|sans)_/, '');
      renderTypography(); typography.body.querySelector('input[type=checkbox]')?.focus();
    });
    field(typography.body, t('lab.chooseRole'), activeRole, { choices: (separateFamilies ? TYPE_ROLES : simpleRoles).map(role => [role, t(`role.${role}`)]) }, value => { activeRole = value; renderTypography(); });
    const targets = enabledMembers(profile, activeRole);
    if (targets.length > 1) typography.body.append(el('p', 'polaris-lab-note', t('lab.groupedRoles')));
    const enabled = el('label', 'polaris-checkbox'), checkbox = el('input'); checkbox.type = 'checkbox'; checkbox.checked = targets.length > 0;
    enabled.append(checkbox, el('span', '', t('lab.enabled'))); typography.body.append(enabled);
    checkbox.addEventListener('change', () => update(next => {
      if (checkbox.checked) { const first = Object.values(next.typography.roles)[0]; next.typography.roles[members(activeRole).at(-1)] = structuredClone(first); }
      else for (const key of targets) delete next.typography.roles[key];
    }, typography.status, true));
    const spec = profile.typography.roles[targets[0]];
    if (spec) {
      const catalog = { ...fonts, ...profile.fonts }, font = catalog[spec.font];
      const group = section(typography.body, t(`role.${activeRole}`));
      field(group, t('lab.font'), spec.font, { choices: Object.entries(catalog).map(([id, entry]) => [id, entry.family]) }, value => update(next => {
        const selected = catalog[value]; next.fonts[value] = structuredClone(selected);
        editRoles(next, role => {
          role.font = value;
          role.weight = selected.axes.wght ? Math.max(selected.axes.wght[0], Math.min(selected.axes.wght[1], role.weight)) : selected.weights.reduce((best, n) => Math.abs(n - role.weight) < Math.abs(best - role.weight) ? n : best);
          role.width = selected.axes.wdth ? Math.max(selected.axes.wdth[0], Math.min(selected.axes.wdth[1], role.width ?? 100)) : null;
        });
      }, typography.status, true));
      field(group, t('lab.weight'), spec.weight, font.axes.wght ? { min: font.axes.wght[0], max: font.axes.wght[1], step: 1 } : { choices: font.weights.map(n => [String(n), String(n)]) }, value => update(next => editRoles(next, role => {
        const selected = catalog[role.font], weight = Number(value);
        role.weight = selected.axes.wght ? Math.max(selected.axes.wght[0], Math.min(selected.axes.wght[1], weight)) : selected.weights.reduce((best, n) => Math.abs(n - weight) < Math.abs(best - weight) ? n : best);
      }), typography.status, true));
      for (const [key, min, max, step] of [['size', 8, 120, 1], ['lineHeight', .8, 2.5, .05], ['tracking', -.1, .5, .01]]) field(group, t(`lab.${key}`), spec[key], { min, max, step }, value => update(next => editRoles(next, role => { role[key] = value; }), typography.status));
      const widths = targets.map(key => catalog[profile.typography.roles[key].font].axes.wdth);
      const minWidth = Math.max(...widths.map(axis => axis?.[0] ?? 100)), maxWidth = Math.min(...widths.map(axis => axis?.[1] ?? 100));
      const hasWidth = widths.every(Boolean) && minWidth <= maxWidth;
      field(group, t('lab.width'), spec.width ?? 100, { disabled: !hasWidth, min: minWidth, max: maxWidth, step: 1 }, value => update(next => editRoles(next, role => { role.width = value; }), typography.status));
      typography.body.append(el('p', 'polaris-lab-note', hasWidth ? t('lab.widthAvailable').replace('{min}', minWidth).replace('{max}', maxWidth) : t('lab.widthUnavailable')));
    }
    transfer(typography.body, typography.status);
  }
  const glass = shell('glass');
  let glassEditing = 'sliders', glassScope = 'shared', glassRole = 'container';
  function renderGlass() {
    glass.body.replaceChildren();
    const profile = engine.profile, approved = engine.approved.material;
    const target = () => glassScope === 'shared' ? engine.profile.material : resolveGlass(engine.profile.material)[glassRole];
    const role = () => glassScope === 'split' ? glassRole : null;
    function choices(label, values, selected, choose) {
      const group = el('div', 'polaris-glass-switch'); group.setAttribute('role', 'group'); group.setAttribute('aria-label', t(label));
      for (const value of values) {
        const option = button(t(`lab.glass${value[0].toUpperCase()}${value.slice(1)}`), () => { choose(value); renderGlass(); });
        option.setAttribute('aria-pressed', String(value === selected)); group.append(option);
      }
      glass.body.append(group);
    }
    choices('lab.glassEditing', ['sliders', 'exact'], glassEditing, value => { glassEditing = value; });
    choices('lab.glassScope', ['shared', 'split'], glassScope, value => { glassScope = value; });
    glass.body.append(el('p', 'polaris-lab-note', t(glassScope === 'shared' ? 'lab.glassSharedHelp' : 'lab.glassSplitHelp')));
    const preset = field(glass.body, t('lab.glassPreset'), glassPresetName(profile.material, approved), {
      choices: ['subdued', 'moderate', 'dramatic', 'adjusted'].map(name => [name, t(`lab.glass${name[0].toUpperCase()}${name.slice(1)}`)])
    }, value => { if (value !== 'adjusted') update(next => { next.material = glassPreset(approved, value); }, glass.status, true); });
    if (glassScope === 'split') field(glass.body, t('lab.glassRole'), glassRole, {
      choices: GLASS_ROLES.map(name => [name, t(`lab.glass${name[0].toUpperCase()}${name.slice(1)}`)])
    }, value => { glassRole = value; renderGlass(); });
    const preview = el('div', 'polaris-glass-preview');
    const background = el('div', 'polaris-glass-backdrop'); background.dataset.polarisGlass = 'background';
    const container = el('div', 'polaris-glass-sample'); container.dataset.polarisGlass = 'container';
    container.append(el('span', '', t('lab.glassContainer')));
    const surface = el('div', 'polaris-glass-sample'); surface.dataset.polarisGlass = 'surface'; surface.textContent = t('lab.glassSurface'); container.append(surface);
    const functional = el('span', 'polaris-glass-function'); functional.dataset.polarisGlass = 'functional'; functional.textContent = t('lab.glassFunctional');
    preview.append(background, el('span', '', t('lab.glassBackground')), container, functional); glass.body.append(preview);
    const material = section(glass.body, t('lab.material'));
    function change(changes) {
      update(next => { next.material = editGlass(next.material, changes, role()); }, glass.status);
      preset.value = glassPresetName(engine.profile.material, approved);
    }
    if (glassEditing === 'sliders') {
      const hint = el('p', 'polaris-lab-note', t('lab.glassSliderHint')); hint.id = `${launcherButton.getAttribute('aria-controls')}-glass-slider-hint`;
      material.append(hint);
      for (const name of ['clarity', 'transmission', 'effect']) {
        const input = el('input'), wrapper = el('label', 'polaris-glass-control');
        const title = t(`lab.glass${name[0].toUpperCase()}${name.slice(1)}`);
        input.type = 'range'; input.min = 0; input.max = 100; input.step = 1; input.setAttribute('aria-label', title);
        function refreshSlider() {
          const value = target(); input.value = Math.round(100 * (name === 'clarity' ? 1 - value.blur / 60 : name === 'transmission' ? 1 - value.opacity : glassEffect(value)));
          input.setAttribute('aria-valuetext', `${input.value}%`);
        }
        refreshSlider(); input.setAttribute('aria-describedby', hint.id);
        bindGlassSlider(input, {
          adjust() { change(glassSliderChanges(target(), name, Number(input.value) / 100)); input.setAttribute('aria-valuetext', `${input.value}%`); },
          reset() {
            update(next => { next.material = resetGlassControl(next.material, approved, name, role()); }, glass.status);
            refreshSlider(); preset.value = glassPresetName(engine.profile.material, approved);
            glass.status.textContent = t('lab.glassControlReset').replace('{control}', title);
          },
        });
        const ends = el('span', 'polaris-glass-endpoints'); ends.append(el('span', '', t(`lab.glass${name}Low`)), el('span', '', t(`lab.glass${name}High`)));
        wrapper.append(el('span', '', title), input, ends); material.append(wrapper);
      }
    } else {
      for (const [key, [min, max]] of Object.entries(GLASS_FIELDS)) field(material, t(`lab.${key}`), target()[key], { min, max, step: key === 'blur' ? 1 : .01 }, value => change({ [key]: value }));
    }
    field(material, t('lab.glassTint'), target().tint ?? '', {
      choices: [...(glassScope === 'shared' ? [['', t('lab.glassRoleColors')]] : []), ...Object.keys(profile.semantic).map(name => [name, t(`semantic.${name}`)])]
    }, value => {
      if (value) change({ tint: value });
      else {
        update(next => {
          delete next.material.tint;
          for (const layer of Object.values(next.material.layers ?? {})) delete layer.tint;
        }, glass.status, true);
      }
    });
    glass.body.append(el('p', 'polaris-lab-note', t('lab.glassTintHelp')));
    const actions = el('div', 'polaris-lab-actions');
    actions.append(button(t('lab.glassAppReset'), () => update(next => { next.material = structuredClone(approved); }, glass.status, true)),
      button(t('lab.glassPolarisReset'), () => update(next => { next.material = { ...POLARIS_MATERIAL, layers: resolveGlass(POLARIS_MATERIAL) }; }, glass.status, true)));
    glass.body.append(actions);
    const advanced = el('details', 'polaris-glass-advanced'); advanced.append(el('summary', '', t('lab.transfer')));
    transfer(advanced, glass.status); glass.body.append(advanced);
  }
  renderers.push(renderChroma, renderTypography, renderGlass); renderers.forEach(render => render()); container.append(launcher);
  const unsubscribe = engine.subscribe(() => { if (!internalChange) renderers.forEach(render => render()); });
  return { dispose() { unsubscribe(); doc.removeEventListener('click', outsideClick); for (const dialog of dialogs) { if (dialog.open) dialog.close(); dialog.remove(); } launcher.remove(); } };
}
