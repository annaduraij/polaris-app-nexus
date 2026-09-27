# Photography and Lyra source audit

Inspected on 27 September 2026. This document records the evidence behind the
shared package and the checks required before either existing app can claim
Polaris conformance. Reference profiles and demonstrations are not evidence of a
completed migration of those applications.

## Source boundaries

Photography was inspected at local branch `codex/typography-font-previews`, commit
`fa3e0a7`, including substantial uncommitted public-site work. Lyra was inspected
at `codex/lyra-nexus-domain`, commit `cd99bff`. The Polaris package starts from
`origin/main` at `d389ef0`. The source apps remain independent repositories.

Photography's uncommitted public routes and content must not be silently bundled
into a shared-package commit. A later app migration must coordinate with that
work, preserve its current behavior, and run its route-specific checks.

## Typography findings

Photography's `src/hooks/useTypographyPreferences.ts` defines five choices that
feed eight aliases:

| Selection | Default | Consumers |
| --- | --- | --- |
| Display | Lustria | Display and section headings |
| System | Mulish | Body, metadata, labels, controls |
| Serif | Cormorant Infant | Ceremonial contract headings |
| Script | Great Vibes | Alias exists; no page-style consumer found |
| Mono | JetBrains Mono | Technical text in the app styles |

This is not eight independently configurable styles. In particular, serif body
copy and sans-serif headings have no independent selection. Several consumers
set their own weight, size, line height, and tracking. Those properties need role
ownership as well as font-family ownership.

`src/styles/global.css` loads Lustria, Mulish, and Cormorant Infant. Great Vibes
and JetBrains Mono are imported by `src/styles/dev-typography-lab.css`, which is
loaded by developer controls. A font named in a production token is not
necessarily an available production font. The new package must load the fonts
selected by enabled roles regardless of whether a lab is mounted.

The local TrueType `fvar` tables were inspected directly:

| Asset | Axes |
| --- | --- |
| MonaSans-Variable.ttf and italic counterpart | width 75–125; weight 200–900 |
| Mulish variable assets | weight 200–1000; no width axis |
| Afacad variable assets | weight 400–700; no width axis |
| Inclusive Sans variable assets | weight 300–700; no width axis |

Mona Sans is not a current photography picker choice. Width capability must come
from catalog metadata matching the actual asset. A font being variable does not
imply that it supports width. Character width and tracking are separate controls.

Lyra uses a system sans-serif stack in `public/styles/foundation.css`. Most text
inherits it. `library.css` and `utilities.css` define monospace text for IDs and
diagnostics, and `player.css` has a small generic sans-serif repeat marker.
There is no existing typography role registry or lab.

## Runtime lifecycle failures reproduced

On the photography development server's `/sessions` page:

1. Open navigation and Chroma Lab. Set Page Background to Neutral, shade 300.
2. The public shell's computed background is `rgb(16, 16, 16)`.
3. Close navigation. Its computed background reverts to `rgb(0, 0, 0)`.

For typography:

1. Choose Prata for Display, then close navigation. The heading stays Prata.
2. Reload with navigation closed. The heading uses Lustria.
3. Open navigation. The saved Prata choice is applied.

`src/components/shared/PublicHeader.tsx` mounts `AppearanceControls` only inside
its open-menu branch. Chroma's hook removes managed variables on unmount;
Typography leaves its variables in place but cannot hydrate before mounting.
This explains the different failure modes. The new engine must initialize at
app launch, remain active when all panels are closed, and hydrate before the
first meaningful app render. Lab visibility must not own engine lifetime.

## Color and material findings

Photography already uses semantic CSS variables broadly. Its Chroma Lab edits
seven universal slots and dedicated carousel/flash-contract slots. It does not
own all visible colors: public header/menu tokens, gallery glass, text, borders,
status colors, and several carousel details remain separate. Some are deliberate
exceptions; all need explicit ownership in the consuming app's contract.

Generated contract and receipt HTML use a renderer palette and email-safe fonts.
These are separate output targets. They should declare their supported role
mapping rather than silently claiming parity with browser-only fonts or effects.

Lyra separates neutral materials from media colors:

- `public/styles/material-tokens.css`: material opacity, blur, highlights, base
  charcoal, and readable accent text.
- `public/styles/materials.css`: maps interface surfaces and states to materials.
- `public/player/ambient-settings.js`: Spotify, album-derived, or custom media
  palettes; up to five custom visualization colors.
- `public/components/level-scale.js`: functional volume/intensity ranges.

Lyra's `--green` and `--material-accent-text` are independent literals today.
Both should derive from the approved primary family while preserving different
contrast requirements. White foregrounds and white secondary-action fills may
share a neutral source but must remain independently addressable semantic roles.
Artwork and data colors must not be forced into the four brand families.

## Header findings and accepted contract

Both apps have sticky headers and equal outer grid tracks around a centered
brand. Lyra's desktop search state changes to unequal tracks; that state needs
separate centerline verification. Photography currently uses a public menu at
all widths, while Lyra has three main navigation icons plus utility actions.

The agreed shared rule is a capacity of three units **per side** of the logo:

- Circular icon: one unit.
- Rectangular text action: one and a half units.
- The hamburger consumes one unit on its own side.
- Two rectangular actions per side fit; three on one side do not.
- Actual available space may cause earlier collapse.

Overflow planning must reserve room for the hamburger before choosing which
actions remain visible. It must preserve every action, stable order, accessible
names, and focus return. The logo must stay on the viewport centerline with
unequal action counts and after customization increases text width or size.

## Acceptance matrix

These are behavior checks, not claims that all source-app routes already pass.

| Area | Required evidence |
| --- | --- |
| Lifecycle | Close/reopen both labs, navigate, reload; chosen roles remain applied |
| Production | Engines apply approved config without loading or showing dev labs |
| Preferences | Dev experiments do not leak into public preferences; malformed or mismatched stored data falls back safely |
| Palette roles | Changing secondary action does not recolor primary text; changing a family updates every role mapped to it |
| Materials | Color customization preserves glass intensity and media palette independence |
| Typography | Every enabled role has a real consumer; disabled roles are absent from controls and font loading |
| Font assets | Selected fonts load outside developer mode; unsupported width cannot be committed |
| Content | YAML generation is deterministic; stale output and invalid keys fail checks |
| Header | Per-side weighted capacity, hamburger reservation, narrow layout, large text, keyboard navigation |
| Import/export | Valid round trip; reject unknown versions and invalid fields without partial application |
| App migration | Real app consumers, output exceptions, and route-level behavior verified before declaring conformance |

The source audit found that photography's existing text and design guards and
19 focused helper tests pass even though the menu lifecycle failures above
occur. Static token checks and helper tests must be supplemented by interaction
checks against real consumers.
