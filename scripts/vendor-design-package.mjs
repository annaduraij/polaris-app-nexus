/* Author: Codex | Project: Polaris | Date: 2026-09-27
 * File: vendor-design-package.mjs | Description: Copy or verify a portable, content-pinned Polaris runtime snapshot. */
import { readFile, writeFile, mkdir, readdir, copyFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

const args = process.argv.slice(2), check = args.includes('--check');
const option = name => { const i = args.indexOf(name); return i < 0 ? undefined : args[i + 1]; };
const targetArgument = option('--target'), sourceArgument = option('--source');
if (!targetArgument || (!check && !sourceArgument)) throw new Error('Usage: node vendor-design-package.mjs --target public/vendor/polaris [--source path/to/polaris/packages/design-system] [--check]');
const target = path.resolve(targetArgument), source = sourceArgument && path.resolve(sourceArgument);
if (source && (target === source || target.startsWith(`${source}${path.sep}`) || source.startsWith(`${target}${path.sep}`))) throw new Error('Source and target must be separate directories');
const sha = value => createHash('sha256').update(value).digest('hex');
const safePath = name => typeof name === 'string' && !path.isAbsolute(name) && !name.includes('\\') && name.split('/').every(part => part && part !== '.' && part !== '..');
async function walk(root, prefix = '') {
  const paths = [];
  for (const entry of (await readdir(path.join(root, prefix), { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    const name = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isSymbolicLink()) throw new Error(`Symlinks are not supported in a vendor snapshot: ${name}`);
    if (entry.isDirectory()) paths.push(...await walk(root, name));
    else if (entry.isFile()) paths.push(name);
  }
  return paths;
}
async function hashes(root, names) {
  return Object.fromEntries(await Promise.all(names.sort().map(async name => { if (!safePath(name)) throw new Error(`Invalid vendor path: ${name}`); return [name, sha(await readFile(path.join(root, name)))]; })));
}
function snapshot(files, version) {
  return { formatVersion: 1, package: '@polaris/design-system', packageVersion: version, snapshotSha256: sha(Object.entries(files).map(([name, hash]) => `${name}\0${hash}`).join('\n')), files };
}
const manifestPath = path.join(target, 'polaris-vendor.json');
const existing = await readFile(manifestPath, 'utf8').then(JSON.parse).catch(error => { if (error.code === 'ENOENT') return null; throw error; });
let expected;
if (source) {
  const pkg = JSON.parse(await readFile(path.join(source, 'package.json'), 'utf8'));
  if (pkg.name !== '@polaris/design-system') throw new Error('Source is not the Polaris design package');
  const names = ['package.json', 'README.md', 'INTEGRATION.md'];
  for (const directory of ['src', 'generated', 'assets', 'contracts']) names.push(...(await walk(source, directory)));
  expected = snapshot(await hashes(source, names), pkg.version);
} else {
  if (!existing || existing.formatVersion !== 1 || existing.package !== '@polaris/design-system') throw new Error('Missing or unsupported vendor manifest');
  expected = snapshot(existing.files, existing.packageVersion);
  if (expected.snapshotSha256 !== existing.snapshotSha256) throw new Error('Vendor manifest integrity mismatch');
}
if (check) {
  const names = (await walk(target)).filter(name => name !== 'polaris-vendor.json');
  const actual = snapshot(await hashes(target, names), expected.packageVersion);
  if (JSON.stringify(actual) !== JSON.stringify(expected) || JSON.stringify(existing) !== JSON.stringify(expected)) throw new Error('Polaris vendor drift detected; re-sync the approved package snapshot');
  console.log(`Polaris ${expected.packageVersion} verified (${expected.snapshotSha256.slice(0, 12)}, ${names.length} files).`);
} else {
  await mkdir(target, { recursive: true });
  if (existing) for (const name of Object.keys(existing.files)) {
    if (!safePath(name)) throw new Error('Unsafe path in prior vendor manifest');
    if (!Object.hasOwn(expected.files, name)) await unlink(path.join(target, name)).catch(error => { if (error.code !== 'ENOENT') throw error; });
  }
  for (const name of Object.keys(expected.files)) { await mkdir(path.dirname(path.join(target, name)), { recursive: true }); await copyFile(path.join(source, name), path.join(target, name)); }
  await writeFile(manifestPath, `${JSON.stringify(expected, null, 2)}\n`);
  console.log(`Vendored Polaris ${expected.packageVersion} (${expected.snapshotSha256.slice(0, 12)}, ${Object.keys(expected.files).length} files).`);
}
