/* Author: Codex | Project: Polaris | Date: 2026-09-27
 * File: schema.test.mjs | Description: Public JSON schemas accept the generated source profiles and preference envelopes. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
import { profiles } from '../packages/design-system/generated/profiles.js';
import { content } from '../packages/design-system/generated/content.js';
const ajv = new Ajv2020({ strict: true, allErrors: true, allowUnionTypes: true });
const schemas = {};
for (const name of ['design-profile', 'content', 'preferences', 'header']) {
  schemas[name] = JSON.parse(await readFile(new URL(`../packages/design-system/contracts/${name}.v1.schema.json`, import.meta.url)));
  ajv.addSchema(schemas[name]);
}
test('version-one machine schemas match generated YAML profiles and content', () => {
  const profileValidator = ajv.getSchema(schemas['design-profile'].$id);
  for (const profile of Object.values(profiles)) assert.ok(profileValidator(profile), JSON.stringify(profileValidator.errors));
  const contentValidator = ajv.getSchema(schemas.content.$id); assert.ok(contentValidator(content), JSON.stringify(contentValidator.errors));
});
test('preference and weighted-header metadata schemas validate their public envelopes', () => {
  const validate = ajv.getSchema(schemas.preferences.$id);
  for (const kind of ['preview', 'personal']) assert.ok(validate({ version: 1, app: 'lyra', revision: profiles.lyra.revision, kind, value: kind === 'preview' ? profiles.lyra : { 'typography.scale': 1.25 } }), JSON.stringify(validate.errors));
  assert.ok(ajv.getSchema(schemas.header.$id)({ version: 1, sideCapacity: 3, iconWeight: 1, buttonWeight: 1.5, overflowTriggerWeight: 1, actions: [] }));
});
