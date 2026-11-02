# Interface Conventions

**Status:** Accepted design guidance, November 2, 2026, from the Print Lab interface review. These conventions guide new work and deliberate revisions across Polaris applications. Recording them does not establish implementation or deployment in the shared package or any consumer.

## Copy And Labels

Use direct, functional copy that names the task, setting, or result. Prefer **Configuration**, **Image Details**, and **Paper Dimensions** to slogans or metaphorical introductions. Avoid poetic or marketing taglines such as “A little perspective for your pixels” in working interfaces. An application name does not require a supporting slogan.

Use Title Case for headings, section names, control labels, option labels, and named actions, including **Target PPI** and **About And Sources**. Preserve established technical capitalization such as PPI, APS-C, and megapixel abbreviations. Use sentence case for explanatory prose, complete sentences, errors, and longer instructions.

Keep the wording precise enough to distinguish related objects. For example, image dimensions and paper dimensions describe different things; a label such as “Actual Photograph” does not communicate which measurement is shown. Put a short dimension value beside the relevant object, including in parentheses when that keeps the label compact.

## Controls And Configuration

Use compact chips for a short set of common presets or mutually exclusive choices. Avoid numbered promotional cards when the user is selecting a setting. Numbers should communicate an actual required order, rather than decorate parallel options.

Use independent toggles for capabilities that can operate together. Reserve a single-choice selector for genuinely exclusive alternatives. Label each toggle by the capability it adds, and make the current combination understandable without treating it as a numbered journey. In Print Lab, **Composition-Aware** and **Distance-Aware** can be combined; **Direct PPI** describes the baseline when neither is enabled.

Put a unit selector immediately above or beside the input it controls. Keep the current physical quantity when switching units. Distinguish this local input unit from any separate display-unit setting. Expose useful, short preset lists near the affected preview rather than requiring a trip to global settings for routine changes.

Group related controls in an accordion when collapsing that group helps users focus on the result. Give the accordion a concrete name and a clear expanded state. Print Lab's **Layout** is one such group; this is not a requirement to place every application section in an accordion.

## Progressive Detail

Make the amount of visible information follow the chosen level of control. A simple mode should provide a quick, trustworthy view of the result, with short explicit statements of its assumptions. Avoid filling it with advanced specifications that the user cannot edit there.

For a workflow that needs three levels, use **Simple**, **Advanced**, and **Extended** consistently:

- **Simple:** Essential inputs, a clear preview, and concise descriptions of automatic behavior.
- **Advanced:** Common adjustments and the measurements needed to understand them.
- **Extended:** Independent adjustments, full relevant metadata, and diagnostic values.

Each level must still communicate the operation accurately. Progressive disclosure should reduce detail without hiding a consequential effect or inventing a simpler result. Do not add three levels to a workflow that has no need for them.

## Previews And Measurements

Make the visual preview respond to the operation being selected. If two options produce different placement or cropping, show the difference in the image itself and explain it in concise helper text. A static illustration that obscures the difference is insufficient.

Label source/image dimensions, output/paper dimensions, intentional borders, unused fit space, and cropped content separately when those concepts exist. Prefer linked **Horizontal Borders** and **Vertical Borders** for common symmetric adjustments; reveal independent sides when users request finer control. Keep the preview boundary visible so an intentional crop cannot be confused with clipped interface content.

Put the target or requested result before the measured result in the local reading order. Explain comparisons to a target in terms of that target. Avoid unexplained competing “recommended” values when the workflow already provides a target control.

## Appearance And Application Boundaries

Keep useful appearance controls, including **Glass Opacity** and **Text Scale**, available and clearly named. The Print Lab review explicitly retained these controls, its **Target PPI** setting, and **About And Sources**. Preserve their usefulness while revising surrounding layout and copy.

The request for a custom green-to-lime resolution scale belongs to Print Lab's data visualization. It does not change Polaris brand colors or establish a universal status palette. Likewise, camera crop modes, paper presets, and print diagnostics remain application-owned requirements.

These conventions complement the [design-system integration contract](design-system.md) and [Polaris appearance](../DESIGN.md). App feature documents own implementation, availability, and verification evidence under the [feature documentation convention](features/README.md).
