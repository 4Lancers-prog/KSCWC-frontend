// LoginPage.tsx — operator login wired to the API (handles pending + MFA).
import { useEffect, useState } from 'react';
import { clearSignedOutNote, peekSignedOutNote } from '@/lib/device';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthShell } from '@/components/layout/AuthShell';
import { Button, Input, FormField, Alert, PasswordInput } from '@/components/ui';
import { loginForm, type LoginForm } from '@/lib/schemas';
import { useAuth } from '@/hooks/useAuth';
import { ApiClientError } from '@/lib/api-client';
import { L, H } from '@/i18n';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  // Shown once if the previous login was ended by another device or an admin.
  const [signedOutNote] = useState(() => peekSignedOutNote());
  useEffect(() => clearSignedOutNote(), []); // show it once
  const [mfaRequired, setMfaRequired] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginForm), mode: 'onTouched' });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const { user, mfaSetupRequired } = await login({
        phone: values.phone,
        password: values.password,
        mfaToken: values.mfaToken || undefined,
      });
      // Staff land on the admin console; operators on their dashboard (or the page they came from).
      if (mfaSetupRequired) navigate('/admin/mfa-setup', { replace: true });
      else if (user.role !== 'USER') navigate('/admin', { replace: true });
      else navigate(from && from.startsWith('/app') ? from : '/app', { replace: true });
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === 'MFA_REQUIRED') {
          setMfaRequired(true);
          setFormError('ದೃಢೀಕರಣ ಕೋಡ್ ನಮೂದಿಸಿ · Enter your authenticator code');
          return;
        }
        if (err.code === 'ACCOUNT_PENDING') {
          navigate('/pending', { state: { fromLogin: true } });
          return;
        }
        if (err.code === 'ACCOUNT_REJECTED') {
          setFormError(`ನೋಂದಣಿ ತಿರಸ್ಕರಿಸಲಾಗಿದೆ · ${err.message}`);
          return;
        }
        if (err.code === 'ACTIVE_ON_OTHER_DEVICE') {
          setFormError(`ಈ ಖಾತೆ ಇನ್ನೊಂದು ಸಾಧನದಲ್ಲಿ ಬಳಕೆಯಲ್ಲಿದೆ · ${err.message}`);
          return;
        }
        if (err.code === 'DEVICE_LIMIT') {
          setFormError(`ಸಾಧನಗಳ ಮಿತಿ ತಲುಪಿದೆ · ${err.message}`);
          return;
        }
        if (err.code === 'ACCOUNT_SUSPENDED') {
          setFormError(`ಖಾತೆ ಅಮಾನತುಗೊಂಡಿದೆ · ${err.message}`);
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
          <Link to="/forgot-password" className="font-medium text-navy-600 link">
            {L.forgot_password}
          </Link>
          <span>
            {L.no_account}{' '}
            <Link to="/register" className="font-medium text-navy-600 link">
              {L.register}
            </Link>
          </span>
        </div>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {signedOutNote && !formError && (
          <Alert tone="info">ನೀವು ಸೈನ್ ಔಟ್ ಆಗಿದ್ದೀರಿ · {signedOutNote}</Alert>
        )}
        {formError && <Alert tone="error">{formError}</Alert>}

        <FormField id="phone" label={L.field_phone} helper={H.field_phone} error={errors.phone?.message} required>
          <Input id="phone" type="tel" inputMode="numeric" autoComplete="username"
            invalid={!!errors.phone} {...register('phone')} />
        </FormField>

        <FormField id="password" label={L.field_password} helper={H.field_password} error={errors.password?.message} required>
          <PasswordInput id="password" autoComplete="current-password"
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
