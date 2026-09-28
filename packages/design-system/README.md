# @polaris/design-system

A versioned, framework-independent design package with four palette families, semantic mappings, material settings, optional typography roles, YAML-generated content, accessible components and shared development/public customization labs.

This package has **no runtime dependencies**. The React adapter accepts the consuming application's React instance. Font assets and their OFL licenses are included; only fonts selected by enabled roles receive font-face rules.

```js
import { createDesignEngine, mountHeader } from '@polaris/design-system';
import { profiles } from '@polaris/design-system/profiles';
import '@polaris/design-system/styles.css';

const engine = createDesignEngine({
  profile: profiles.lyra,
  target: document.documentElement,
  mode: 'production',
  assetBase: new URL('/vendor/polaris/', location.origin),
});
```

Copy this package's `assets/` directory to `/vendor/polaris/assets/`, or rewrite the asset URLs in your approved profile. Relative URLs in a dynamically inserted font-face rule otherwise resolve against the document. The engine must be created at application startup, independently of header menus and lab visibility.

See `INTEGRATION.md` for complete vanilla/React integration, generated-content checks, migration boundaries and production policy. Versioned machine-readable schemas are in `contracts/`. Runtime validation additionally checks relationships that JSON Schema cannot express, including font axis ranges, permitted preference paths and app/revision matching.

Consumers can optionally expose the full application at `/polaris` (disabled by default and controlled by app build/server configuration) using `mode: 'customization'`. Its browser-only appearance previews persist separately from developer and normal production preferences. This never enables server development mode or publication; see the route contract in `INTEGRATION.md`.

Glass Lab supports Sliders/Exact and Shared/Split editing across Background, Container, Surface and Functional roles, with Chroma-linked tint, app-calibrated Dramatic/Moderate/Subdued presets, and material-only app/Polaris resets.
