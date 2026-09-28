export type Family = 'neutral' | 'primary' | 'secondary' | 'accent';
export type Shade = '100' | '300' | '500' | '700' | '900';
export type Role = 'serif_heading' | 'sans_heading' | 'serif_body' | 'sans_body' | 'label' | 'control' | 'script' | 'mono';
export type SemanticRole = 'page' | 'surface' | 'surfaceRaised' | 'surfaceInset' | 'text' | 'textMuted' | 'border' | 'focus' | 'primaryFill' | 'primaryText' | 'secondaryFill' | 'secondaryText' | 'headerFill' | 'headerText';
export type ColorReference = `${Family}.${Shade}`;
export type Mode = 'production' | 'development' | 'customization';
export interface FontAsset { url: string; weight: string; style: 'normal' | 'italic' }
export interface FontSpec { family: string; fallback: 'serif' | 'sans-serif' | 'monospace' | 'cursive' | 'system-ui'; assets: FontAsset[]; axes: Partial<Record<'wght' | 'wdth', [number, number]>>; weights: number[] }
export type FontCatalog = Record<string, FontSpec>;
export interface TypeRole { font: string; weight: number; size: number; lineHeight: number; tracking: number; width: number | null }
export type PersonalPath = 'material.opacity' | 'material.blur' | 'typography.scale' | `palette.${Family}.${Shade}` | `semantic.${SemanticRole}` | `typography.roles.${Role}.${keyof TypeRole}`;
export interface DesignProfile {
  version: 1;
  id: string;
  revision: string;
  label: string;
  palette: Record<Family, Record<Shade, string>>;
  semantic: Record<SemanticRole, ColorReference>;
  status: Record<'success' | 'warning' | 'error' | 'info', string>;
  data: string[];
  media: string[];
  material: { opacity: number; blur: number; saturation: number; borderOpacity: number };
  fonts: FontCatalog;
  typography: { scale: number; roles: Partial<Record<Role, TypeRole>> };
  personal: PersonalPath[];
}
export interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }
export interface DesignEngine {
  readonly mode: Mode;
  readonly storageKey: string;
  readonly profile: DesignProfile;
  readonly approved: DesignProfile;
  subscribe(callback: (profile: DesignProfile) => void): () => void;
  preview(profile: DesignProfile): void;
  setPersonal(values: Partial<Record<PersonalPath, string | number | null>>): void;
  reset(): void;
  export(): string;
  import(json: string): void;
  dispose(): void;
}
export function createDesignEngine(options: { profile: DesignProfile; target?: HTMLElement | SVGElement; mode?: Mode; storage?: StorageLike | null; assetBase?: string | URL; onError?: (error: Error) => void }): DesignEngine;
export function compileTokens(profile: DesignProfile): Record<string, string>;
export function selectedFontCSS(profile: DesignProfile, assetBase?: string | URL): string;
export function contrastReport(profile: DesignProfile): Array<{ foreground: string; background: string; ratio: number; passes: boolean }>;
export class ContractError extends Error { constructor(path: string, message: string) }
export const CONTRACT_VERSION: 1;
export const FAMILIES: Family[];
export const SHADES: Shade[];
export const TYPE_ROLES: Role[];
export const SEMANTIC_ROLES: SemanticRole[];
export const PERSONAL_PATHS: PersonalPath[];
export function validateProfile<T extends DesignProfile>(profile: T): T;
export function validateCatalog<T extends FontCatalog>(catalog: T): T;
export function validateContent<T extends Record<string, string>>(content: T, expectedKeys?: string[]): T;
export function validateEnvelope(value: unknown, profile: DesignProfile, kind: 'preview' | 'personal'): unknown;
export function isPersonalPath(path: unknown): path is PersonalPath;
export function applyPersonal(profile: DesignProfile, values: Partial<Record<PersonalPath, string | number | null>>): DesignProfile;
export interface HeaderAction { id: string; label: string; kind: 'icon' | 'button'; side: 'left' | 'right'; icon?: string; href?: string; priority?: number; onClick?: (event: MouseEvent) => void }
export interface HeaderPlan { left: HeaderAction[]; right: HeaderAction[]; overflow: HeaderAction[]; units: { left: number; right: number } }
export interface HeaderOptions { container: HTMLElement; brand: { label: string; href?: string; image?: string }; actions?: HeaderAction[]; copy?: Record<string, string> }
export function planHeader(actions: HeaderAction[], options?: { leftWidth?: number; rightWidth?: number; widths?: Record<string, number>; gap?: number; menuWidth?: number; capacity?: number }): HeaderPlan;
export function mountHeader(options: HeaderOptions): { element: HTMLElement; layout(): void; readonly plan: HeaderPlan; dispose(): void };
export const lyraAliases: Record<string, string>;
export const photographyAliases: Record<string, string>;
export function installAliases(target: HTMLElement | SVGElement, aliases: Record<string, string>): () => void;
export interface ContentEngine<T extends Record<string, string>> {
  readonly storageKey: string;
  readonly content: T;
  text<K extends keyof T>(key: K, values?: Record<string, string | number>): string;
  subscribe(callback: (content: T) => void): () => void;
  preview(content: T): void;
  export(): string;
  import(json: string): void;
  reset(): void;
}
export function createContentEngine<T extends Record<string, string>>(defaults: T, options?: { mode?: Exclude<Mode, 'customization'>; app?: string; revision?: string; storage?: StorageLike | null; onError?: (error: Error) => void }): ContentEngine<T>;
