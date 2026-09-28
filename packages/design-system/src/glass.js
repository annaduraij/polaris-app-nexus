/* Author: Codex | Project: Polaris | Date: 2026-09-27
 * File: glass.js | Description: Versioned surface hierarchy, coordinated adjustments and material-only presets. */
export const GLASS_ROLES = ['background', 'container', 'surface', 'functional'];
export const GLASS_FIELDS = { opacity: [0, 1], blur: [0, 60], saturation: [0, 2], borderOpacity: [0, 1] };
const clamp = (n, min, max) => Math.round(Math.min(max, Math.max(min, n)) * 10000) / 10000;
export const POLARIS_MATERIAL = Object.freeze({ opacity: .72, blur: 24, saturation: 1.35, borderOpacity: .14 });

/** Missing role values inherit the opinionated hierarchy; explicit values are app calibrations. */
export function resolveGlass(material) {
  const base = Object.fromEntries(Object.keys(GLASS_FIELDS).map(key => [key, material[key]]));
  return Object.fromEntries(GLASS_ROLES.map(role => {
    const defaults = role === 'background' ? { opacity: base.opacity * .2, blur: base.blur * .5, borderOpacity: 0, tint: 'page' }
      : role === 'surface' ? { opacity: clamp(base.opacity + .08, 0, 1), tint: 'surface' }
      : role === 'functional' ? { opacity: clamp(base.opacity + .16, 0, 1), tint: 'surfaceRaised' }
      : { tint: 'surface' };
    return [role, { ...base, ...defaults, ...(material.tint ? { tint: material.tint } : {}), ...material.layers?.[role] }];
  }));
}

/** Shared edits preserve calibrated differences; split edits touch only the selected role. */
export function editGlass(material, changes, role = null) {
  const next = structuredClone(material), resolved = resolveGlass(material);
  next.layers ??= {};
  if (role) { next.layers[role] = { ...resolved[role], ...changes }; return next; }
  for (const [key, value] of Object.entries(changes)) {
    next[key] = value;
    for (const name of GLASS_ROLES) {
      next.layers[name] ??= { ...resolved[name] };
      if (key === 'tint') next.layers[name][key] = value;
      else if (key === 'opacity' || key === 'blur') {
        const [, max] = GLASS_FIELDS[key], from = material[key], current = resolved[name][key];
        // Shared endpoints apply to every role, while intermediate edits retain their relative separation.
        next.layers[name][key] = clamp(value >= from
          ? current + (max - current) * (value - from) / (max - from || 1)
          : current * value / (from || 1), 0, max);
      } else next.layers[name][key] = clamp(resolved[name][key] + value - material[key], ...GLASS_FIELDS[key]);
    }
  }
  return next;
}
export function glassEffect(material) { return clamp(material.saturation / 2, 0, 1); }
export function glassSliderChanges(material, name, value) {
  if (name === 'clarity') return { blur: (1 - value) * 60 };
  if (name === 'transmission') return { opacity: 1 - value };
  const delta = value - glassEffect(material);
  return { saturation: clamp(value * 2, 0, 2), borderOpacity: clamp(material.borderOpacity + delta * .25, 0, 1) };
}
/** Dramatic is the app-approved reference; quieter presets retain its palette references. */
export function glassPreset(approved, preset) {
  if (preset === 'dramatic') return structuredClone(approved);
  const amount = preset === 'moderate' ? .5 : .2;
  const next = structuredClone(approved);
  const quiet = value => ({ ...value, opacity: clamp(1 - (1 - value.opacity) * amount, 0, 1), blur: clamp(value.blur * amount, 0, 60),
    saturation: clamp(1 + (value.saturation - 1) * amount, 0, 2), borderOpacity: clamp(value.borderOpacity * amount, 0, 1) });
  Object.assign(next, quiet(approved));
  next.layers = Object.fromEntries(Object.entries(resolveGlass(approved)).map(([role, value]) => [role, quiet(value)]));
  return next;
}
export function glassPresetName(material, approved) {
  const same = (a, b) => JSON.stringify(resolveGlass(a)) === JSON.stringify(resolveGlass(b));
  return ['subdued', 'moderate', 'dramatic'].find(name => same(material, glassPreset(approved, name))) ?? 'adjusted';
}

/** Restore one control's app calibration, retaining unrelated glass fields and color references. */
export function resetGlassControl(material, approved, control, role = null) {
  const fields = control === 'clarity' ? ['blur'] : control === 'transmission' ? ['opacity'] : ['saturation', 'borderOpacity'];
  const next = structuredClone(material), defaults = resolveGlass(approved);
  next.layers ??= {};
  for (const name of role ? [role] : GLASS_ROLES) {
    next.layers[name] ??= {};
    for (const field of fields) next.layers[name][field] = defaults[name][field];
  }
  if (!role) for (const field of fields) next[field] = approved[field];
  return next;
}
