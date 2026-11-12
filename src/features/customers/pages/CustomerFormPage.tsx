// CustomerFormPage.tsx — create or edit a customer; handles the server duplicate warning.
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Select, FormField, Alert, Spinner } from '@/components/ui';
import { customerForm, type CustomerForm } from '@/lib/schemas';
import { ApiClientError } from '@/lib/api-client';
import { rupeesToPaise } from '@/lib/money';
import { useServices, useCustomer, useCreateCustomer, useUpdateCustomer } from '../customers.api';

export function CustomerFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { data: services } = useServices();
  const existing = useCustomer(isEdit ? id : undefined);
  const create = useCreateCustomer();
  const update = useUpdateCustomer(id ?? '');

  const [formError, setFormError] = useState<string | null>(null);
  const [dupPrompt, setDupPrompt] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<CustomerForm>({ resolver: zodResolver(customerForm) });

  // hydrate the form once when editing and data arrives
  const c = existing.data?.customer;
  useEffect(() => {
    if (isEdit && c) {
      reset({
        fullName: c.fullName,
        mobile: c.mobileNormalized,
        serviceId: c.serviceId,
        referenceCode: c.referenceCode ?? '',
        feeRupees: c.feePaise != null ? String(c.feePaise / 100) : '',
        notes: c.notes ?? '',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, c?.id]);

  const submit = handleSubmit(async (v) => {
    setFormError(null);
    const body = {
      fullName: v.fullName,
      mobile: v.mobile,
      serviceId: v.serviceId,
      referenceCode: v.referenceCode || undefined,
      feePaise: v.feeRupees ? rupeesToPaise(Number(v.feeRupees)) : undefined,
      notes: v.notes || undefined,
    };
    try {
      if (isEdit) {
        await update.mutateAsync(body);
        navigate(`/app/customers/${id}`);
      } else {
        await create.mutateAsync({ ...body, confirmDuplicate: dupPrompt });
        navigate('/app/customers');
      }
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.code === 'DUPLICATE_WARNING') {
          setDupPrompt(true);
          setFormError('ಈ ಮೊಬೈಲ್‌ಗೆ ಈ ಸೇವೆ ಇತ್ತೀಚೆಗೆ ಸೇರಿಸಲಾಗಿದೆ. ಮತ್ತೆ ಸೇರಿಸಲು ದೃಢೀಕರಿಸಿ.');
          return;
        }
        setFormError(err.message);
        return;
      }
      setFormError('ಉಳಿಸಲಾಗಲಿಲ್ಲ · Could not save.');
    }
  });

  if (isEdit && existing.isLoading) {
    return <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div>;
  }

  return (
    <div className="max-w-2xl">
      <div className="gold-rule mb-3" />
      <h1 className="font-display text-2xl text-navy-900">
        {isEdit ? 'ಗ್ರಾಹಕ ಸಂಪಾದನೆ' : 'ಹೊಸ ಗ್ರಾಹಕ'}
      </h1>
      <p className="text-sm text-slate2">{isEdit ? 'Edit customer' : 'Add customer'}</p>

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        {formError && <Alert tone={dupPrompt ? 'info' : 'error'}>{formError}</Alert>}

        <FormField id="fullName" label="ಪೂರ್ಣ ಹೆಸರು" helper="Full name" error={errors.fullName?.message} required>
          <Input id="fullName" invalid={!!errors.fullName} {...register('fullName')} />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="mobile" label="ಮೊಬೈಲ್" helper="Mobile" error={errors.mobile?.message} required>
            <Input id="mobile" inputMode="numeric" invalid={!!errors.mobile} {...register('mobile')} />
          </FormField>
          <FormField id="serviceId" label="ಸೇವೆ" helper="Service" error={errors.serviceId?.message} required>
            <Select id="serviceId" invalid={!!errors.serviceId} {...register('serviceId')}>
              <option value="">— ಆಯ್ಕೆಮಾಡಿ —</option>
              {services?.map((s) => <option key={s.id} value={s.id}>{s.nameKn}</option>)}
            </Select>
          </FormField>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="referenceCode" label="ಉಲ್ಲೇಖ ಸಂಖ್ಯೆ" helper="Reference (optional)" error={errors.referenceCode?.message}>
            <Input id="referenceCode" {...register('referenceCode')} />
          </FormField>
          <FormField id="feeRupees" label="ಶುಲ್ಕ (₹)" helper="Service fee (optional)" error={errors.feeRupees?.message}>
            <Input id="feeRupees" inputMode="decimal" placeholder="0.00" {...register('feeRupees')} />
          </FormField>
        </div>

        <FormField id="notes" label="ಟಿಪ್ಪಣಿ" helper="Notes (optional)" error={errors.notes?.message}>
          <textarea
            id="notes"
            rows={3}
            className="w-full rounded-lg border border-line bg-white px-3 py-2 text-[15px] focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20"
            {...register('notes')}
          />
        </FormField>

        <div className="flex gap-3">
          <Button type="submit" loading={isSubmitting}>
            {dupPrompt ? 'ಹೌದು, ಸೇರಿಸಿ · Add anyway' : isEdit ? 'ಉಳಿಸಿ · Save' : 'ಸೇರಿಸಿ · Add'}
          </Button>
          <Link to="/app/customers" className="inline-flex h-11 items-center rounded-lg px-5 text-navy-700 ring-1 ring-inset ring-line hover:bg-mist">
            ರದ್ದು · Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
