/* Author: Codex | Project: Polaris | Date: 2026-09-27
 * File: check-syntax.mjs | Description: Check every authored native module, including modules copied without bundling. */
import { readdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
for (const directory of ['packages/design-system/src', 'packages/design-system/generated', 'scripts', 'showcase', 'tests']) {
  for (const name of await readdir(new URL(`../${directory}/`, import.meta.url))) {
    if (!/\.(m?js)$/.test(name)) continue;
    const result = spawnSync(process.execPath, ['--check', `${directory}/${name}`], { cwd: root, stdio: 'inherit' });
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
}
console.log('All native modules pass syntax checks.');
