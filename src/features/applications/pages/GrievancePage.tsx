// GrievancePage.tsx — public grievance/suggestion form (returns a ticket code).
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/hooks/useAuth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, FormField, Alert } from '@/components/ui';
import { FormShell } from '../FormShell';
import { grievanceFormSchema } from '@/lib/schemas';
import { useSubmitApplication } from '../applications.api';
import { ApiClientError } from '@/lib/api-client';
import type { z } from 'zod';

type Form = z.infer<typeof grievanceFormSchema>;

export function GrievancePage() {
  const { user } = useAuth(); // logged-in operator: prefill what we already know
  const submit = useSubmitApplication('grievance');
  const [ticket, setTicket] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(grievanceFormSchema), defaultValues: {name: user?.fullName ?? '', phone: user?.phone ?? ''} });

  const onSubmit = handleSubmit(async (v) => {
    setErr(null);
    try {
      const res = await submit.mutateAsync(v);
      setTicket(res.ticketCode ?? res.id);
    } catch (e) {
      setErr(e instanceof ApiClientError ? e.message : 'Could not submit.');
    }
  });

  return (
    <FormShell
      title="ದೂರು / ಸಲಹೆ"
      subtitle="Grievance / suggestion"
      success={ticket ? <>ನಿಮ್ಮ ದೂರು ದಾಖಲಾಗಿದೆ. ಟಿಕೆಟ್ ಸಂಖ್ಯೆ: <b>{ticket}</b></> : null}
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {err && <Alert tone="error">{err}</Alert>}
        <FormField id="name" label="ಹೆಸರು" helper="Name" error={errors.name?.message} required>
          <Input id="name" {...register('name')} invalid={!!errors.name} />
        </FormField>
        <FormField id="phone" label="ಮೊಬೈಲ್" helper="Mobile" error={errors.phone?.message} required>
          <Input id="phone" inputMode="numeric" {...register('phone')} invalid={!!errors.phone} />
        </FormField>
        <FormField id="category" label="ವರ್ಗ" helper="Category" error={errors.category?.message} required>
          <Input id="category" placeholder="ಸೇವೆ / ಪಾವತಿ / ಇತರೆ" {...register('category')} invalid={!!errors.category} />
        </FormField>
        <FormField id="details" label="ವಿವರ" helper="Details" error={errors.details?.message} required>
          <textarea id="details" rows={4} className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[15px] focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20" {...register('details')} />
        </FormField>
        <Button type="submit" loading={isSubmitting}>ಸಲ್ಲಿಸಿ · Submit</Button>
      </form>
    </FormShell>
  );
}
