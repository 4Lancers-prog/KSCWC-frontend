// FidMakerPage.tsx — FID form + live preview + ₹5 disclosure + generate + download.
import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select, FormField, Alert } from '@/components/ui';
import { FidCardPreview } from '../components/FidCardPreview';
import { fidForm, type FidForm } from '@/lib/schemas';
import { useGenerateFid } from '../fid.api';
import { useWallet } from '@/features/wallet/wallet.api';
import { downloadFile } from '@/lib/download';
import { formatPaise } from '@/lib/format';
import { ApiClientError } from '@/lib/api-client';
import { OfficialPortalCard } from '../components/OfficialPortalCard';
import type { FidGeneration } from '@/types/entities';

export function FidMakerPage() {
  const wallet = useWallet();
  const generate = useGenerateFid();
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [result, setResult] = useState<FidGeneration | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  // Stable idempotency key per attempt; reset after a successful generation.
  const idemRef = useRef<string>(crypto.randomUUID());

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<FidForm>({
    resolver: zodResolver(fidForm),
    defaultValues: { gender: 'MALE' },
  });
  const values = watch();
  const preview = useMemo(
    () => ({ ...values, photoDataUrl: photo }),
    [values.farmerName, values.gender, values.fidNumber, values.address, values.maskedAadhaar, photo],
  );

  const onPhoto = (file?: File) => {
    setPhotoError(null);
    if (!file) return setPhoto(null);
    if (!/image\/(png|jpeg)/.test(file.type)) return setPhotoError('PNG ಅಥವಾ JPEG ಮಾತ್ರ · PNG/JPEG only');
    if (file.size > 1_000_000) return setPhotoError('1MB ಗಿಂತ ಚಿಕ್ಕದಾಗಿರಬೇಕು · Max 1MB');
    const r = new FileReader();
    r.onload = () => setPhoto(String(r.result));
    r.readAsDataURL(file);
  };

  const submit = handleSubmit(async (v) => {
    setFormError(null);
    setResult(null);
    try {
      const gen = await generate.mutateAsync({
        idempotencyKey: idemRef.current,
        body: {
          farmerName: v.farmerName,
          gender: v.gender,
          fidNumber: v.fidNumber,
          address: v.address,
          maskedAadhaar: v.maskedAadhaar || undefined,
          photoBase64: photo ?? undefined,
        },
      });
      setResult(gen);
      idemRef.current = crypto.randomUUID(); // next generation is a new attempt (new ₹5)
      reset({ gender: 'MALE' });
      setPhoto(null);
    } catch (e) {
      setFormError(e instanceof ApiClientError ? e.message : 'Could not generate the card.');
    }
  });

  const lowBalance = (wallet.data?.balancePaise ?? 0) < 500;

  return (
    <div>
      <div className="gold-rule mb-3" />
      <h1 className="font-display text-2xl text-navy-900">ಎಫ್‌ಐಡಿ ಕಾರ್ಡ್ ತಯಾರಿಕೆ</h1>
      <p className="text-sm text-slate2">FID card maker · Link <Link to="/app/fid/history" className="text-navy-600 link">ಇತಿಹಾಸ / History</Link></p>

      <div className="mt-5"><OfficialPortalCard /></div>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {/* form */}
        <form onSubmit={submit} className="space-y-4" noValidate>
          {formError && <Alert tone="error">{formError}</Alert>}
          {result?.status === 'SUCCEEDED' && (
            <Alert tone="success" title="ಯಶಸ್ವಿ">
              ಕಾರ್ಡ್ ತಯಾರಾಗಿದೆ ({formatPaise(result.chargePaise)} ಶುಲ್ಕ).{' '}
              <button
                type="button"
                className="font-semibold underline"
                onClick={() => downloadFile(`/fid-generations/${result.id}/download`, `fid-${result.id}.pdf`)}
              >
                PDF ಡೌನ್‌ಲೋಡ್
              </button>
            </Alert>
          )}

          <FormField id="farmerName" label="ರೈತರ ಹೆಸರು" helper="Farmer name" error={errors.farmerName?.message} required>
            <Input id="farmerName" invalid={!!errors.farmerName} {...register('farmerName')} />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="gender" label="ಲಿಂಗ" helper="Gender" error={errors.gender?.message} required>
              <Select id="gender" {...register('gender')}>
                <option value="MALE">ಪುರುಷ · Male</option>
                <option value="FEMALE">ಮಹಿಳೆ · Female</option>
                <option value="OTHER">ಇತರೆ · Other</option>
              </Select>
            </FormField>
            <FormField id="fidNumber" label="ಎಫ್‌ಐಡಿ ಸಂಖ್ಯೆ" helper="FID number" error={errors.fidNumber?.message} required>
              <Input id="fidNumber" invalid={!!errors.fidNumber} {...register('fidNumber')} />
            </FormField>
          </div>

          <FormField id="address" label="ವಿಳಾಸ" helper="Address" error={errors.address?.message} required>
            <textarea id="address" rows={2}
              className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[15px] focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20"
              {...register('address')} />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="maskedAadhaar" label="ಆಧಾರ್ ಕೊನೆಯ 4 ಅಂಕಿ" helper="Aadhaar last 4 (optional)" error={errors.maskedAadhaar?.message}>
              <Input id="maskedAadhaar" inputMode="numeric" maxLength={4} {...register('maskedAadhaar')} />
            </FormField>
            <FormField id="photo" label="ಫೋಟೋ" helper="Photo (optional, ≤1MB)" error={photoError ?? undefined}>
              <input id="photo" type="file" accept="image/png,image/jpeg" className="text-sm"
                onChange={(e) => onPhoto(e.target.files?.[0])} />
            </FormField>
          </div>

          <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-inset ring-amber-100">
            ಪ್ರತಿ ಹೊಸ ಕಾರ್ಡ್‌ಗೆ ₹5 ವಾಲೆಟ್‌ನಿಂದ ಕಡಿತವಾಗುತ್ತದೆ. ಅದೇ ಕಾರ್ಡ್ ಮರು-ಡೌನ್‌ಲೋಡ್ ಉಚಿತ.
            <span className="block text-xs">₹5 is debited for each new card; re-downloading the same card is free.</span>
          </div>

          {lowBalance && (
            <Alert tone="error">
              ಸಾಕಷ್ಟು ಬ್ಯಾಲೆನ್ಸ್ ಇಲ್ಲ · Insufficient balance.{' '}
              <Link to="/app/wallet" className="font-semibold underline">ಟಾಪ್-ಅಪ್ ಮಾಡಿ</Link>
            </Alert>
          )}

          <Button type="submit" loading={isSubmitting || generate.isPending} disabled={lowBalance}>
            ಕಾರ್ಡ್ ತಯಾರಿಸಿ (₹5) · Generate
          </Button>
        </form>

        {/* preview */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-3 text-sm text-slate2">ಮುನ್ನೋಟ · Live preview</p>
          <FidCardPreview {...preview} />
          <p className="mt-3 text-center text-xs text-slate2">
            ಮುದ್ರಣ: 6 × 4 ಇಂಚ್ ಹಾಳೆ, 85.6 × 54 ಮಿ.ಮೀ ಕಾರ್ಡ್ · Prints as a 85.6×54mm card on a 6×4in sheet.
          </p>
        </div>
      </div>
    </div>
  );
}
