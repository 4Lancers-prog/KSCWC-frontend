// SignUpPage.tsx — new operator registration wired to the API.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthShell } from '@/components/layout/AuthShell';
import { Button, Input, FormField, Alert, PasswordInput, PasswordRules, PasswordMatch } from '@/components/ui';
import { registerForm, type RegisterForm } from '@/lib/schemas';
import { api, ApiClientError } from '@/lib/api-client';
import { L, H } from '@/i18n';
import type { SessionUser } from '@/types/api';

export function SignUpPage() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerForm),
    // Check each field when the user leaves it, then re-check live while they fix it.
    mode: 'onTouched',
  });
  const pw = watch('password') ?? '';
  const confirmPw = watch('confirm') ?? '';

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await api<{ user: SessionUser }>('/auth/register', {
        method: 'POST',
        body: {
          fullName: values.fullName,
          phone: values.phone,
          email: values.email || undefined,
          centreName: values.centreName || undefined,
          cscId: values.cscId || undefined,
          password: values.password,
        },
      });
      navigate('/pending');
    } catch (err) {
      if (err instanceof ApiClientError) {
        // map server field errors back onto the form
        err.fieldErrors?.forEach((fe) => {
          if (['fullName', 'phone', 'email', 'centreName', 'cscId', 'password'].includes(fe.field)) {
            setError(fe.field as keyof RegisterForm, { message: fe.message });
          }
        });
        setFormError(err.message);
        return;
      }
      setFormError('ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ · Could not register. Please try again.');
    }
  });

  return (
    <AuthShell
      title={L.register_title}
      subtitle={H.register_title}
      footer={
        <span>
          {L.have_account}{' '}
          <Link to="/login" className="font-medium text-navy-600 link">
            {L.login}
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {formError && <Alert tone="error">{formError}</Alert>}

        <FormField id="fullName" label={L.field_full_name} helper={H.field_full_name} error={errors.fullName?.message} required>
          <Input id="fullName" autoComplete="name" invalid={!!errors.fullName} {...register('fullName')} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="phone" label={L.field_phone} helper={H.field_phone} error={errors.phone?.message} required>
            <Input id="phone" type="tel" inputMode="numeric" autoComplete="username"
              invalid={!!errors.phone} {...register('phone')} />
          </FormField>
          <FormField id="email" label={L.field_email} helper={H.field_email} error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" invalid={!!errors.email} {...register('email')} />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="centreName" label={L.field_centre} helper={H.field_centre} error={errors.centreName?.message}>
            <Input id="centreName" invalid={!!errors.centreName} {...register('centreName')} />
          </FormField>
          <FormField id="cscId" label={L.field_csc_id} helper={H.field_csc_id} error={errors.cscId?.message}>
            <Input id="cscId" invalid={!!errors.cscId} {...register('cscId')} />
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="password" label={L.field_password} helper="Min 12 characters" error={errors.password?.message}
            hint={<PasswordRules value={pw} />} required>
            <PasswordInput id="password" autoComplete="new-password"
              invalid={!!errors.password} {...register('password', { deps: confirmPw ? ['confirm'] : [] })} />
          </FormField>
          <FormField id="confirm" label="ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ" helper="Confirm password" error={errors.confirm?.message}
            hint={<PasswordMatch password={pw} confirm={confirmPw} />} required>
            <PasswordInput id="confirm" autoComplete="new-password"
              invalid={!!errors.confirm} {...register('confirm')} />
          </FormField>
        </div>

        <Button type="submit" block loading={isSubmitting}>
          {L.submit_register}
        </Button>
      </form>
    </AuthShell>
  );
}
