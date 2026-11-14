// FormField.tsx — label (Kannada) + optional English helper + inline error, wired for a11y.
//
// Alignment: fields placed side by side (e.g. Password | Confirm password) used to drift when one
// label wrapped to two lines and pushed its input lower. The field is now a 3-row grid
// [label, input, error] that SUBGRIDS into its parent's rows when the parent is a grid, so every
// label row in a line takes the height of the tallest label and all inputs start on the same line —
// even if only one side shows an error. Outside a grid parent it lays out as a normal stack.
// The English helper sits on its own line so label heights are predictable in the first place.
import { type ReactNode } from 'react';

interface Props {
  id: string;
  label: string;
  helper?: string;
  error?: string;
  required?: boolean;
  /** Live hint shown under the field when there is no error (e.g. password rules). */
  hint?: ReactNode;
  children: ReactNode;
}

export function FormField({ id, label, helper, error, required, hint, children }: Props) {
  const describedBy = error ? `${id}-error` : helper ? `${id}-helper` : undefined;
  return (
    <div className="row-span-3 grid grid-rows-subgrid content-start gap-y-1.5">
      <label htmlFor={id} className="flex flex-col justify-end text-sm font-medium text-navy-900">
        <span>
          {label}
          {required && <span className="ml-1 text-danger" aria-hidden>*</span>}
        </span>
        {helper && (
          <span id={`${id}-helper`} className="text-xs font-normal text-slate2">
            {helper}
          </span>
        )}
      </label>
      {/* clone-free: the field is expected to carry id + aria-describedby itself */}
      <div aria-describedby={describedBy}>{children}</div>
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : (
        hint ?? null
      )}
    </div>
  );
}
