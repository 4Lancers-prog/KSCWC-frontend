// Table.tsx — horizontally-scrollable table wrapper (per BPD: tables scroll on small screens).
import { type ReactNode } from 'react';

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl2 border border-line bg-white">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
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
