# Polaris appearance and role

Polaris is Jay's App Nexus and the shared design and application architecture system behind it. It gives applications common design contracts, controls, themes, and simple surfaces while allowing each app to keep its own identity. The landing page introduces the apps; the design-system showcase demonstrates the shared system.

## Polaris palette

Polaris owns a distinct identity separate from the consuming apps:

| Role | Color | Use |
| --- | --- | --- |
| Charcoal | `#07090b` | Page foundation |
| Glass | `rgba(12, 14, 18, .83)` | Compact controls and app-row insets |
| Aurora emerald | `#3dffa6` | Background light |
| Aurora teal | `#20e7ee` | Background light |
| Aurora cyan | `#638bff` | Background light |
| Aurora violet | `#dc76ff` | Background light |
| North Gold | `#d9a55d` | Brand outline and accent |
| North Gold light | `#fff4cf` | Logo highlight and focus |

Circular aurora glows span the whole page and gather around the title. A charcoal glass tint keeps the text readable without putting the introduction inside a bordered card. North Gold identifies Polaris controls and focus, while each app row uses its own color contract. The North Star logo retains its transparent center and gold gradient. The shared lab launcher uses the same named aurora and gold colors. Polaris uses the bundled **Mulish** variable font for its landing page and showcase chrome; each consuming app retains its own typography profile.

## Landing layout

The introduction is centered and borderless at desktop, tablet, and phone widths. Compact app rows appear in the order Lyra, Krona, Ren, Fano. A row shows the logo or placeholder mark, name, five-word subtitle, and launch or release state on one line. A plus control before the launch arrow expands the description and inspiration within the row and becomes a minus to collapse it. Opening one row closes the previous one. The design system invitation follows the apps.

Lyra and Krona launch their existing public apps. **Beta** means live for private use; Ren has this label and no public launch link. **Alpha** means an early preview; Fano has this label and no public launch link. These release labels are Polaris-owned app metadata in `scripts/sync-app-contract.mjs`, separate from the shared design package's success/warning/error/info status colors.

Lyra, Krona, and Ren logos are copied from their source repositories by `npm run sync:apps`, and their READMEs remain the source of truth for app copy and colors. Fano is a local CLI without that identity block, so Polaris supplies a manual text and color preview with a placeholder mark. The generated markup and landing script keep the extra copy available when JavaScript is unavailable. Keyboard focus is visible, all row controls meet a 44px target, reduced motion stops aurora movement, and high-contrast modes preserve readable surfaces.
