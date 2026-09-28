/*
 * Author: Unknown
 * Project: Polaris
 * Date: 2026-09-27
 * File: sync-app-contract.mjs
 * Description: Build Polaris app cards from the opening identity paragraphs in each app README.
 */

import { readFile, copyFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const siblingRoot = path.resolve(projectRoot, '..');
const defaultAppsRoot = existsSync(path.join(siblingRoot, 'lyra-music/README.md'))
  ? siblingRoot
  : path.resolve(projectRoot, '../../../../projects');
const appsRoot = path.resolve(process.env.POLARIS_APPS_ROOT ?? defaultAppsRoot);
const indexPath = path.join(projectRoot, 'public/index.html');
const apps = [
  { id: 'lyra', directory: 'lyra-music', url: 'https://lyra.ajay.nexus' },
  { id: 'krona', directory: 'krona-budget', url: 'https://krona.ajay.nexus' },
  { id: 'ren', directory: 'enigma-misc', stage: 'beta' },
  {
    id: 'fano', stage: 'alpha',
    // Fano is a local CLI and has no public app identity contract yet.
    identity: {
      name: 'Fano', subtitle: 'A clearer Apple Photos catalog',
      description: 'Fano audits an Apple Photos library and prepares exact, reviewable changes in a local Mac workspace.',
      inspiration: 'Created to make photo organization easier to review before changes are applied.',
      surface: '#1b2731', raisedSurface: '#263742', secondary: '#557f8c', signature: '#7db7c0', accent: '#d4b77c',
      logoFile: null,
    },
  },
];
const stages = {
  alpha: { label: 'Alpha', meaning: 'early preview' },
  beta: { label: 'Beta', meaning: 'live for private use' },
};

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
  const mainTag = app.url ? 'a' : 'div';
  const mainAttributes = app.url ? ` href="${app.url}" aria-label="Open ${escapeHtml(name)}"` : '';
  const action = app.url
    ? `<a class="app-launch" href="${app.url}" aria-label="Open ${escapeHtml(name)}"><span aria-hidden="true">↗</span></a>`
    : `<span class="release-badge ${app.stage}" aria-label="${stages[app.stage].label}: ${stages[app.stage].meaning}">${stages[app.stage].label}</span>`;
  const logo = logoFile
    ? `<img class="app-logo ${app.id}-logo" src="./brand/${logoFile}" width="48" height="48" alt="" />`
    : '<span class="app-monogram" aria-hidden="true">F</span>';

  return `        <article class="app-row ${app.id}" style="--surface: ${surface}; --surface-raised: ${raisedSurface}; --secondary: ${secondary}; --signature: ${signature}; --accent: ${accent}">
          <div class="app-compact">
            <${mainTag} class="app-main"${mainAttributes}>
              <span class="logo-panel">${logo}</span>
              <span class="app-line"><strong id="${app.id}-title">${escapeHtml(name)}</strong><small>${escapeHtml(subtitle)}</small></span>
            </${mainTag}>
            <div class="app-actions">
              <button class="app-details-toggle" type="button" aria-expanded="false" aria-controls="${app.id}-details" aria-label="Show ${escapeHtml(name)} details" hidden><span aria-hidden="true">+</span></button>
              ${action}
            </div>
          </div>
          <div class="app-details" id="${app.id}-details">
            <p>${escapeHtml(description)}</p>
            <p><b>Why:</b> ${escapeHtml(inspiration)}</p>
          </div>
        </article>`;
}

const html = await readFile(indexPath, 'utf8');
const marker = /(?<=        <!-- apps:start -->\n)[\s\S]*?(?=        <!-- apps:end -->)/;
if (!marker.test(html)) {
  throw new Error('Polaris index is missing the app card markers');
}

const sources = [];
for (const app of apps) {
  if (app.identity) {
    sources.push({ app, identity: app.identity });
    continue;
  }
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
  if (logoPath) await copyFile(logoPath, path.join(projectRoot, 'public/brand', logoFile));
}
const cards = sources.map(({ app, identity, logoFile }) => renderApp(app, { ...identity, logoFile }));
await writeFile(indexPath, html.replace(marker, `${cards.join('\n')}\n`));
