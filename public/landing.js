/* Author: Codex | Project: Polaris | Date: 2026-09-27
 * File: landing.js | Description: Toggle one app's extended story at a time. */

const rows = [...document.querySelectorAll('.app-row')];

function setExpanded(row, expanded) {
  const button = row.querySelector('.app-details-toggle');
  const panel = row.querySelector('.app-details');
  const name = row.querySelector('.app-line strong').textContent;
  button.setAttribute('aria-expanded', String(expanded));
  button.setAttribute('aria-label', `${expanded ? 'Hide' : 'Show'} ${name} details`);
  panel.hidden = !expanded;
}

for (const row of rows) {
  const button = row.querySelector('.app-details-toggle');
  setExpanded(row, false);
  button.hidden = false;
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') === 'true';
    for (const other of rows) setExpanded(other, false);
    if (!open) setExpanded(row, true);
  });
}
