// LoginPage.tsx — operator login wired to the API (handles pending + MFA).
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthShell } from '@/components/layout/AuthShell';
import { Button, Input, FormField, Alert } from '@/components/ui';
import { loginForm, type LoginForm } from '@/lib/schemas';
import { useAuth } from '@/hooks/useAuth';
import { ApiClientError } from '@/lib/api-client';
import { L, H } from '@/i18n';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const [mfaRequired, setMfaRequired] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginForm) });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const user = await login({
        phone: values.phone,
        password: values.password,
        mfaToken: values.mfaToken || undefined,
      });
      // Staff land on the admin console; operators on their dashboard.
      navigate(user.role === 'USER' ? '/app' : '/admin');
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === 'MFA_REQUIRED') {
          setMfaRequired(true);
          setFormError('ದೃಢೀಕರಣ ಕೋಡ್ ನಮೂದಿಸಿ · Enter your authenticator code');
          return;
        }
        if (err.code === 'ACCOUNT_PENDING') {
          navigate('/pending');
          return;
        }
        setFormError(err.message);
        return;
      }
      setFormError('ಪ್ರವೇಶ ವಿಫಲವಾಗಿದೆ · Could not sign in. Please try again.');
    }
  });

  return (
    <AuthShell
      title={L.login_title}
      subtitle={H.login_title}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link to="/forgot-password" className="font-medium text-navy-600 hover:underline">
            {L.forgot_password}
          </Link>
          <span>
            {L.no_account}{' '}
            <Link to="/register" className="font-medium text-navy-600 hover:underline">
              {L.register}
            </Link>
          </span>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {formError && <Alert tone="error">{formError}</Alert>}

        <FormField id="phone" label={L.field_phone} helper={H.field_phone} error={errors.phone?.message} required>
          <Input id="phone" type="tel" inputMode="numeric" autoComplete="username"
            invalid={!!errors.phone} {...register('phone')} />
        </FormField>

        <FormField id="password" label={L.field_password} helper={H.field_password} error={errors.password?.message} required>
          <Input id="password" type="password" autoComplete="current-password"
            invalid={!!errors.password} {...register('password')} />
        </FormField>

        {mfaRequired && (
          <FormField id="mfaToken" label={L.field_mfa} helper={H.field_mfa} error={errors.mfaToken?.message}>
            <Input id="mfaToken" inputMode="numeric" autoComplete="one-time-code" maxLength={6}
              invalid={!!errors.mfaToken} {...register('mfaToken')} />
          </FormField>
        )}

        <Button type="submit" block loading={isSubmitting}>
          {L.submit_login}
        </Button>
      </form>
    </AuthShell>
  );
}
