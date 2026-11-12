// TrainingPage.tsx — public training registration.
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select, FormField, Alert } from '@/components/ui';
import { FormShell } from '../FormShell';
import { trainingFormSchema } from '@/lib/schemas';
import { useSubmitApplication } from '../applications.api';
import { ApiClientError } from '@/lib/api-client';
import type { z } from 'zod';

type Form = z.infer<typeof trainingFormSchema>;

export function TrainingPage() {
  const submit = useSubmitApplication('training');
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(trainingFormSchema), defaultValues: { mode: 'ONLINE' },
  });

  const onSubmit = handleSubmit(async (v) => {
    setErr(null);
    try {
      await submit.mutateAsync({ ...v, notes: v.notes || undefined });
      setDone(true);
    } catch (e) {
      setErr(e instanceof ApiClientError ? e.message : 'Could not submit.');
    }
  });

  return (
    <FormShell title="ತರಬೇತಿ ನೋಂದಣಿ" subtitle="Training registration"
      success={done ? <>ನಿಮ್ಮ ನೋಂದಣಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ.</> : null}>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {err && <Alert tone="error">{err}</Alert>}
        <FormField id="name" label="ಹೆಸರು" helper="Name" error={errors.name?.message} required>
          <Input id="name" {...register('name')} invalid={!!errors.name} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="phone" label="ಮೊಬೈಲ್" helper="Mobile" error={errors.phone?.message} required>
            <Input id="phone" inputMode="numeric" {...register('phone')} invalid={!!errors.phone} />
          </FormField>
          <FormField id="mode" label="ವಿಧಾನ" helper="Mode" error={errors.mode?.message} required>
            <Select id="mode" {...register('mode')}>
              <option value="ONLINE">ಆನ್‌ಲೈನ್ · Online</option>
              <option value="OFFLINE">ಆಫ್‌ಲೈನ್ · Offline</option>
            </Select>
          </FormField>
        </div>
        <FormField id="topic" label="ವಿಷಯ" helper="Topic" error={errors.topic?.message} required>
          <Input id="topic" {...register('topic')} invalid={!!errors.topic} />
        </FormField>
        <FormField id="notes" label="ಟಿಪ್ಪಣಿ" helper="Notes (optional)" error={errors.notes?.message}>
          <textarea id="notes" rows={3} className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[15px] focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20" {...register('notes')} />
        </FormField>
        <Button type="submit" loading={isSubmitting}>ಸಲ್ಲಿಸಿ · Submit</Button>
      </form>
    </FormShell>
  );
}
