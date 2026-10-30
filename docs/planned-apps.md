# Planned Polaris applications

This register groups proposed applications under Polaris before a runnable release exists. Each application's repository owns its plan and future implementation. Planning status does not imply a deployed app or completed design-system integration.

| Application | Repository | Status | Intended platform |
| --- | --- | --- | --- |
| Photography PPI Calculator | [photography-dpi-calculator](https://github.com/annaduraij/photography-dpi-calculator) | Rough plan; private repository initialized October 30, 2026 | Web |

## Photography PPI Calculator

Enter image pixel dimensions, or megapixels with an aspect ratio, then compare standard and custom print sizes in one table. Show effective PPI, crop or border information, and a nonlinear heatmap with a fixed 0–600 PPI range. The interface will use PPI for image resolution even though the repository slug contains `dpi`.

The [application plan](https://github.com/annaduraij/photography-dpi-calculator/blob/main/PLAN.md) defines proposed inputs, calculation formulas, example results, gradient stops, and implementation stages. Access to the repository is currently private.

Proposed shared design integration will use an app-owned Polaris profile. Its logo, palette, hosting address, and release stage remain undecided. Add the application to `scripts/sync-app-contract.mjs` after its README identity contract and release stage are ready; add a public launch link after the destination resolves and serves the app.
