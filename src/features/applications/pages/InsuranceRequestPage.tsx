// InsuranceRequestPage.tsx — public vehicle insurance request.
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, FormField, Alert } from '@/components/ui';
import { FormShell } from '../FormShell';
import { insuranceForm } from '@/lib/schemas';
import { useSubmitApplication } from '../applications.api';
import { ApiClientError } from '@/lib/api-client';
import type { z } from 'zod';

type Form = z.infer<typeof insuranceForm>;
const clean = (v: Form) =>
  Object.fromEntries(Object.entries(v).map(([k, val]) => [k, val === '' ? undefined : val]));

export function InsuranceRequestPage() {
  const submit = useSubmitApplication('insurance');
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(insuranceForm) });

  const onSubmit = handleSubmit(async (v) => {
    setErr(null);
    try {
      await submit.mutateAsync(clean(v));
      setDone(true);
    } catch (e) {
      setErr(e instanceof ApiClientError ? e.message : 'Could not submit.');
    }
  });

  return (
    <FormShell title="ವಾಹನ ವಿಮೆ ವಿನಂತಿ" subtitle="Vehicle insurance request"
      success={done ? <>ನಿಮ್ಮ ವಿನಂತಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ. ನಿರ್ವಾಹಕರು ಪರಿಶೀಲಿಸುತ್ತಾರೆ.</> : null}>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {err && <Alert tone="error">{err}</Alert>}
        <FormField id="customerName" label="ಅರ್ಜಿದಾರರ ಹೆಸರು" helper="Applicant name" error={errors.customerName?.message} required>
          <Input id="customerName" {...register('customerName')} invalid={!!errors.customerName} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="mobile" label="ಮೊಬೈಲ್" helper="Mobile" error={errors.mobile?.message} required>
            <Input id="mobile" inputMode="numeric" {...register('mobile')} invalid={!!errors.mobile} />
          </FormField>
          <FormField id="vehicleNumber" label="ವಾಹನ ಸಂಖ್ಯೆ" helper="Vehicle number" error={errors.vehicleNumber?.message}>
            <Input id="vehicleNumber" {...register('vehicleNumber')} />
          </FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="nomineeName" label="ನಾಮಿನಿ ಹೆಸರು" helper="Nominee name" error={errors.nomineeName?.message}>
            <Input id="nomineeName" {...register('nomineeName')} />
          </FormField>
          <FormField id="nomineeRelation" label="ಸಂಬಂಧ" helper="Relationship" error={errors.nomineeRelation?.message}>
            <Input id="nomineeRelation" {...register('nomineeRelation')} />
          </FormField>
        </div>
        <FormField id="policyType" label="ಪಾಲಿಸಿ ವಿಧ" helper="Policy type" error={errors.policyType?.message}>
          <Input id="policyType" {...register('policyType')} />
        </FormField>
        <FormField id="notes" label="ಟಿಪ್ಪಣಿ" helper="Notes" error={errors.notes?.message}>
          <textarea id="notes" rows={3} className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[15px] focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20" {...register('notes')} />
        </FormField>
        <Button type="submit" loading={isSubmitting}>ಸಲ್ಲಿಸಿ · Submit</Button>
      </form>
    </FormShell>
  );
}
