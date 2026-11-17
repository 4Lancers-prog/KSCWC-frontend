// CategorySelect.tsx — pick a category or sub-category (sub-categories are indented under theirs).
import { Select } from './Select';
import { buildTree, catLabel } from '@/lib/categories';
import type { Category } from '@/types/entities';

export function CategorySelect({
  id, name, categories, value, defaultValue, onChange, allowNone = true, topLevelOnly = false, noneLabel,
}: {
  id: string;
  name?: string;
  categories: Category[] | undefined;
  value?: string;
  defaultValue?: string;
  onChange?: (v: string) => void;
  allowNone?: boolean;
  topLevelOnly?: boolean;
  noneLabel?: string;
}) {
  const tree = buildTree(categories);
  return (
    <Select id={id} name={name} value={value} defaultValue={defaultValue} onChange={(e) => onChange?.(e.target.value)}>
      {allowNone && <option value="">{noneLabel ?? '— ವರ್ಗ ಇಲ್ಲ · No category —'}</option>}
      {tree.map(({ cat, children }) => [
        <option key={cat.id} value={cat.id}>{catLabel(cat)}</option>,
        ...(topLevelOnly ? [] : children.map((c) => <option key={c.id} value={c.id}>{'\u00A0\u00A0\u00A0\u00A0↳ '}{catLabel(c)}</option>)),
      ])}
    </Select>
  );
}
