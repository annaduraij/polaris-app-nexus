# Polaris design system v1

Polaris is both Jay's App Nexus and the owner of shared design contracts, reusable engines, developer labs, and common components. `@polaris/design-system` is a native ES module package with **no runtime dependencies**. The showcase contains vanilla and React reference fixtures. **Lyra and Krona now locally consume the shared startup engines and labs** through app-owned profiles and pinned vendor snapshots. Their existing workflow headers and legacy application copy remain app-owned. **Photography remains an untouched, read-only reference**, with any application migration deferred. No deployment is part of these integrations.

The existing landing page and app identities remain intact. Its design-system link opens `/design-system/`, which demonstrates app profiles, production/development behavior, live theme and typography, the common header, and generated copy.

## Source, build, and package

| Source | Responsibility |
| --- | --- |
| `packages/design-system/profiles/lyra.yaml` | Approved Lyra dark browser profile |
| `packages/design-system/profiles/photography.yaml` | Approved photography dark browser reference profile |
| `packages/design-system/profiles/developer-fonts.yaml` | Additional developer font choices; not imported by production entry points |
| `content/design-system.yaml` | Shared plain-text UI copy, labels and specimen content |
| `packages/design-system/contracts/*.v1.schema.json` | Versioned JSON Schema contracts |
| `packages/design-system/src/` | Runtime validation, engines, adapters and components |
| `packages/design-system/generated/` | Checked-in JS and TypeScript declarations generated from YAML |
| `showcase/` | Authored demonstration consumers; photography uses a dev-built React bundle |

```sh
npm ci
npm run build             # Validate YAML, generate artifacts, build public showcase
npm run check:generated   # Fail on YAML/artifact drift without rewriting files
npm test                 # Native-module syntax checks and regression tests
npm run check:types       # Public API and generated content-key type checks
npm run check             # All checks plus Wrangler's deployment dry run
python3 -m http.server 8016 --directory public
```

Open `http://localhost:8016/design-system/?app=photography&mode=development` or set `app=lyra` / `mode=production`. `npm run dev` and `npm run deploy` build assets first. The generated `public/design-system/` directory is ignored; deployment always rebuilds it. `npm run deploy` also runs identity sync, artifact validation, tests, and type checks. No remote deployment is required to use the package.

GitHub Actions runs `npm ci` and `npm run check` on pushes and pull requests, with no deployment step. The check fails on generated drift before building the ignored showcase assets, then validates types/tests and runs the Worker dry run. A child app must adopt equivalent contract checks and migrate actual token consumers before claiming Polaris conformance; installing this package alone is insufficient.

Create a distributable with `npm pack ./packages/design-system`. The tarball includes runtime modules, generated data/types, schemas, integration instructions, selected font files, and their OFL notices. The package's vanilla entry point does not import React or labs. React and build tooling are development dependencies of the Polaris showcase only.

Applications without a package registry can copy `scripts/vendor-design-package.mjs` into their repository and run it with `--source path/to/polaris/packages/design-system --target public/vendor/polaris`. Commit the resulting snapshot and `polaris-vendor.json`; the manifest pins every byte with SHA-256 and records the package version without embedding machine-specific paths. Run the same script with `--target public/vendor/polaris --check` in CI for local drift, or additionally provide `--source` to compare against a reviewed upstream checkout. Updating is explicit and retains bundled fonts and licenses.

## Design contract

The v1 profile has `version`, `id`, `revision`, `label`, `palette`, `semantic`, `status`, `data`, `media`, `material`, `fonts`, `typography`, and `personal` fields. Unknown fields are rejected. Schemas provide structural validation; runtime validation adds cross-field font capabilities and permission checks.

Four configurable color families each have five explicit shades: **neutral, primary, secondary, accent**, with stops `100`, `300`, `500`, `700`, `900`. Shades are authored values, not automatically generated blends. Semantic roles reference a family and stop, such as `neutral.100` or `primary.500`. Components consume semantic tokens, rather than assuming that a particular family always serves a particular purpose.

```yaml
semantic:
  primaryFill: primary.500
  primaryText: neutral.900
  secondaryFill: neutral.100
  secondaryText: neutral.900
```

`primaryText` can independently reference `neutral.100` when used on a darker primary fill. Remapping `secondaryFill` does not remap `primaryText`; editing their shared neutral source affects both references by design. Other semantic roles cover page, surfaces, primary/muted text, border, focus, and header fill/text. `compileTokens(profile)` exposes concrete `--polaris-*` values so changing a family reliably propagates to its consumers.

