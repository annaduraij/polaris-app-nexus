/* Author: Codex | Project: Polaris | Date: 2026-09-27
 * File: header.js | Description: Viewport-centered sticky header with weighted and measured action overflow. */
import { content } from '../generated/content.js';
const weight = action => action.kind === 'icon' ? 1 : 1.5;

/** Pure layout calculation. Overflow reserves one right-hand unit for its trigger. */
export function planHeader(actions, { leftWidth = Infinity, rightWidth = Infinity, widths = {}, gap = 8, menuWidth = 44, capacity = 3 } = {}) {
  if (!Array.isArray(actions) || actions.some(a => !a || typeof a.id !== 'string' || !['icon', 'button'].includes(a.kind) || !['left', 'right'].includes(a.side))) throw new Error('Actions require a unique id, side and icon/button kind');
  if (new Set(actions.map(a => a.id)).size !== actions.length) throw new Error('Header action ids must be unique');
  if (![leftWidth, rightWidth].every(n => n >= 0) || !Number.isFinite(capacity) || capacity < 1 || capacity > 3) throw new Error('Invalid header capacity');
  const pick = (side, reserveMenu) => {
    const candidates = actions.filter(a => a.side === side).sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
    let units = reserveMenu ? 1 : 0, pixels = reserveMenu ? menuWidth : 0, count = reserveMenu ? 1 : 0;
    const ids = new Set();
    for (const action of candidates) {
      const size = widths[action.id] ?? (action.kind === 'icon' ? 44 : 96);
      const nextPixels = pixels + size + (count ? gap : 0);
      if (units + weight(action) <= capacity && nextPixels <= (side === 'left' ? leftWidth : rightWidth)) {
        ids.add(action.id); units += weight(action); pixels = nextPixels; count++;
      }
    }
    return actions.filter(a => ids.has(a.id));
  };
  const left = pick('left', false);
  let right = pick('right', false);
  if (left.length + right.length < actions.length) right = pick('right', true);
  const visible = new Set([...left, ...right].map(a => a.id));
  return { left, right, overflow: actions.filter(a => !visible.has(a.id)), units: { left: left.reduce((n, a) => n + weight(a), 0), right: right.reduce((n, a) => n + weight(a), 0) + (visible.size < actions.length ? 1 : 0) } };
}

