# Interface Conventions

**Status:** Accepted design guidance, November 2, 2026, from the Print Lab interface review. These conventions guide new work and deliberate revisions across Polaris applications. Recording them does not establish implementation or deployment in the shared package or any consumer.

## Copy And Labels

Use direct, functional copy that names the task, setting, or result. Prefer **Configuration**, **Image Details**, and **Paper Dimensions** to slogans or metaphorical introductions. Avoid poetic or marketing taglines such as “A little perspective for your pixels” in working interfaces. An application name does not require a supporting slogan.

Use Title Case for headings, section names, control labels, option labels, and named actions, including **Target PPI** and **About And Sources**. Preserve established technical capitalization such as PPI, APS-C, and megapixel abbreviations. Use sentence case for explanatory prose, complete sentences, errors, and longer instructions.

Keep the wording precise enough to distinguish related objects. For example, image dimensions and paper dimensions describe different things; a label such as “Actual Photograph” does not communicate which measurement is shown. Put a short dimension value beside the relevant object, including in parentheses when that keeps the label compact.

## Controls And Configuration

Use compact chips for a short set of common presets or mutually exclusive choices. Avoid numbered promotional cards when the user is selecting a setting. Numbers should communicate an actual required order, rather than decorate parallel options.

Use visibly recognizable switches, with a track and thumb, for independent capabilities that can operate together. A selected chip alone does not communicate the requested on/off behavior. Reserve a single-choice selector for genuinely exclusive alternatives. Label each toggle by the capability it adds, and make the current combination understandable without treating it as a numbered journey. In Print Lab, **Composition-Aware** and **Distance-Aware** can be combined; **Direct PPI** describes the baseline when neither is enabled.

Center compatible awareness switches within Configuration and center the Resolution selector within its section. Keep detail-level controls at the top right of their panel. Reduce redundant rows, excess padding, and empty preview space while preserving readable text and reachable controls. Use modest corner radii on compact preset buttons and center common paper presets within their preview group. Keep unit preferences subtle within Configuration. Show primary PPI values with one short visual-acuity percentage beneath them, and combine related scale labels instead of repeating separate legends and explanatory blocks.

Put a unit selector immediately above or beside the input it controls. Keep the current physical quantity when switching units. Distinguish this local input unit from any separate display-unit setting. Expose useful, short preset lists near the affected preview rather than requiring a trip to global settings for routine changes.

Group related controls in an accordion when collapsing that group helps users focus on the result. Give the accordion a concrete name and a clear expanded state. Print Lab's **Layout** is one such group; this is not a requirement to place every application section in an accordion.

## Progressive Detail

Make the amount of visible information follow the chosen level of control. A simple mode should provide a quick, trustworthy view of the result, with short explicit statements of its assumptions. Avoid filling it with advanced specifications that the user cannot edit there.

For a workflow that needs three levels, use **Simple**, **Advanced**, and **Extended** consistently:

- **Simple:** Essential inputs, a clear preview, and concise descriptions of automatic behavior.
- **Advanced:** Common adjustments and the measurements needed to understand them.
- **Extended:** Independent adjustments, full relevant metadata, and diagnostic values.

Compact selectors may abbreviate their visible labels when space is limited, while preserving full accessible names and tooltips. The Print Lab review accepted **Bas / Adv / Ext** for **Basic / Advanced / Extended**; its Basic level retains the existing Simple behavior.

Each level must still communicate the operation accurately. Progressive disclosure should reduce detail without hiding a consequential effect or inventing a simpler result. Do not add three levels to a workflow that has no need for them.

## Previews And Measurements

Make the visual preview respond to the operation being selected. If two options produce different placement or cropping, show the difference in the image itself and explain it in concise helper text. A static illustration that obscures the difference is insufficient.

Label source/image dimensions, output/paper dimensions, intentional borders, unused fit space, and cropped content separately when those concepts exist. Prefer linked **Horizontal Borders** and **Vertical Borders** for common symmetric adjustments; reveal independent sides when users request finer control. Show paired inputs or individual-side inputs one set at a time; avoid exposing redundant rows for the same physical adjustment. For spatial placement, use a three-by-three anchor grid with directional SVG arrows and a center dot, and give every position a text label for accessibility. Keep the preview boundary visible so an intentional crop cannot be confused with clipped interface content.

Put the target or requested result before the measured result in the local reading order. Explain comparisons to a target in terms of that target. Use a narrow dedicated target-status column when inline check/cross symbols crowd the measured value. Keep the column compact rather than repeating a full text outcome in every row. Use SVG symbols with accessible labels. Visually mute rows that fall below the chosen target while preserving the full color and opacity of their measurement heatmaps. Keep those rows usable and retain the selected-row highlight. Keep an adjusted or relative reference distinct from the underlying physical measure; a reference percentage must not be labeled as raw PPI. Avoid unexplained competing “recommended” values when the workflow already provides a target control.

Use a three-column footer: relevant application information on the left, the existing symmetric Polaris logo centered, and **Jay Annadurai** on the right. Keep the logo centered independently of the text widths. Pull the canonical `public/logo.svg` from Polaris and scale it; do not redraw it. This is accepted design guidance, not a claim that all app footers have been migrated.

## Appearance And Application Boundaries

Keep useful appearance controls, including **Glass Opacity** and **Text Scale**, available and clearly named. The Print Lab review explicitly retained these controls, its **Target PPI** setting, and **About And Sources**. Preserve their usefulness while revising surrounding layout and copy.

The request for a custom green-to-lime resolution scale belongs to Print Lab's data visualization. It does not change Polaris brand colors or establish a universal status palette. Likewise, camera crop modes, paper presets, and print diagnostics remain application-owned requirements.

These conventions complement the [design-system integration contract](design-system.md) and [Polaris appearance](../DESIGN.md). App feature documents own implementation, availability, and verification evidence under the [feature documentation convention](features/README.md).