`status` contains success/warning/error/info colors. `data` has 1–12 colors; `media` has 1–5 colors for album/artwork use. Neither is silently replaced by brand-family changes. Glass `opacity`, `blur`, `saturation` and `borderOpacity` are separately validated material controls. `.polaris-surface` combines the semantic surface with the material settings and provides reduced-transparency and forced-color fallbacks.

`contrastReport(profile)` reports the primary text/page, muted text/page, both action pairs, and header text/fill against a 4.5:1 threshold. Chroma Lab updates these warnings as colors and mappings change. Previewing a low-contrast combination remains possible; these checks do not certify every image, translucent surface, status indicator, or app-specific state.

## Typography and font loading

The optional roles are `serif_heading`, `sans_heading`, `serif_body`, `sans_body`, `label`, `control`, `script`, and `mono`. At least one role must be enabled. Each enabled role independently specifies `font`, `weight`, `size` in pixels, `lineHeight`, `tracking` in em, and `width`. `typography.scale` multiplies all enabled role sizes. Several roles can select the same font; the role name does not require a separate asset or enforce serif/sans taste.

Font catalogs declare family, generic fallback, assets, supported static weights and actual variable axes. Unknown font IDs, unsupported weights and out-of-range widths are rejected before applying styles. A font without a `wdth` axis must use `width: null`; the width control is disabled with an explanation. Polaris never uses `scaleX` to simulate width.

| Font | Actual packaged capability |
| --- | --- |
| Mona Sans | `wght` 200–900, `wdth` 75–125 |
| Mulish | `wght` 200–1000; no width axis |
| Afacad | `wght` 400–700; no width axis |
| Inclusive Sans | `wght` 300–700; no width axis |
| Lustria | Static 400 |
| Cormorant Infant | Static 400, 500, 700 |
| Great Vibes | Static 400 |
| JetBrains Mono | Static 400 in this package |

System sans and mono profiles use native generic stacks. The photography reference uses Lustria headings, Mulish body/control/sans heading, Cormorant Infant serif body, Great Vibes script, and JetBrains Mono technical text. The fixture actually renders each role, including script. Lyra enables system sans headings/body/labels/controls and system mono; its serif and script roles start disabled.

`selectedFontCSS(profile, assetBase)` emits font-face declarations only for fonts selected by enabled roles. The engine manages those declarations in production as well as development. Developer catalog entries do not load just because they are available in a select menu. CSS font loading remains browser-managed, so deploy the referenced files and preserve their licenses. TTF axis tests independently parse the actual font binaries to keep metadata honest.

## Engine lifecycle and preference boundaries

Create the engine **once at application startup**, before mounting the application or header. Do not put it in a navigation menu, lab component, or conditional development-only effect. Its lifecycle is independent of the panels that edit it.

```js
import { createDesignEngine } from '@polaris/design-system';
import { profiles } from '@polaris/design-system/profiles';

const engine = createDesignEngine({
  profile: profiles.lyra,
  target: document.documentElement,
  mode: 'production',
  assetBase: new URL('/vendor/polaris/', location.origin),
  onError(error) { console.warn('Preferences ignored:', error.message); },
});
```

Copy the package's `assets/` directory to `/vendor/polaris/assets/`, or set approved asset URLs to the paths produced by the app's build. `assetBase` resolves profile-relative URLs before any CSS is written. A native copy can retain package-relative `src/`, `generated/`, and `assets/` directories and import `src/index.js` directly. Include `src/styles.css` using a normal link tag; a vanilla app needs no bundler or React dependency.

| Engine method | Behavior |
| --- | --- |
| `profile`, `approved` | Return isolated copies of active state and approved defaults |
| `subscribe(callback)` | Subscribe to profile changes; returns unsubscribe |
| `preview(fullProfile)` | Development only; validate, persist, apply |
| `setPersonal(flatPaths)` | Production only; merge explicitly permitted preferences |
| `export()` / `import(json)` | Versioned, app-scoped and revision-scoped preference envelopes |
| `reset()` | Remove this scope's preferences and restore approved defaults |
| `dispose()` | Release engine subscriptions/font rules and restore prior inline variables |

Preferences use `polaris:v1:<app>:<revision>:preview` in development and `polaris:v1:<app>:<revision>:personal` in production. The envelope repeats version, app, revision, kind, and value; a mismatch is rejected. Corrupt or stale storage falls back to approved defaults and reports through `onError`. Invalid imports and failed storage writes leave the active state unchanged. Font URL preparation occurs before storage or CSS changes. Pass `storage: null` for intentional session-only behavior or supply a Storage-compatible adapter.

Approved `personal` permissions are explicit paths. The reference profiles permit `material.opacity`, `material.blur`, and `typography.scale`. An app can deliberately add particular palette, semantic, or typography fields:

