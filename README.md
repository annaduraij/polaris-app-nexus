# Polaris

**Polaris** is Jay's App Nexus and the shared design and application architecture system behind his apps. It centralizes design contracts, common controls, themes, and simple surfaces while preserving each app's own identity. The landing page has no runtime dependencies. Its compact app rows and expandable details use the opening paragraphs of the Lyra, Krona, and Ren READMEs, plus a manual alpha preview for Fano. See [Polaris appearance and palette](DESIGN.md).

## Shared design system

Polaris also provides a versioned, framework-independent design package, always-active color/typography/content engines, developer labs behind one compact cog, and a common responsive header. The live showcase at `/design-system/` includes vanilla and React reference fixtures. Lyra and Krona now have local integrations of the shared startup engine and labs through app-owned profiles and pinned vendor snapshots; their existing headers and legacy copy remain app-owned. Photography remains a read-only reference and has not been modified or migrated. These integrations have not been deployed.

Run `npm ci && npm run build`, then serve `public`. `npm run check` validates YAML and generated drift, runs the regression suite and public API type checks, and performs a Worker deployment dry run. See [the complete integration guide](docs/design-system.md), [source audit](docs/source-audit.md), [browser verification](docs/design-verification.md), and [package](packages/design-system/README.md).

## App identity contract

Each app README begins with the same plain-text fields, before its first `##` heading:

```md
# Application name

![Application logo](path/to/logo.svg)

**Subtitle:** Exactly five words

**Description:** One short sentence explaining what the application does.

**Inspiration:** One short sentence explaining why it was created.

**Primary surface:** #050606 (page charcoal)

**Secondary surface:** #0c0e10 (glass charcoal)

**Secondary color:** #155d46 (forest green)

**Signature color:** #00b377 (playback green)

**Accent color:** #ccee44 (sampled logo yellow-green)
```

The logo path is relative to that app's repository. Polaris checks that all fields exist, that the subtitle has five words, that each description and inspiration is at most 180 characters, and that the five colors are six-digit hex values. The sync command copies the logos and writes the copy and colors into `public/index.html`; the app READMEs remain the source of truth for their identity. A color contract names the surfaces and accents; each application still controls how much of each color it uses.

Run `npm run sync:apps` after changing an app identity. The command looks for sibling `lyra-music`, `krona-budget`, `enigma-misc`, and `fano` checkouts, with the older `/Users/ajay/projects` workspace layout as a fallback. Set `POLARIS_APPS_ROOT` to the parent directory of those repositories elsewhere. Ren is the current identity of the `enigma-misc` repository; its beta card stays non-clickable because it is for private use. Fano is an alpha preview whose public copy and colors currently live in `scripts/sync-app-contract.mjs`, since its local CLI README has no app identity block. Its logo is copied from Fano's canonical `design/logos/primary/fano-logo.svg`. Set `POLARIS_FANO_ROOT` to a clean Fano checkout when the sibling checkout is on an older work branch. Release-stage labels are Polaris-owned metadata, separate from application color and UI-status contracts.

## Preview

Run `npm run build`, then from the `public` directory run `python3 -m http.server 8000` and open <http://localhost:8000>. The design-system showcase is at <http://localhost:8000/design-system/>.

## Publish

Run `npm run deploy` from this directory. Its predeploy step syncs the app contracts. The Worker serves the static files in `public` at `ajay.nexus`, and redirects `ajay.nexus/polaris/` and `polaris.ajay.nexus` to the main address.

Update the URL mapping in `scripts/sync-app-contract.mjs` when an app's public destination changes. Keep a card non-clickable until its destination resolves and serves the app.
