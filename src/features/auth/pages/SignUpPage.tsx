// SignUpPage.tsx — new operator registration, in two steps:
//   1) account details, then
//   2) pay the registration fee by scanning the admin-published QR and entering the transaction
//      reference (UTR) + optional screenshot. On submit the account is created as PENDING_APPROVAL
//      and the user is sent to the "waiting for approval" page.
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { AuthShell } from '@/components/layout/AuthShell';
import { Button, Input, FormField, Alert, PasswordInput, PasswordRules, PasswordMatch } from '@/components/ui';
import { registerForm, type RegisterForm } from '@/lib/schemas';
import { api, apiForm, ApiClientError } from '@/lib/api-client';
import { aadhaarDigits, aadhaarProblem, formatAadhaar, formatPan, panProblem } from '@/lib/identity';
import { shrinkImage } from '@/lib/image-shrink';
import { L, H } from '@/i18n';
import type { SessionUser } from '@/types/api';

// Step-1 fields we validate before moving on to payment.
const STEP1_FIELDS = ['fullName', 'phone', 'email', 'centreName', 'cscId', 'aadhaar', 'pan', 'password', 'confirm'] as const;

interface Scanner {
  configured: boolean;
  upiId?: string;
  payeeName?: string;
  note?: string | null;
  imageUrl?: string;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

export function SignUpPage() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  // Payment (step 2) — kept as plain state, like the logo, so requiredness can depend on whether
  // the council has published a scanner yet.
  const [payAmount, setPayAmount] = useState('');
  const [payUtr, setPayUtr] = useState('');
  const [proof, setProof] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  const scanner = useQuery({
    queryKey: ['registration-scanner'],
    queryFn: () => api<Scanner>('/auth/registration-scanner'),
    retry: false,
    staleTime: 5 * 60_000,
  });
  const scannerReady = scanner.data?.configured === true;

