// ProfilePage.tsx — "My account": your details + change your password.
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Alert, Button, FormField, PasswordInput, PasswordMatch, PasswordRules } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { api, ApiClientError } from '@/lib/api-client';
import { toast } from '@/lib/toast';

const form = z
  .object({
    currentPassword: z.string().min(1, 'ಪ್ರಸ್ತುತ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ · Enter your current password'),
    newPassword: z.string().min(12, 'ಕನಿಷ್ಠ 12 ಅಕ್ಷರಗಳು · Use at least 12 characters').max(128),
    confirm: z.string().min(1, 'ಪಾಸ್‌ವರ್ಡ್ ಮತ್ತೆ ನಮೂದಿಸಿ · Please confirm your password'),
  })
  .refine((v) => !v.confirm || v.newPassword === v.confirm, { message: 'Passwords do not match', path: ['confirm'] });
type Form = z.infer<typeof form>;

const ROLE: Record<string, string> = { USER: 'ಸಂಚಾಲಕ · Operator', ADMIN: 'ನಿರ್ವಾಹಕ · Admin', SUPER_ADMIN: 'ಮುಖ್ಯ ನಿರ್ವಾಹಕ · Super admin', SUPPORT: 'ಸಹಾಯ · Support' };

export function ProfilePage() {
  const { user } = useAuth();
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit, watch, reset, setError, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(form), mode: 'onTouched',
  });
  const pw = watch('newPassword') ?? '';
  const confirm = watch('confirm') ?? '';

  const onSubmit = handleSubmit(async (v) => {
    setErr(null);
    try {
      await api('/auth/change-password', { method: 'POST', body: { currentPassword: v.currentPassword, newPassword: v.newPassword } });
      reset();
      toast('ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾಗಿದೆ · Password changed. Other devices were signed out.', 'success');
    } catch (e) {
      if (e instanceof ApiClientError && e.code === 'WRONG_PASSWORD') setError('currentPassword', { message: 'ಪ್ರಸ್ತುತ ಪಾಸ್‌ವರ್ಡ್ ತಪ್ಪಾಗಿದೆ · Current password is not correct' });
      else setErr(e instanceof ApiClientError ? [e.message, ...(e.fieldErrors ?? []).map((f) => f.message)].join(': ') : 'Could not change password');
    }
  });

  return (
    <div className="max-w-2xl">
      <div className="gold-rule mb-4" />
      <h1 className="font-display text-2xl text-navy-900">ನನ್ನ ಖಾತೆ</h1>
      <p className="mt-1 text-slate2">My account</p>

      <dl className="mt-6 grid gap-4 rounded-xl2 border border-line bg-white p-5 sm:grid-cols-2">
        {[
          ['ಹೆಸರು · Name', user?.fullName],
          ['ಮೊಬೈಲ್ · Mobile', user?.phone],
          ['ಇಮೇಲ್ · Email', user?.email],
          ['ಕೇಂದ್ರ · Centre', user?.centreName],
          ['CSC ID', user?.cscId],
          ['ಪಾತ್ರ · Role', user ? ROLE[user.role] ?? user.role : ''],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs text-slate2">{k}</dt>
            <dd className="font-medium text-navy-900">{v || '—'}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-slate2">ವಿವರಗಳನ್ನು ಬದಲಾಯಿಸಲು ಪರಿಷತ್ ಕಚೇರಿಯನ್ನು ಸಂಪರ್ಕಿಸಿ · To change these details, contact the council office.</p>

      <form onSubmit={onSubmit} noValidate className="mt-8 space-y-4 rounded-xl2 border border-line bg-white p-5">
        <h2 className="font-display text-lg text-navy-900">ಪಾಸ್‌ವರ್ಡ್ ಬದಲಿಸಿ · Change password</h2>
        {err && <Alert tone="error">{err}</Alert>}
        <FormField id="currentPassword" label="ಪ್ರಸ್ತುತ ಪಾಸ್‌ವರ್ಡ್" helper="Current password" error={errors.currentPassword?.message} required>
          <PasswordInput id="currentPassword" autoComplete="current-password" invalid={!!errors.currentPassword} {...register('currentPassword')} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="newPassword" label="ಹೊಸ ಪಾಸ್‌ವರ್ಡ್" helper="New password" error={errors.newPassword?.message}
            hint={<PasswordRules value={pw} />} required>
            <PasswordInput id="newPassword" autoComplete="new-password" invalid={!!errors.newPassword}
              {...register('newPassword', { deps: confirm ? ['confirm'] : [] })} />
          </FormField>
          <FormField id="confirm" label="ಮತ್ತೆ ನಮೂದಿಸಿ" helper="Confirm new password" error={errors.confirm?.message}
            hint={<PasswordMatch password={pw} confirm={confirm} />} required>
            <PasswordInput id="confirm" autoComplete="new-password" invalid={!!errors.confirm} {...register('confirm')} />
          </FormField>
        </div>
        <p className="text-xs text-slate2">ಬದಲಾದ ನಂತರ ಇತರ ಸಾಧನಗಳಿಂದ ನಿರ್ಗಮಿಸಲಾಗುತ್ತದೆ · After changing, you stay logged in here; other devices are signed out.</p>
        <Button type="submit" loading={isSubmitting}>ಪಾಸ್‌ವರ್ಡ್ ಬದಲಿಸಿ · Change password</Button>
      </form>
    </div>
  );
}