```js
const profile = structuredClone(profiles.lyra);
profile.personal.push('palette.primary.500', 'semantic.secondaryFill');
// After choosing this profile as the application's approved configuration:
const engine = createDesignEngine({ profile, mode: 'production' });
engine.setPersonal({ 'palette.primary.500': '#009966' });
```

To permit a font choice, include that font in the approved catalog and allow the relevant enabled role's `font` path. If width capability changes, allow and supply that role's `width` too; both fields validate as a complete resulting profile. Preview imports cannot grant production permissions or replace approved fonts. Updating an approved profile should increment its revision; no silent cross-version migration is attempted in v1.

Production mode always ignores development previews. An export is a review artifact, not a publish action: review the settings, update the approved YAML, bump the revision, regenerate, check, and release through the app's normal process. An application must choose its mode from a build/server-owned setting. The showcase intentionally exposes a query-string mode switch for comparison; copying that demo switch into an app is not the integration pattern.

Browser preferences survive ordinary reloads. Clearing site data can erase them. Exporting an envelope provides an external backup; Polaris makes no promise that browser-local storage survives deletion.

## Floating labs

Load labs only in development, after creating the long-lived engine:

```js
if (developmentBuild) {
  const { mountLabs } = await import('@polaris/design-system/labs');
  const { developerFonts } = await import('@polaris/design-system/developer-fonts');
  const labs = mountLabs(engine, { fonts: developerFonts });
  // labs.dispose() removes controls only; the engine and its variables remain active.
}
```

One compact cog with a gold center dot opens the Chroma Lab, Typography Lab, and Glass Lab choices. The menu supports arrow/Home/End keys, Escape, outside dismissal and focus return. Chroma Lab edits every family shade, semantic mapping, status/data/media palette, and reports contrast. Typography Lab enables optional roles and edits family, weight, size, scale, line height, tracking and genuine variable width. Both offer a labelled JSON import/export area, validation errors, and reset. Their native dialogs support keyboard navigation, Escape and return focus to the cog. Calling `mountLabs` for a production engine creates no controls.

## React integration

React is optional and is supplied by the consuming application:

```jsx
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { createReactBindings } from '@polaris/design-system/react';

const { useDesign, Header } = createReactBindings(React);
// engine was already created at application startup, outside this component.
function App() {
  const profile = useDesign(engine);
  return <>
    <Header brand={brand} actions={headerActions} />
    <main data-profile-revision={profile.revision}>
      <h1 data-polaris-role="serif_heading">A little light, remembered.</h1>
    </main>
  </>;
}
createRoot(document.getElementById('root')).render(<App />);
```

Keep `brand` and `headerActions` stable with module constants or memoization to avoid unnecessary header replacement. `useDesign` subscribes/unsubscribes as React mounts and unmounts; that does not dispose the engine. The shared CSS supports `[data-polaris-role]`, `.polaris-button`, `.polaris-button-primary`, `.polaris-button-secondary`, and `.polaris-surface` without forcing a broader component library.

## Header contract

The sticky header is a full-width component with equal left/right grid tracks and a centered brand. Each side has a hard capacity of **three units**. An icon is one unit; a rectangular action is 1.5. Three icons or two rectangles fit on either side; four rectangles fit as two on each side. Actions specify ID, label, kind, side, optional priority, icon, link or click handler.

```js
const header = mountHeader({
  container: document.getElementById('header'),
  brand: { label: 'Lyra', image: '/logo.png', href: '/' },
  actions: [
    { id: 'home', label: 'Home', kind: 'icon', icon: '⌂', side: 'left', href: '/', priority: 10 },
    { id: 'library', label: 'Library', kind: 'button', side: 'left', href: '/library' },
    { id: 'settings', label: 'Settings', kind: 'button', side: 'right', onClick: openSettings },
  ],
});
```

Overflow reserves one unit on the right for the hamburger, which can displace another right action. Actual rendered widths, gaps, font loading and viewport space can collapse actions before the weighted limit. A ResizeObserver recalculates as typography changes. Priority determines which actions remain visible within each side; all overflow actions remain reachable. `planHeader` exposes the pure algorithm for testing.

The overflow dialog uses ordinary links/buttons and native dialog semantics, with arrow/Home/End shortcuts, Escape, focus containment and return. A bounded 44px hamburger stays reachable even during extreme typography experiments. The header host belongs at the viewport edge, not inside a constrained card or transformed ancestor. On teardown, call the returned `dispose()`.

## YAML content engine

The build parses YAML strictly, rejects duplicates/aliases/invalid shapes, and validates strings before emitting deterministic JS and declarations. `check:generated` compares generated results without modifying files. Generated content keys form a closed TypeScript union, and runtime lookup rejects unknown keys.

