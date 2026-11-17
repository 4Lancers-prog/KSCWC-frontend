// SignUpPage.tsx — new operator registration wired to the API.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AuthShell } from '@/components/layout/AuthShell';
import { Button, Input, FormField, Alert, PasswordInput, PasswordRules, PasswordMatch } from '@/components/ui';
import { registerForm, type RegisterForm } from '@/lib/schemas';
import { apiForm, ApiClientError } from '@/lib/api-client';
import { aadhaarDigits, aadhaarProblem, formatAadhaar, formatPan, panProblem } from '@/lib/identity';
import { shrinkImage } from '@/lib/image-shrink';
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
  const aadhaarReg = register('aadhaar');
  const panReg = register('pan');
  const aadhaarOk = !aadhaarProblem(watch('aadhaar') ?? '');
  const panOk = !panProblem(watch('pan') ?? '');
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const confirmPw = watch('confirm') ?? '';

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      // sent as a form so the optional centre logo can travel with it
      const fd = new FormData();
      fd.append('fullName', values.fullName);
      fd.append('phone', values.phone);
      if (values.email) fd.append('email', values.email);
      if (values.centreName) fd.append('centreName', values.centreName);
      if (values.cscId) fd.append('cscId', values.cscId);
      fd.append('aadhaar', aadhaarDigits(values.aadhaar));
      fd.append('pan', formatPan(values.pan));
      fd.append('password', values.password);
      if (logo) fd.append('logo', await shrinkImage(logo, 512));
      await apiForm<{ user: SessionUser }>('/auth/register', fd);
      navigate('/pending');
    } catch (err) {
      if (err instanceof ApiClientError) {
        // map server field errors back onto the form
        err.fieldErrors?.forEach((fe) => {
          if (['fullName', 'phone', 'email', 'centreName', 'cscId', 'aadhaar', 'pan', 'password'].includes(fe.field)) {
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
          <FormField id="aadhaar" label="ಆಧಾರ್ ಸಂಖ್ಯೆ" helper="Aadhaar number (12 digits) — stored securely, shown masked" error={errors.aadhaar?.message}
            hint={aadhaarOk ? <p className="text-xs text-emerald-700">✓ ಸರಿಯಾಗಿದೆ · Looks valid</p> : undefined} required>
            <Input id="aadhaar" inputMode="numeric" autoComplete="off" placeholder="1234 5678 9012" maxLength={14}
              invalid={!!errors.aadhaar} {...aadhaarReg}
              onChange={(e) => { e.target.value = formatAadhaar(e.target.value); void aadhaarReg.onChange(e); }} />
          </FormField>
          <FormField id="pan" label="ಪ್ಯಾನ್ ಸಂಖ್ಯೆ" helper="PAN (e.g. ABCDE1234F)" error={errors.pan?.message}
            hint={panOk ? <p className="text-xs text-emerald-700">✓ ಸರಿಯಾಗಿದೆ · Looks valid</p> : undefined} required>
            <Input id="pan" autoComplete="off" autoCapitalize="characters" placeholder="ABCDE1234F" maxLength={10}
              invalid={!!errors.pan} {...panReg}
              onChange={(e) => { e.target.value = formatPan(e.target.value); void panReg.onChange(e); }} />
          </FormField>
        </div>

        <FormField id="logo" label="ಕೇಂದ್ರದ ಲೋಗೋ" helper="Centre logo (optional) — PNG or JPG; phone photos are resized automatically">
          <div className="flex items-center gap-3">
            {logoPreview
              ? <img src={logoPreview} alt="" className="h-14 w-14 shrink-0 rounded-xl border border-line bg-white object-contain" />
              : <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-dashed border-line text-xs text-slate2">ಲೋಗೋ</span>}
            <input id="logo" type="file" accept="image/png,image/jpeg,image/webp"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setLogo(f);
                setLogoPreview((old) => { if (old) URL.revokeObjectURL(old); return f ? URL.createObjectURL(f) : null; });
              }}
              className="block w-full min-w-0 rounded-lg border border-[#c3cfe2] bg-white text-sm file:mr-3 file:rounded-l-lg file:border-0 file:bg-navy-50 file:px-3 file:py-2.5 file:font-semibold file:text-navy-800 hover:file:bg-navy-100" />
          </div>
        </FormField>

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
