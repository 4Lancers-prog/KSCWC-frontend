// PasswordInput.tsx — password field with a show/hide (eye) button.
// Works with react-hook-form's register() (forwards the ref to the real <input>).
import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Input } from './Input';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  invalid?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, Props>(function PasswordInput(
  { className, ...rest },
  ref,
) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input ref={ref} type={show ? 'text' : 'password'} className={`pr-11 ${className ?? ''}`} {...rest} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password · ಪಾಸ್‌ವರ್ಡ್ ಮರೆಮಾಡಿ' : 'Show password · ಪಾಸ್‌ವರ್ಡ್ ತೋರಿಸಿ'}
        aria-pressed={show}
        aria-controls={rest.id}
        title={show ? 'Hide password' : 'Show password'}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-slate2 transition-colors hover:text-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500/40"
      >
        {show ? (
          // eye-off
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M10.7 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.2 3.2" />
            <path d="M6.6 6.6A17.4 17.4 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6" />
            <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
            <path d="m2 2 20 20" />
          </svg>
        ) : (
          // eye
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
});

/** Live feedback under a new-password field / its confirmation, shown while typing. */
export function PasswordRules({ value, min = 12 }: { value: string; min?: number }) {
  const ok = value.length >= min;
  return (
    <p className={`text-xs ${ok ? 'text-emerald-700' : 'text-slate2'}`} aria-live="polite">
      {ok ? '✓' : '•'} {value.length}/{min} ಅಕ್ಷರಗಳು · at least {min} characters
    </p>
  );
}

export function PasswordMatch({ password, confirm }: { password: string; confirm: string }) {
  if (!confirm) return null;
  const ok = password === confirm;
  return (
    <p className={`text-xs ${ok ? 'text-emerald-700' : 'text-danger'}`} aria-live="polite">
      {ok ? '✓ ಹೊಂದುತ್ತದೆ · Passwords match' : '✗ ಹೊಂದುತ್ತಿಲ್ಲ · Passwords don’t match'}
    </p>
  );
}