```js
import { createContentEngine } from '@polaris/design-system';
import { content } from '@polaris/design-system/content';
const copy = createContentEngine(content, { mode: 'production', app: 'lyra' });
element.textContent = copy.text('header.actionFeedback', { action: 'Library' });
```

Render text through `textContent` or normal React text children. The engine returns plain strings and never inserts HTML. Required `{parameters}` must be supplied. Development previews preserve the approved key set and placeholder contracts, support export/import/reset, and persist under a separate `content-preview` scope. Production never reads that scope. The showcase has a working development-only introduction editor; approved wording is published by editing YAML and regenerating artifacts.

## Source-app migration boundaries

The original source audit and package-fixture verification notes are in `docs/source-audit.md` and `docs/design-verification.md` in the Polaris repository. Initial extraction treated the apps as read-only references. The subsequent consumer phase connects Lyra and Krona to the shared runtime; photography continues to be read-only. Each app documents its actual integration coverage rather than claiming complete contract conformance.

For **photography**, the following is a future migration plan, not completed work: mount the engine once before the root React render and replace menu-mounted Chroma/Typography preference owners with lab views over it. This addresses Chroma reverting on close and Typography hydrating only after reopening a menu. Public header/menu globals, body/control surfaces, text/borders, and status variables need explicit semantic mappings. Keep route-specific semantics explicit rather than deriving them from a family name. The `photographyAliases` opt-in bridge is a migration starting point, not full CSS parity.

The photography reference covers **dark browser UI only**. Its existing light routes require separately approved palettes/mappings before migration. Ceremonial headings can use a component-specific role mapping; the reference's serif-body role demonstrates Cormorant with a different body size. Email HTML and contract/PDF outputs retain their separate renderer/font contracts and are not styled by a browser-root engine. Existing decorative script had no page consumer; this fixture deliberately exercises it. Production font loading no longer depends on development CSS.

For **Lyra**, the actual browser shell now loads native modules at startup without adding React or runtime npm dependencies. Its app-owned profile and CSS bridge connect page/accent/text, header materials, glass/control surfaces, semantic playback actions, real typography roles, status, and categorical chart colors. Existing glass-level calibrations remain explicit offsets around the Balanced material baseline. The functional header, legacy copy, artwork sampling/shader preferences and volume/intensity scale remain Lyra-owned. See Lyra's `docs/POLARIS.md` and its native integration tests for coverage and snapshot update instructions.

For **Krona**, the actual static application now loads the shared startup engine with its own light profile, preserving ivory surfaces, sage, deep-green actions and existing Mulish/Lustria typography. Its app-owned token bridge connects existing UI consumers, while a development server enables the shared cog; ordinary production static files remain lab-free. Budget, recurrence, guide and backup data/models remain outside the design integration. The date/profile workflow header and existing non-YAML copy remain app-owned. Krona's integration documentation and tests define its precise coverage.

`installAliases(target, aliases)` validates names, installs CSS references and returns cleanup that restores pre-existing inline values. It provides an opt-in bridge for targeted migration; importing the package alone changes no app.

## Known v1 limits

- The package reference profiles are dark browser examples. Actual apps own their approvals; Krona supplies a light profile. Neither fixtures nor partial consumer adoption claim complete visual parity or contract conformance across every app route.
- The engine provides preferences and contracts; apps decide which public settings UI to expose. Developer controls are not an authorization system.
- Revisions invalidate old preferences rather than performing automatic migrations. Storage updates are scoped to the current engine; cross-tab live synchronization is not included.
- The small shared component set is intentional: header, semantic buttons/surfaces, typography-role styling, and lab fields/dialogs. Existing application-specific layouts remain app-owned.
- The supported browser target is modern native ES modules, dialog, ResizeObserver and CSS color-mix. Material fallbacks cover reduced transparency/forced colors; older browser polyfills are app-owned.

Typography Lab defaults to Heading, Body, Label, Control, Script, and Monospace. The “Separate serif and sans-serif styles” toggle reveals the separate heading/body roles without changing saved design values. In the simplified view, edits apply to all enabled members of the selected group; font-family changes preserve each member’s size and spacing. The lab panel and controls use the application’s live semantic colors.

Glass Lab owns material controls: live opacity and blur sliders, a patterned surface specimen, and optional saturation/border-opacity fields. Reset glass restores only approved material settings and preserves color and typography edits. The shared engine retains these settings after closing the lab or reloading; existing app-specific glass-level offsets and reduced-transparency preferences still apply.

The shared launcher uses Polaris-owned dark glass, emerald/teal/violet aurora surfaces, and North Gold accents from the Polaris logo. These scoped brand tokens are separate from app theme tokens; the lab panels still follow the consuming app’s live colors.