  const {
    register,
    handleSubmit,
    setError,
    trigger,
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

  // Step 1 → 2: only advance once the account fields are valid.
  const goToPayment = async () => {
    setFormError(null);
    const ok = await trigger(STEP1_FIELDS as unknown as (keyof RegisterForm)[]);
    if (ok) setStep(2);
  };

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setPayError(null);

    // Require a transaction reference once a scanner is published; keep it optional otherwise so
    // registration still works before the admin has set one up.
    const utr = payUtr.trim().toUpperCase();
    if (scannerReady) {
      if (!utr) {
        setPayError('ಪಾವತಿ ಉಲ್ಲೇಖ / UTR ನಮೂದಿಸಿ · Enter the payment reference / UTR after paying');
        return;
      }
      if (!/^[A-Z0-9]{6,32}$/.test(utr)) {
        setPayError('UTR 6–32 ಅಕ್ಷರ/ಅಂಕಿಗಳಾಗಿರಬೇಕು · UTR must be 6–32 letters or digits');
        return;
      }
    }

    try {
      // sent as a form so the optional centre logo + payment screenshot can travel with it
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

      if (utr) fd.append('paymentUtr', utr);
      const amt = Number(payAmount);
      if (payAmount.trim() && Number.isFinite(amt) && amt > 0) {
        fd.append('paymentAmountPaise', String(Math.round(amt * 100)));
      }
      if (proof) fd.append('paymentProof', await shrinkImage(proof, 1024));

      await apiForm<{ user: SessionUser }>('/auth/register', fd);
      navigate('/pending');
    } catch (err) {
      if (err instanceof ApiClientError) {
        // map server field errors back onto the form
        let backToStep1 = false;
        err.fieldErrors?.forEach((fe) => {
          if (STEP1_FIELDS.includes(fe.field as (typeof STEP1_FIELDS)[number])) {
            setError(fe.field as keyof RegisterForm, { message: fe.message });
            backToStep1 = true;
          }
          if (fe.field === 'paymentUtr' || fe.field === 'paymentAmountPaise') {
            setPayError(fe.message);
          }
        });
        setFormError(err.message);
        if (backToStep1) setStep(1); // let the user see/fix the flagged account field
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
      <div className="mb-5 flex items-center gap-2 text-xs font-semibold text-slate2">
        <span className={step === 1 ? 'text-navy-800' : ''}>① ವಿವರಗಳು · Details</span>
        <span className="h-px flex-1 bg-line" />
        <span className={step === 2 ? 'text-navy-800' : ''}>② ಪಾವತಿ · Payment</span>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {formError && <Alert tone="error">{formError}</Alert>}

        {/* ── Step 1: account details ── */}
        <div className={step === 1 ? 'space-y-4' : 'hidden'}>
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

          <Button type="button" block onClick={goToPayment}>
            ಮುಂದುವರಿಯಿರಿ · Continue to payment
          </Button>
        </div>

        {/* ── Step 2: pay the registration fee ── */}
        <div className={step === 2 ? 'space-y-4' : 'hidden'}>
          <div className="rounded-xl2 border border-line bg-white p-4">
            <p className="font-display text-navy-900">ನೋಂದಣಿ ಶುಲ್ಕ ಪಾವತಿಸಿ · Pay the registration fee</p>
            <p className="mt-1 text-sm text-slate2">
              ಕೆಳಗಿನ QR ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಪಾವತಿಸಿ, ನಂತರ ವಹಿವಾಟು ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.
              <span className="block">Scan the QR to pay, then enter your transaction details below.</span>
            </p>

            {scanner.isLoading ? (
              <p className="mt-4 text-sm text-slate2">ಲೋಡ್ ಆಗುತ್ತಿದೆ… · Loading…</p>
            ) : scannerReady ? (
              <div className="mt-4 grid gap-4 sm:grid-cols-[180px_1fr]">
                <div className="grid place-items-center rounded-lg bg-mist p-3">
                  <img src={`${API_BASE}/api/v1/auth/registration-scanner/image`} alt="Payment QR"
                    className="h-40 w-40 rounded bg-white object-contain p-1 ring-1 ring-line" />
                </div>
                <div className="space-y-1 text-sm">
                  {scanner.data?.payeeName && <p className="text-navy-900"><span className="text-slate2">ಹೆಸರು · Payee:</span> {scanner.data.payeeName}</p>}
                  {scanner.data?.upiId && <p className="text-navy-900"><span className="text-slate2">UPI ID:</span> {scanner.data.upiId}</p>}
                  {scanner.data?.note && <p className="text-slate2">{scanner.data.note}</p>}
                </div>
              </div>
            ) : (
              <Alert tone="info">
                ಪಾವತಿ QR ಇನ್ನೂ ಪ್ರಕಟಿಸಿಲ್ಲ — ಈಗ ಪಾವತಿ ಇಲ್ಲದೆ ನೋಂದಾಯಿಸಬಹುದು.
                <span className="block">No payment QR is published yet — you can submit without payment for now.</span>
              </Alert>
            )}
          </div>

          {payError && <Alert tone="error">{payError}</Alert>}

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="payAmount" label="ಪಾವತಿಸಿದ ಮೊತ್ತ (₹)" helper="Amount paid (optional)">
              <Input id="payAmount" inputMode="decimal" placeholder="500" value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)} />
            </FormField>
            <FormField id="payUtr" label="ವಹಿವಾಟು ಉಲ್ಲೇಖ / UTR" helper="UPI reference / UTR from your payment app" required={scannerReady}>
              <Input id="payUtr" autoComplete="off" autoCapitalize="characters" placeholder="e.g. 4512 8899 2201" maxLength={32}
                value={payUtr} onChange={(e) => setPayUtr(e.target.value)} />
            </FormField>
          </div>

          <FormField id="proof" label="ಪಾವತಿ ಸ್ಕ್ರೀನ್‌ಶಾಟ್" helper="Payment screenshot (optional) — PNG or JPG; resized automatically">
            <div className="flex items-center gap-3">
              {proofPreview
                ? <img src={proofPreview} alt="" className="h-14 w-14 shrink-0 rounded-xl border border-line bg-white object-contain" />
                : <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl border border-dashed border-line text-[10px] text-slate2">ರಸೀದಿ</span>}
              <input id="proof" type="file" accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  setProof(f);
                  setProofPreview((old) => { if (old) URL.revokeObjectURL(old); return f ? URL.createObjectURL(f) : null; });
                }}
                className="block w-full min-w-0 rounded-lg border border-[#c3cfe2] bg-white text-sm file:mr-3 file:rounded-l-lg file:border-0 file:bg-navy-50 file:px-3 file:py-2.5 file:font-semibold file:text-navy-800 hover:file:bg-navy-100" />
            </div>
          </FormField>

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => { setPayError(null); setStep(1); }}>
              ← ಹಿಂದೆ · Back
            </Button>
            <Button type="submit" block loading={isSubmitting}>
              {L.submit_register}
            </Button>
          </div>
          <p className="text-center text-xs text-slate2">
            ಸಲ್ಲಿಸಿದ ನಂತರ ನಿರ್ವಾಹಕರ ಅನುಮೋದನೆಗಾಗಿ ಕಾಯಬೇಕು · After submitting, your account waits for admin approval.
          </p>
        </div>
      </form>
    </AuthShell>
  );
}
