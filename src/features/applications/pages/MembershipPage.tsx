// MembershipPage.tsx — public membership application.
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, FormField, Alert } from '@/components/ui';
import { FormShell } from '../FormShell';
import { membershipFormSchema } from '@/lib/schemas';
import { useSubmitApplication } from '../applications.api';
import { ApiClientError } from '@/lib/api-client';
import type { z } from 'zod';

type Form = z.infer<typeof membershipFormSchema>;

export function MembershipPage() {
  const submit = useSubmitApplication('membership');
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(membershipFormSchema) });

  const onSubmit = handleSubmit(async (v) => {
    setErr(null);
    try {
      await submit.mutateAsync({ ...v, email: v.email || undefined });
      setDone(true);
    } catch (e) {
      setErr(e instanceof ApiClientError ? e.message : 'Could not submit.');
    }
  });

  return (
    <FormShell title="ಸದಸ್ಯತ್ವ ಅರ್ಜಿ" subtitle="Membership application"
      success={done ? <>ನಿಮ್ಮ ಅರ್ಜಿ ಸ್ವೀಕರಿಸಲಾಗಿದೆ. ನಿರ್ವಾಹಕರು ಪರಿಶೀಲಿಸುತ್ತಾರೆ.</> : null}>
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {err && <Alert tone="error">{err}</Alert>}
        <FormField id="operatorName" label="ಸಂಚಾಲಕರ ಹೆಸರು" helper="Operator name" error={errors.operatorName?.message} required>
          <Input id="operatorName" {...register('operatorName')} invalid={!!errors.operatorName} />
        </FormField>
        <FormField id="centreName" label="ಕೇಂದ್ರದ ಹೆಸರು" helper="Centre name" error={errors.centreName?.message} required>
          <Input id="centreName" {...register('centreName')} invalid={!!errors.centreName} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="district" label="ಜಿಲ್ಲೆ" helper="District" error={errors.district?.message} required>
            <Input id="district" {...register('district')} invalid={!!errors.district} />
          </FormField>
          <FormField id="taluk" label="ತಾಲೂಕು" helper="Taluk" error={errors.taluk?.message} required>
            <Input id="taluk" {...register('taluk')} invalid={!!errors.taluk} />
          </FormField>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="phone" label="ಮೊಬೈಲ್" helper="Mobile" error={errors.phone?.message} required>
            <Input id="phone" inputMode="numeric" {...register('phone')} invalid={!!errors.phone} />
          </FormField>
          <FormField id="email" label="ಇಮೇಲ್" helper="Email (optional)" error={errors.email?.message}>
            <Input id="email" type="email" {...register('email')} invalid={!!errors.email} />
          </FormField>
        </div>
        <Button type="submit" loading={isSubmitting}>ಸಲ್ಲಿಸಿ · Submit</Button>
      </form>
    </FormShell>
  );
}
