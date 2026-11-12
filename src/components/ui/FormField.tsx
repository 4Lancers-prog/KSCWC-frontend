// FormField.tsx — label (Kannada) + optional English helper + inline error, wired for a11y.
import { type ReactNode } from 'react';

interface Props {
  id: string;
  label: string;
  helper?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({ id, label, helper, error, required, children }: Props) {
  const describedBy = error ? `${id}-error` : helper ? `${id}-helper` : undefined;
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex items-baseline gap-2 text-sm font-medium text-navy-900">
        <span>{label}</span>
        {required && <span className="text-danger" aria-hidden>*</span>}
        {helper && <span className="text-xs font-normal text-slate2">{helper}</span>}
      </label>
      {/* clone-free: the field is expected to carry id + aria-describedby itself */}
      <div aria-describedby={describedBy}>{children}</div>
      {error && (
        <p id={`${id}-error`} className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
