// index.ts — Kannada-first labels with English helper lookup.
import { kn, type I18nKey } from './kn';
import { en } from './en';

export const L = kn; // primary (Kannada)
export const H = en; // helper (English)
export type { I18nKey };

/** Primary Kannada label. */
export const t = (key: I18nKey): string => kn[key];
/** English helper for the same key. */
export const th = (key: I18nKey): string => en[key];
