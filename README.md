# Polaris

**Jay's App Nexus** is a static overview of Ajay's apps. It has no runtime dependencies. Its app cards are generated from the opening paragraphs of the Lyra, Krona, and Ren READMEs.

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

Run `npm run sync:apps` after changing an app identity. The command expects the `lyra-music`, `krona-budget`, and `enigma-misc` checkouts under `/Users/ajay/projects` in this workspace. Set `POLARIS_APPS_ROOT` to the parent directory of those repositories elsewhere. Ren is the current identity of the `enigma-misc` repository; its Polaris card stays non-clickable until a public destination is ready.

## Preview

From the `public` directory, run `python3 -m http.server 8000` and open <http://localhost:8000>.

## Publish

Run `npm run deploy` from this directory. Its predeploy step syncs the app contracts. The Worker serves the static files in `public` at `ajay.nexus`, and redirects `ajay.nexus/polaris/` and `polaris.ajay.nexus` to the main address.

Update the URL mapping in `scripts/sync-app-contract.mjs` when an app's public destination changes. Keep a card non-clickable until its destination resolves and serves the app.
