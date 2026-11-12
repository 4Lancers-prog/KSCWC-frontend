// ForgotPasswordPage.tsx — request a password reset (always succeeds to avoid enumeration).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthShell } from '@/components/layout/AuthShell';
import { Button, Input, FormField, Alert } from '@/components/ui';
import { forgotForm } from '@/lib/schemas';
import { api } from '@/lib/api-client';
import { L, H } from '@/i18n';
import type { z } from 'zod';

type Form = z.infer<typeof forgotForm>;

export function ForgotPasswordPage() {
  const [done, setDone] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(forgotForm),
  });

  const onSubmit = handleSubmit(async (values) => {
    const res = await api<{ ok: boolean; devToken?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: values,
    });
    setDone(res.devToken ? `Dev reset token: ${res.devToken}` : 'If that account exists, a reset link has been sent.');
  });

  return (
    <AuthShell
      title="ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸಿ"
      subtitle="Reset your password"
      footer={<Link to="/login" className="font-medium text-navy-600 hover:underline">{L.login}</Link>}
    >
      {done ? (
        <Alert tone="success">{done}</Alert>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormField id="phone" label={L.field_phone} helper={H.field_phone} error={errors.phone?.message} required>
            <Input id="phone" type="tel" inputMode="numeric" invalid={!!errors.phone} {...register('phone')} />
          </FormField>
          <Button type="submit" block loading={isSubmitting}>ಕಳುಹಿಸಿ · Send reset link</Button>
        </form>
      )}
    </AuthShell>
  );
}
