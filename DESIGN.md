# Polaris appearance

The entrance uses near-black glass with emerald, teal, cyan, and violet light integrated into the hero and app-card surfaces. The page outside those surfaces stays dark. CSS gradients supply the aurora; no generated concept image or animation dependency is shipped.

Cards appear in this order: Lyra, Krona, Enigma. Lyra and Krona link to their existing app domains. Enigma remains a non-interactive coming-soon card with a temporary typographic mark.

## Brand assets

- `public/brand/lyra.png` is copied unchanged from Lyra's `public/brand/lyra-192.png`.
- `public/brand/krona.svg` is copied unchanged from Krona's `dist/icons/krona-crown.svg`, used by its header and favicon.
- Polaris retains its existing North Star logo and favicon.

The brand files are served locally so cards do not depend on requests to another app. Refresh these copies if the source apps change their identities.

## Layout and access

Desktop uses a two-column hero and three equal app cards. At 760px and below the hero and cards stack. Text sits over a dark gradient scrim. Navigation has visible keyboard focus, a skip link, and at least 44px-high header actions. Reduced-motion disables interaction movement and smooth scrolling; reduced-transparency and increased-contrast preferences use opaque surfaces. Forced-colors mode preserves borders and focus indicators.

Only the header uses backdrop blur. The cards share a translucent black base and static gradient reflections, avoiding multiple nested blur layers.
