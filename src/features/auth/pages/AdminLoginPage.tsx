// AdminLoginPage.tsx — dedicated, separate admin entrance (/admin/login).
// Operators who sign in here are rejected and told to use the main login.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, FormField, Alert, PasswordInput } from '@/components/ui';
import { Emblem } from '@/components/Emblem';
import { loginForm, type LoginForm } from '@/lib/schemas';
import { useAuth } from '@/hooks/useAuth';
import { ApiClientError } from '@/lib/api-client';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [mfaRequired, setMfaRequired] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    mode: 'onTouched',
    resolver: zodResolver(loginForm),
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const { user, mfaSetupRequired } = await login({ phone: values.phone, password: values.password, mfaToken: values.mfaToken || undefined });
      if (user.role === 'USER') {
        await logout();
        setFormError('ಈ ಪ್ರವೇಶ ನಿರ್ವಾಹಕ ಖಾತೆಗಳಿಗೆ ಮಾತ್ರ · This entrance is for admin accounts. Operators sign in at the main login.');
        return;
      }
      navigate(mfaSetupRequired ? '/admin/mfa-setup' : '/admin', { replace: true });
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === 'MFA_REQUIRED') { setMfaRequired(true); setFormError('ದೃಢೀಕರಣ ಕೋಡ್ ನಮೂದಿಸಿ · Enter your authenticator code'); return; }
        if (err.code === 'ACCOUNT_PENDING') { setFormError('ಖಾತೆ ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ · Account awaiting approval'); return; }
        setFormError(err.message);
        return;
      }
      setFormError('ಪ್ರವೇಶ ವಿಫಲ · Could not sign in.');
    }
  });

  return (
    <div className="grid min-h-screen place-items-center bg-navy-950 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-xl2 bg-white shadow-lift animate-fade-up">
        {/* distinct dark admin header strip */}
        <div className="bg-navy-900 px-6 py-6 text-white">
          <div className="flex items-center gap-3">
            <Emblem size={40} />
            <div>
              <p className="font-display text-lg font-bold">ನಿರ್ವಾಹಕ ಕನ್ಸೋಲ್</p>
              <p className="text-xs text-navy-100">Admin console — authorised staff only</p>
            </div>
          </div>
          <div className="mt-4 h-[3px] w-14 rounded-full bg-gold-500" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-6" noValidate>
          {formError && <Alert tone="error">{formError}</Alert>}
          <FormField id="phone" label="ಮೊಬೈಲ್ ಸಂಖ್ಯೆ" helper="Mobile number" error={errors.phone?.message} required>
            <Input id="phone" type="tel" inputMode="numeric" autoComplete="username" invalid={!!errors.phone} {...register('phone')} />
          </FormField>
          <FormField id="password" label="ಪಾಸ್‌ವರ್ಡ್" helper="Password" error={errors.password?.message} required>
            <PasswordInput id="password" autoComplete="current-password" invalid={!!errors.password} {...register('password')} />
          </FormField>
          {mfaRequired && (
            <FormField id="mfaToken" label="ದೃಢೀಕರಣ ಕೋಡ್" helper="Authenticator code" error={errors.mfaToken?.message}>
              <Input id="mfaToken" inputMode="numeric" autoComplete="one-time-code" maxLength={6} {...register('mfaToken')} />
            </FormField>
          )}
          <Button type="submit" block loading={isSubmitting}>ನಿರ್ವಾಹಕ ಪ್ರವೇಶ · Admin sign in</Button>
          <p className="text-center text-sm text-slate2">
            ಸಂಚಾಲಕರೇ? <Link to="/login" className="font-medium text-navy-600 link">ಇಲ್ಲಿ ಪ್ರವೇಶಿಸಿ · Operator login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
