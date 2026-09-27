/*
 * Author: Unknown
 * Project: Polaris
 * Date: 2026-09-27
 * File: sync-app-contract.mjs
 * Description: Build Polaris app cards from the opening identity paragraphs in each app README.
 */

import { readFile, copyFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appsRoot = path.resolve(process.env.POLARIS_APPS_ROOT ?? path.join(projectRoot, '../../../../projects'));
const indexPath = path.join(projectRoot, 'public/index.html');
const apps = [
  { id: 'lyra', directory: 'lyra-music', url: 'https://lyra.ajay.nexus' },
  { id: 'krona', directory: 'krona-budget', url: 'https://krona.ajay.nexus' },
  { id: 'ren', directory: 'enigma-misc' },
];

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function readIdentity(readme, id) {
  const opening = readme.split(/^##\s/m, 1)[0];
  const name = opening.match(/^# ([^\n]+)$/m)?.[1]?.trim();
  const logo = opening.match(/^!\[[^\]]*\]\(([^)]+)\)$/m)?.[1]?.trim();
  const field = (label) => opening.match(new RegExp(`^\\*\\*${label}:\\*\\* (.+)$`, 'm'))?.[1]?.trim();
  const subtitle = field('Subtitle');
  const description = field('Description');
  const inspiration = field('Inspiration');
  const color = (label) => {
    const value = field(label);
    const match = value?.match(/^(#[0-9a-fA-F]{6})(?:\s+\([^)]*\))?$/);
    if (!match) throw new Error(`${id}: ${label.toLowerCase()} must be a six-digit hex color with an optional name`);
    return match[1].toLowerCase();
  };

  if (!name || !logo || !subtitle || !description || !inspiration) {
    throw new Error(`${id}: README opening must provide a name, logo, subtitle, description, and inspiration`);
  }
  if (subtitle.split(/\s+/).length !== 5) {
    throw new Error(`${id}: subtitle must contain exactly five words`);
  }
  if (description.length > 180 || inspiration.length > 180) {
    throw new Error(`${id}: description and inspiration must each be at most 180 characters`);
  }
  if (/[<>]/.test([name, subtitle, description, inspiration].join(''))) {
    throw new Error(`${id}: identity copy must be plain text`);
  }
  return {
    name, logo, subtitle, description, inspiration,
    surface: color('Primary surface'),
    raisedSurface: color('Secondary surface'),
    secondary: color('Secondary color'),
    signature: color('Signature color'),
    accent: color('Accent color'),
  };
}

function renderApp(app, identity) {
  const { name, subtitle, description, inspiration, logoFile, surface, raisedSurface, secondary, signature, accent } = identity;
  const tag = app.url ? 'a' : 'article';
  const attributes = app.url
    ? `href="${app.url}" aria-label="Open ${escapeHtml(name)}"`
    : `aria-labelledby="${app.id}-title"`;
  const action = app.url
    ? '<span class="row-arrow" aria-hidden="true">↗</span>'
    : '<span class="soon">Coming soon</span>';

  return `        <${tag} class="app-row ${app.id}${app.url ? '' : ' upcoming'}" ${attributes} style="--surface: ${surface}; --surface-raised: ${raisedSurface}; --secondary: ${secondary}; --signature: ${signature}; --accent: ${accent}">
          <span class="logo-panel"><img class="app-logo ${app.id}-logo" src="./brand/${logoFile}" width="48" height="48" alt="" /></span>
          <span class="card-content">
            <span class="app-text">
              <strong${app.url ? '' : ` id="${app.id}-title"`}>${escapeHtml(name)}</strong>
              <small>${escapeHtml(subtitle)}</small>
              <span class="app-description">${escapeHtml(description)}</span>
              <span class="app-inspiration"><b>Why:</b> ${escapeHtml(inspiration)}</span>
            </span>
            ${action}
          </span>
        </${tag}>`;
}

const html = await readFile(indexPath, 'utf8');
const marker = /(?<=        <!-- apps:start -->\n)[\s\S]*?(?=        <!-- apps:end -->)/;
if (!marker.test(html)) {
  throw new Error('Polaris index is missing the app card markers');
}

const sources = [];
for (const app of apps) {
  const appRoot = path.join(appsRoot, app.directory);
  const readme = await readFile(path.join(appRoot, 'README.md'), 'utf8');
  const identity = readIdentity(readme, app.id);
  const logoPath = path.resolve(appRoot, identity.logo);
  if (!logoPath.startsWith(`${appRoot}${path.sep}`) || !/\.(png|svg)$/i.test(logoPath)) {
    throw new Error(`${app.id}: logo must be a local PNG or SVG within its repository`);
  }
  const logoFile = `${app.id}${path.extname(logoPath).toLowerCase()}`;
  sources.push({ app, identity, logoPath, logoFile });
}

for (const { logoPath, logoFile } of sources) {
  await copyFile(logoPath, path.join(projectRoot, 'public/brand', logoFile));
}
const cards = sources.map(({ app, identity, logoFile }) => renderApp(app, { ...identity, logoFile }));
await writeFile(indexPath, html.replace(marker, `${cards.join('\n')}\n`));
