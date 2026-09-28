# Design-system verification

Verified locally on 27 September 2026 at `http://localhost:8016/design-system/`
using the real in-app Chromium browser. These results cover the Polaris package
and reference consumers, not a migration of the original applications.

## Browser interaction results

- **Photography / React:** selected Mona Sans for the heading role and changed
  its real `wdth` axis to 124. Computed CSS showed `"wdth" 124, "wght" 400`
  after closing the lab and after reloading with both labs closed.
- **Chroma:** changed the page to neutral 700 and the secondary action to
  secondary 300. Computed colors became `rgb(26, 27, 29)` and
  `rgb(217, 199, 133)`; white foreground text remained white. Both changes
  survived closing the lab and reloading. Contrast diagnostics updated during
  editing.
- **Portable previews:** exported the edited profile, reset it, and imported
  the export. Color and width values returned. An incomplete version-99 import
  displayed a validation error and left the applied page unchanged.
- **Content:** edited the introduction through the development preview,
  reloaded, and confirmed the text remained. Reset restored approved copy.
- **Production:** no lab dialogs were mounted. Photography emitted only its
  selected font faces. A personal text scale of 1.05 survived reload; reset
  returned it to 1. Lyra used the system font stack, emitted no font faces,
  and used its approved 14px controls despite a 28px development experiment.
- **Vanilla consumer:** the Lyra reference rendered and responded to the same
  engine and lab APIs used by the React reference.
- **Responsive header:** at 375px, the brand center was exactly 187.5px;
  overflow preserved all seven actions. At 320px with 28px controls, the brand
  center was 160px and measured overflow retained only the fitting Home and
  hamburger controls. Neither viewport had horizontal page overflow.
- **Keyboard and resize:** End moved to the last overflow action; Escape
  closed the dialog and returned focus to the hamburger. Resizing an open
  menu from 320px to 1280px kept focus inside the dialog when its previously
  focused action became visible in the header.
- **Mobile labs:** inspected Typography Lab at 320px. Fields, scrolling,
  disabled width explanations, and the sticky Close control remained usable.

All test-only color, type, content and personal overrides were reset afterward.

## Automated coverage

The Node suites exercise strict profile validation, palette-role independence,
optional typography roles, actual font binary axis metadata, lifecycle and
storage isolation, atomic rejection of invalid imports, permitted personal
overrides, content interpolation and persistence, and weighted header planning.
Run `npm test` for the current complete suite. Generated YAML drift, syntax,
package typing, and build checks belong to the repository validation commands.

An independent packaging smoke test installed the `npm pack` tarball in a fresh
temporary consumer project. Root, profiles, content, labs and React adapter
imports resolved without installing React. The vanilla engine mounted and
disposed successfully, and TypeScript strict NodeNext imports compiled. The
tarball included declarations, schemas, local fonts, licenses and integration
documentation (41 files, approximately 630 KB compressed at verification).

## Scope limits

The profiles demonstrate dark browser UI. Existing photography light routes,
generated contracts/receipts, email typography, app-specific player/gallery
components, and every original app route require separate migration checks.
No claim of browser coverage beyond the tested Chromium environment is made.
Browser storage survives ordinary reloads but can be lost when site data is
cleared; exported previews provide a portable recovery path.
