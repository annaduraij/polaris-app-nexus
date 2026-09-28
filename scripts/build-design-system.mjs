/* Author: Codex | Project: Polaris | Date: 2026-09-27
 * File: build-design-system.mjs | Description: Validate YAML and deterministically generate browser and typed package artifacts. */
import { readFile, writeFile, mkdir, readdir, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { parseDocument } from 'yaml';
import { build } from 'esbuild';
import { validateProfile, validateCatalog, validateContent } from '../packages/design-system/src/contracts.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const pkg = path.join(root, 'packages/design-system');
const check = process.argv.includes('--check');
let differences = 0;
async function yaml(relative) {
  const source = await readFile(path.join(root, relative), 'utf8');
  if (source.length > 150000) throw new Error(`${relative}: YAML source exceeds 150 KB`);
  const doc = parseDocument(source, { uniqueKeys: true, strict: true });
  if (doc.errors.length || doc.warnings.length) throw new Error(`${relative}: ${[...doc.errors, ...doc.warnings].map(e => e.message).join('; ')}`);
  return doc.toJS({ maxAliasCount: 0 });
}
async function emit(relative, contents) {
  const destination = path.join(root, relative);
  if (check) {
    const existing = await readFile(destination, 'utf8').catch(() => '');
    if (existing !== contents) { console.error(`Generated drift: ${relative}`); differences++; }
  } else { await mkdir(path.dirname(destination), { recursive: true }); await writeFile(destination, contents); }
}
const profiles = {};
for (const name of (await readdir(path.join(pkg, 'profiles'))).sort()) {
  if (!name.endsWith('.yaml') || name === 'developer-fonts.yaml') continue;
  const profile = validateProfile(await yaml(`packages/design-system/profiles/${name}`));
  if (profiles[profile.id]) throw new Error(`Duplicate profile: ${profile.id}`);
  profiles[profile.id] = profile;
}
const catalog = validateCatalog(await yaml('packages/design-system/profiles/developer-fonts.yaml'));
const content = validateContent(await yaml('content/design-system.yaml'));
const preamble = '// Generated from YAML by scripts/build-design-system.mjs. Do not edit.\n';
const labIcons = {};
for (const [role, name] of Object.entries({ typography: 'type', chroma: 'palette', glass: 'mirror-rectangular' })) labIcons[role] = await readFile(path.join(pkg, 'assets/icons', `${name}.svg`), 'utf8');
await emit('packages/design-system/generated/lab-icons.js', `// Generated from pinned Lucide assets/icons SVGs. See assets/icons/LUCIDE-LICENSE.txt.\nexport const labIcons = ${JSON.stringify(labIcons, null, 2)};\n`);

await emit('packages/design-system/generated/logo.js', `// Generated from public/logo.svg. Do not edit.\nexport const polarisLogo = ${JSON.stringify(await readFile(path.join(root, 'public/logo.svg'), 'utf8'))};\n`);
await emit('packages/design-system/generated/profiles.js', `${preamble}export const profiles = ${JSON.stringify(profiles, null, 2)};\n`);
await emit('packages/design-system/generated/developer-fonts.js', `${preamble}export const developerFonts = ${JSON.stringify(catalog, null, 2)};\n`);
await emit('packages/design-system/generated/developer-fonts.d.ts', `${preamble}import type { FontCatalog } from '../src/index.js';\nexport declare const developerFonts: FontCatalog;\n`);
await emit('packages/design-system/generated/content.js', `${preamble}export const content = ${JSON.stringify(content, null, 2)};\n`);
await emit('packages/design-system/generated/content.d.ts', `${preamble}export declare const content: {\n${Object.keys(content).map(key => `  readonly ${JSON.stringify(key)}: string;`).join('\n')}\n};\nexport type ContentKey = keyof typeof content;\n`);
await emit('packages/design-system/generated/profiles.d.ts', `${preamble}import type { DesignProfile } from '../src/index.js';\nexport declare const profiles: Record<${Object.keys(profiles).map(JSON.stringify).join(' | ')}, DesignProfile>;\n`);
await emit('packages/design-system/INTEGRATION.md', await readFile(path.join(root, 'docs/design-system.md'), 'utf8'));
for (const font of Object.values(catalog)) for (const asset of font.assets) {
  if (!asset.url.startsWith('./assets/')) throw new Error(`Reference assets must be packaged locally: ${asset.url}`);
  await readFile(path.join(pkg, asset.url));
}
if (differences) process.exitCode = 1;
if (!check) {
  const destination = path.join(root, 'public/design-system/runtime');
  await rm(destination, { force: true, recursive: true });
  await mkdir(destination, { recursive: true });
  for (const name of ['src', 'generated', 'assets', 'contracts']) await cp(path.join(pkg, name), path.join(destination, name), { recursive: true });
  await build({ entryPoints: [path.join(root, 'showcase/photography.jsx')], bundle: true, format: 'esm', outfile: path.join(root, 'public/design-system/photography.js'), minify: true, sourcemap: false, define: { 'process.env.NODE_ENV': '"production"' }, external: ['./runtime/*'] });
  await cp(path.join(root, 'showcase/index.html'), path.join(root, 'public/design-system/index.html'));
  await cp(path.join(root, 'showcase/showcase.js'), path.join(root, 'public/design-system/showcase.js'));
  await cp(path.join(root, 'showcase/showcase.css'), path.join(root, 'public/design-system/showcase.css'));
  await cp(path.join(root, 'docs/design-system.md'), path.join(root, 'public/design-system/integration.md'));
}
console.log(check ? 'Design YAML validation and generated drift check complete.' : 'Design package and showcase built.');
