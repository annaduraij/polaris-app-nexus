import type { DesignEngine, FontCatalog } from './index.js';
export function mountLabs(engine: DesignEngine, options?: { container?: HTMLElement; fonts?: FontCatalog; copy?: Record<string, string> }): { dispose(): void };
