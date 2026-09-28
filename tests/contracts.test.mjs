/* Author: Codex | Project: Polaris | Date: 2026-09-27
 * File: contracts.test.mjs | Description: Semantic, optional-role, variable-font and untrusted-input contract regression tests. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { profiles } from '../packages/design-system/generated/profiles.js';
import { developerFonts } from '../packages/design-system/generated/developer-fonts.js';
import { validateProfile, compileTokens, selectedFontCSS, contrastReport } from '../packages/design-system/src/index.js';
const profile = () => structuredClone(profiles.photography);

test('both reference profiles validate and their main text/action pairs meet 4.5:1', () => {
  for (const fixture of Object.values(profiles)) { assert.equal(validateProfile(fixture), fixture); assert.ok(contrastReport(fixture).every(result => result.passes)); }
});
test('semantic roles propagate family edits but remain independently mapped', () => {
  const p = profile(); p.semantic.primaryText = 'neutral.100'; p.semantic.secondaryFill = 'neutral.100'; p.palette.neutral['100'] = '#eaf7f1';
  const tokens = compileTokens(p); assert.equal(tokens['--polaris-primary-text'], '#eaf7f1'); assert.equal(tokens['--polaris-secondary-fill'], '#eaf7f1');
  p.semantic.primaryText = 'neutral.900'; const next = compileTokens(p); assert.equal(next['--polaris-secondary-fill'], '#eaf7f1'); assert.notEqual(next['--polaris-primary-text'], '#eaf7f1');
});
test('optional roles may be absent but selected fonts load and unsupported width is rejected', () => {
  const p = profile(); delete p.typography.roles.script; delete p.typography.roles.serif_body;
  assert.doesNotMatch(selectedFontCSS(p), /Great Vibes|Cormorant Infant/);
  p.typography.roles.sans_body.width = 90; assert.throws(() => validateProfile(p), /no width axis/);
});
test('Mona Sans width stays within its real supported range and is never simulated', () => {
  const p = profile(); p.fonts.mona_sans = developerFonts.mona_sans; Object.assign(p.typography.roles.sans_heading, { font: 'mona_sans', width: 75 });
  assert.match(selectedFontCSS(p), /font-stretch:75% 125%/); assert.equal(compileTokens(p)['--polaris-font-sans-heading-variation'], '"wdth" 75, "wght" 600');
  p.typography.roles.sans_heading.width = 125; validateProfile(p);
  for (const value of [74, 126, NaN, Infinity, '100']) { p.typography.roles.sans_heading.width = value; assert.throws(() => validateProfile(p)); }
});
test('reject malformed palette, unknown properties, unsafe URLs, invalid values and unsupported weights', () => {
  for (const mutate of [p => p.extra = true, p => delete p.palette.accent, p => p.palette.primary['500'] = 'red', p => p.semantic.text = 'status.success', p => p.material.blur = -1, p => p.typography.scale = 3, p => p.fonts.lustria.assets[0].url = 'javascript:alert(1)', p => p.typography.roles.serif_heading.weight = 700, p => p.personal = ['fonts.system.family'], p => p.media.push('#ffffff')]) {
    const p = profile(); mutate(p); assert.throws(() => validateProfile(p));
  }
});
test('status, data, media and glass remain separate from all four color families', () => {
  const p = profile(), before = compileTokens(p); p.palette.primary['500'] = '#123456'; p.material.blur = 30;
  const after = compileTokens(p); assert.equal(after['--polaris-primary-fill'], '#123456'); assert.equal(after['--polaris-glass-blur'], '30px');
  for (const key of Object.keys(before).filter(key => /--polaris-(status|data|media)-/.test(key))) assert.equal(after[key], before[key]);
});
