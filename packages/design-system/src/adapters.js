/* Author: Codex | Project: Polaris | Date: 2026-09-27
 * File: adapters.js | Description: Opt-in legacy variable bridges for gradual source-app migration. */
export const lyraAliases = {
  '--bg': '--polaris-page', '--text': '--polaris-text', '--muted': '--polaris-text-muted', '--green': '--polaris-primary-fill',
  '--line': '--polaris-border', '--surface': '--polaris-surface', '--material-alpha': '--polaris-glass-opacity', '--material-blur': '--polaris-glass-blur',
};
export const photographyAliases = {
  '--bg': '--polaris-page', '--surface': '--polaris-surface', '--surface-strong': '--polaris-surface-raised', '--surface-sunken': '--polaris-surface-inset',
  '--text': '--polaris-text', '--muted': '--polaris-text-muted', '--accent': '--polaris-primary-fill', '--focus-ring-accent': '--polaris-focus',
  '--display-font-family': '--polaris-font-serif-heading-family', '--body-font-family': '--polaris-font-sans-body-family', '--signature-font-family': '--polaris-font-script-family',
  '--section-font-family': '--polaris-font-serif-heading-family', '--meta-font-family': '--polaris-font-label-family', '--control-font-family': '--polaris-font-control-family',
  '--ceremonial-font-family': '--polaris-font-serif-body-family', '--mono-font-family': '--polaris-font-mono-family',
};
/** Aliases are deliberately opt-in: existing app CSS can be migrated one component at a time. */
export function installAliases(target, aliases) {
  for (const [alias, source] of Object.entries(aliases)) if (!/^--[a-z0-9-]+$/.test(alias) || !/^--polaris-[a-z0-9-]+$/.test(source)) throw new Error('Invalid CSS alias');
  const previous = Object.entries(aliases).map(([alias]) => [alias, target.style.getPropertyValue(alias), target.style.getPropertyPriority(alias)]);
  for (const [alias, source] of Object.entries(aliases)) {
    target.style.setProperty(alias, `var(${source})`);
  }
  return () => { for (const [alias, value, priority] of previous) value ? target.style.setProperty(alias, value, priority) : target.style.removeProperty(alias); };
}