/** Full-width header; keep its containing block free of transforms for viewport centering. */
export function mountHeader({ container, brand, actions = [], copy = content }) {
  if (!container?.ownerDocument) throw new Error('Header requires a container element');
  planHeader(actions);
  const doc = container.ownerDocument, win = doc.defaultView;
  const header = doc.createElement('header'); header.className = 'polaris-header';
  const left = doc.createElement('nav'), right = doc.createElement('nav');
  left.className = 'polaris-header-side'; right.className = 'polaris-header-side polaris-header-right';
  left.setAttribute('aria-label', copy['header.primary']); right.setAttribute('aria-label', copy['header.secondary']);
  const logo = doc.createElement(brand.href ? 'a' : 'span'); logo.className = 'polaris-header-brand';
  logo.textContent = brand.label; if (brand.href) logo.href = safeHref(brand.href);
  if (brand.image) { const img = doc.createElement('img'); img.src = safeHref(brand.image); img.alt = ''; logo.prepend(img); }
  const menu = doc.createElement('button'); menu.type = 'button'; menu.className = 'polaris-button polaris-icon-button polaris-overflow-trigger'; menu.textContent = '☰'; menu.setAttribute('aria-label', copy['header.more']); menu.setAttribute('aria-haspopup', 'dialog'); menu.setAttribute('aria-expanded', 'false');
  const dialog = doc.createElement('dialog'); dialog.className = 'polaris-header-menu'; dialog.setAttribute('aria-label', copy['header.more']);
  const heading = doc.createElement('h2'); heading.textContent = copy['header.more'];
  const close = doc.createElement('button'); close.type = 'button'; close.className = 'polaris-button'; close.textContent = copy['header.close'];
  const list = doc.createElement('div'); list.className = 'polaris-menu-actions';
  dialog.append(heading, list, close);
  const measure = doc.createElement('div'); measure.className = 'polaris-header-measure'; measure.setAttribute('aria-hidden', 'true'); measure.inert = true;
  function actionNode(action, inMenu = false) {
    const node = doc.createElement(action.href ? 'a' : 'button');
    if (action.href) node.href = safeHref(action.href); else node.type = 'button';
    node.className = `polaris-button${action.kind === 'icon' && !inMenu ? ' polaris-icon-button' : ''}`;
    node.textContent = action.kind === 'icon' && !inMenu ? (action.icon ?? action.label.slice(0, 1)) : action.label;
    node.setAttribute('aria-label', action.label); node.dataset.actionId = action.id;
    node.addEventListener('click', event => { if (inMenu) dialog.close(); action.onClick?.(event); });
    return node;
  }
  for (const action of actions) measure.append(actionNode(action));
  const menuMeasure = menu.cloneNode(true); measure.append(menuMeasure);
  header.append(left, logo, right, measure); container.append(header, dialog);
  menu.addEventListener('click', () => { dialog.showModal(); menu.setAttribute('aria-expanded', 'true'); });
  close.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog && !insideRect(e, dialog.getBoundingClientRect())) dialog.close(); });
  dialog.addEventListener('close', () => { menu.setAttribute('aria-expanded', 'false'); if (!menu.hidden && menu.isConnected) menu.focus(); else if (logo.isConnected) logo.focus(); });
  dialog.addEventListener('keydown', event => {
    const items = [...list.querySelectorAll('button,a')];
    if (!items.length || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); const index = items.indexOf(doc.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (index + (event.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
    items[next].focus();
  });
  let disposed = false, lastSignature = '', currentPlan;
  function layout() {
    if (disposed) return;
    const viewport = doc.documentElement.clientWidth;
    const brandWidth = logo.getBoundingClientRect().width;
    const available = Math.max(0, (viewport - brandWidth) / 2 - 32);
    const widths = Object.fromEntries([...measure.querySelectorAll('[data-action-id]')].map(node => [node.dataset.actionId, Math.ceil(node.getBoundingClientRect().width)]));
    currentPlan = planHeader(actions, { leftWidth: available, rightWidth: available, widths, menuWidth: menuMeasure.getBoundingClientRect().width || 44 });
    const signature = JSON.stringify([currentPlan.left.map(a => a.id), currentPlan.right.map(a => a.id)]);
    if (signature === lastSignature) return;
    lastSignature = signature;
    const focusedId = doc.activeElement?.dataset.actionId;
    left.replaceChildren(...currentPlan.left.map(a => actionNode(a)));
    right.replaceChildren(...currentPlan.right.map(a => actionNode(a)));
    list.replaceChildren(...currentPlan.overflow.map(a => actionNode(a, true)));
    menu.hidden = !currentPlan.overflow.length;
    if (!menu.hidden) right.append(menu);
    if (dialog.open && menu.hidden) dialog.close();
    if (focusedId) {
      if (dialog.open) {
        const replacement = [...list.querySelectorAll('[data-action-id]')].find(n => n.dataset.actionId === focusedId);
        (replacement ?? list.querySelector('button,a') ?? close).focus();
      } else {
        const replacement = [...header.querySelectorAll('[data-action-id]')].find(n => n.dataset.actionId === focusedId && !measure.contains(n));
        (replacement ?? (!menu.hidden ? menu : logo)).focus();
      }
    }
  }
  const observer = win?.ResizeObserver ? new win.ResizeObserver(layout) : null;
  observer?.observe(header); observer?.observe(logo); observer?.observe(measure);
  win?.addEventListener('resize', layout); doc.fonts?.addEventListener('loadingdone', layout);
  layout();
  return { element: header, layout, get plan() { return currentPlan; }, dispose() { disposed = true; observer?.disconnect(); win?.removeEventListener('resize', layout); doc.fonts?.removeEventListener('loadingdone', layout); if (dialog.open) dialog.close(); header.remove(); dialog.remove(); } };
}
function safeHref(value) {
  if (typeof value !== 'string' || !['http:', 'https:'].includes(new URL(value, 'https://polaris.invalid/').protocol)) throw new Error('Unsafe header URL');
  return value;
}
function insideRect(event, rect) { return event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom; }
