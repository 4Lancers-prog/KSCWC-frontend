// Table.tsx — data table. Desktop/tablet: a normal table (scrolls inside its own box if wide).
// Phones: every row becomes a card and every cell shows its column name (see .rtable in globals.css).
// The column names are copied onto the cells automatically, so pages don't need any changes.
import { useLayoutEffect, useRef, type ReactNode } from 'react';

function labelCells(table: HTMLTableElement) {
  const heads = [...table.querySelectorAll('thead th')].map((th) => (th.textContent ?? '').replace(/\s+/g, ' ').trim());
  for (const tr of table.querySelectorAll('tbody tr')) {
    let col = 0;
    for (const td of tr.children) {
      const span = Number(td.getAttribute('colspan') ?? 1);
      const label = span > 1 ? '' : heads[col] ?? '';
      if (td.getAttribute('data-label') !== label) td.setAttribute('data-label', label);
      col += span;
    }
  }
}

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLTableElement>(null);
  useLayoutEffect(() => {
    const t = ref.current;
    if (!t) return;
    labelCells(t);
    const mo = new MutationObserver(() => labelCells(t)); // rows change with paging/filtering
    mo.observe(t, { childList: true, subtree: true, characterData: true });
    return () => mo.disconnect();
  }, []);
  return (
    <div className="relative overflow-x-auto rounded-xl2 border border-line bg-white">
      <table ref={ref} className={`rtable w-full border-collapse text-left text-sm ${className ?? ''}`}>{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <th className={`whitespace-nowrap border-b border-line px-4 py-3 font-semibold text-navy-800 ${className ?? ''}`}>
      {children}
    </th>
  );
}

export function Td({ children, className, colSpan }: { children: ReactNode; className?: string; colSpan?: number }) {
  return <td colSpan={colSpan} className={`border-b border-line px-4 py-3 text-slate2 ${className ?? ''}`}>{children}</td>;
}
