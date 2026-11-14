// ResetPasswordPage.tsx — set a new password using a single-use token from the URL (?token=).
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthShell } from '@/components/layout/AuthShell';
import { Button, Input, FormField, Alert, PasswordInput, PasswordRules, PasswordMatch } from '@/components/ui';
import { resetForm } from '@/lib/schemas';
import { api, ApiClientError } from '@/lib/api-client';
import { L } from '@/i18n';
import type { z } from 'zod';

type Form = z.infer<typeof resetForm>;

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Form>({
    mode: 'onTouched',
    resolver: zodResolver(resetForm),
    defaultValues: { token: params.get('token') ?? '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await api('/auth/reset-password', { method: 'POST', body: { token: values.token, password: values.password } });
      navigate('/login');
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : 'Could not reset password.');
    }
  });

  return (
    <AuthShell
      title="ಹೊಸ ಪಾಸ್‌ವರ್ಡ್"
      subtitle="Choose a new password"
      footer={<Link to="/login" className="font-medium text-navy-600 link">{L.login}</Link>}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {formError && <Alert tone="error">{formError}</Alert>}
        <FormField id="token" label="ಟೋಕನ್" helper="Reset token" error={errors.token?.message} required>
          <Input id="token" invalid={!!errors.token} {...register('token')} />
        </FormField>
        <FormField id="password" label={L.field_password} helper="Min 12 characters" error={errors.password?.message}
          hint={<PasswordRules value={watch('password') ?? ''} />} required>
          <PasswordInput id="password" autoComplete="new-password" invalid={!!errors.password}
            {...register('password', { deps: watch('confirm') ? ['confirm'] : [] })} />
        </FormField>
        <FormField id="confirm" label="ದೃಢೀಕರಿಸಿ" helper="Confirm password" error={errors.confirm?.message}
          hint={<PasswordMatch password={watch('password') ?? ''} confirm={watch('confirm') ?? ''} />} required>
          <PasswordInput id="confirm" autoComplete="new-password" invalid={!!errors.confirm} {...register('confirm')} />
        </FormField>
        <Button type="submit" block loading={isSubmitting}>ಉಳಿಸಿ · Save password</Button>
      </form>
    </AuthShell>
  );
}
