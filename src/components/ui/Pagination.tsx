// Pagination.tsx — simple prev/next pager with page info.
import { Button } from './Button';

export function Pagination({
  page,
  totalPages,
  total,
  onChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
}) {
  if (total === 0) return null;
  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-sm text-slate2">
      <span>
        ಪುಟ {page} / {totalPages} · ಒಟ್ಟು {total}
      </span>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          ಹಿಂದಿನ
        </Button>
        <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          ಮುಂದಿನ
        </Button>
      </div>
    </div>
  );
}
