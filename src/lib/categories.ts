// categories.ts — turn the flat category list into category → sub-categories, and name paths.
import type { Category } from '@/types/entities';

export interface CategoryNode { cat: Category; children: Category[] }

const bySort = (a: Category, b: Category) => a.sortOrder - b.sortOrder || a.nameKn.localeCompare(b.nameKn);

export function buildTree(cats: Category[] = []): CategoryNode[] {
  const tops = cats.filter((c) => !c.parentId).sort(bySort);
  return tops.map((cat) => ({ cat, children: cats.filter((c) => c.parentId === cat.id).sort(bySort) }));
}

export const catLabel = (c: Category) => (c.nameEn ? `${c.nameKn} · ${c.nameEn}` : c.nameKn);

/** "ಕರ್ನಾಟಕ ಸರ್ಕಾರ › ಕಂದಾಯ" */
export function categoryPath(cats: Category[] = [], id?: string | null): string {
  const c = cats.find((x) => x.id === id);
  if (!c) return '—';
  const parent = c.parentId ? cats.find((x) => x.id === c.parentId) : null;
  return parent ? `${parent.nameKn} › ${c.nameKn}` : c.nameKn;
}

/**
 * Group items under category → sub-category, in the admin's order. Items whose category is
 * missing/deleted land in an "Other" group at the end.
 */
export function groupByCategory<T>(items: T[], cats: Category[] = [], catOf: (t: T) => string | null | undefined) {
  const tree = buildTree(cats);
  const known = new Set(cats.map((c) => c.id));
  const groups = tree
    .map(({ cat, children }) => ({
      cat,
      direct: items.filter((i) => catOf(i) === cat.id),
      subs: children.map((sub) => ({ cat: sub, items: items.filter((i) => catOf(i) === sub.id) })).filter((s) => s.items.length),
    }))
    .filter((g) => g.direct.length || g.subs.length);
  const orphans = items.filter((i) => !known.has(catOf(i) ?? ''));
  return { groups, orphans };
}
