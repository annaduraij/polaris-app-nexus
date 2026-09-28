/* Author: Codex | Project: Polaris | Date: 2026-09-27
 * File: font-assets.test.mjs | Description: Compare variable-font declarations with the shipped binary axes. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parse } from 'yaml';

const packageRoot = new URL('../packages/design-system/', import.meta.url);

/** Read the OpenType fvar directory directly, independent of runtime catalog code. */
function variableAxes(bytes) {
  const tableCount = bytes.readUInt16BE(4);
  for (let index = 0; index < tableCount; index++) {
    const entry = 12 + index * 16;
    if (bytes.toString('ascii', entry, entry + 4) !== 'fvar') continue;
    const start = bytes.readUInt32BE(entry + 8);
    const axesOffset = bytes.readUInt16BE(start + 4);
    const axesCount = bytes.readUInt16BE(start + 8);
    const axesSize = bytes.readUInt16BE(start + 10);
    const axes = {};
    for (let axisIndex = 0; axisIndex < axesCount; axisIndex++) {
      const offset = start + axesOffset + axisIndex * axesSize;
      const tag = bytes.toString('ascii', offset, offset + 4);
      axes[tag] = [bytes.readInt32BE(offset + 4) / 65536, bytes.readInt32BE(offset + 12) / 65536];
    }
    return axes;
  }
  return {};
}

test('developer catalog and approved profiles describe the actual shipped variable font ranges', async () => {
  const catalogs = [];
  for (const filename of ['developer-fonts.yaml', 'photography.yaml', 'lyra.yaml']) {
    const document = parse(await readFile(new URL(`profiles/${filename}`, packageRoot), 'utf8'));
    catalogs.push([filename, filename === 'developer-fonts.yaml' ? document : document.fonts]);
  }
  let inspected = 0;
  for (const [filename, catalog] of catalogs) {
    for (const [name, font] of Object.entries(catalog)) {
      for (const asset of font.assets) {
        const bytes = await readFile(new URL(asset.url, packageRoot));
        assert.ok(bytes.length > 100, `${name} must resolve to a real local asset`);
        if (!asset.url.endsWith('.ttf')) continue;
        const actual = variableAxes(bytes);
        for (const axis of ['wght', 'wdth']) {
          assert.deepEqual(font.axes[axis], actual[axis], `${filename}: ${name} ${axis} differs from the font binary`);
        }
        if (actual.wght) {
          assert.deepEqual(asset.weight.split(' ').map(Number), actual.wght, `${name} CSS weight descriptor must match the file`);
        }
        inspected++;
      }
    }
  }
  assert.ok(inspected >= 4, 'the real developer variable-font catalog must be exercised');
});
