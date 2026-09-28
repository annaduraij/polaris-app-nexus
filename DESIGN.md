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

The aurora spans the whole page behind the content. It stays subtle enough for readable text. North Gold identifies Polaris controls and focus, while each app row uses its own README color contract. The North Star logo retains its transparent center and gold gradient. The shared lab launcher uses the same named aurora and gold colors.

## Landing layout

The introduction is centered and borderless at desktop, tablet, and phone widths. Compact app rows appear in the order Lyra, Krona, Ren. A row shows the logo, name, five-word subtitle, and launch or availability state on one line. Its separate Details button opens the description and inspiration. Opening one row closes the previous one. Lyra and Krona launch their existing public apps; Ren remains a non-interactive coming-soon entry.

App logos are copied from their source repositories by `npm run sync:apps`, and the app README remains the source of truth for app copy and colors. The generated markup and landing script keep the extra copy available when JavaScript is unavailable. Keyboard focus is visible, all row controls meet a 44px target, reduced motion stops aurora movement, and high-contrast modes preserve readable surfaces.
