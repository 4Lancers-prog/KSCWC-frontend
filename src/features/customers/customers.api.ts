// customers.api.ts — services + customer query/mutation hooks.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import type { Customer, CustomerStatus, CustomerStatusHistory, Service } from '@/types/entities';
import type { Paginated } from '@/types/api';

export interface CustomerFilter {
  page?: number;
  limit?: number;
  status?: CustomerStatus | '';
  serviceId?: string;
  search?: string;
}

function qs(filter: Record<string, unknown>): string {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(filter)) {
    if (v !== undefined && v !== null && v !== '') p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : '';
}

export function useServices() {
  return useQuery({
    queryKey: ['services'],
    queryFn: () => api<{ items: Service[] }>('/services').then((r) => r.items),
    staleTime: 5 * 60_000,
  });
}

export function useCustomers(filter: CustomerFilter) {
  return useQuery({
    queryKey: ['customers', filter],
    queryFn: () => api<Paginated<Customer>>(`/customers${qs(filter as Record<string, unknown>)}`),
    placeholderData: (prev) => prev,
  });
}

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => api<{ customer: Customer; history: CustomerStatusHistory[] }>(`/customers/${id}`),
    enabled: !!id,
  });
}

export interface CreateCustomerBody {
  fullName: string;
  mobile: string;
  serviceId: string;
  referenceCode?: string;
  feePaise?: number;
  notes?: string;
  confirmDuplicate?: boolean;
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateCustomerBody) =>
      api<{ customer: Customer }>('/customers', { method: 'POST', body }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); toast('ಗ್ರಾಹಕ ಸೇರಿಸಲಾಗಿದೆ', 'success'); },
  });
}

export function useUpdateCustomer(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<CreateCustomerBody>) =>
      api<{ customer: Customer }>(`/customers/${id}`, { method: 'PATCH', body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      qc.invalidateQueries({ queryKey: ['customer', id] });
      toast('ಗ್ರಾಹಕ ವಿವರ ನವೀಕರಿಸಲಾಗಿದೆ', 'success');
    },
  });
}

export function useChangeStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { status: CustomerStatus; reason?: string }) =>
      api<{ customer: Customer }>(`/customers/${id}/status`, { method: 'POST', body }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['customers'] });
      qc.invalidateQueries({ queryKey: ['customer', id] });
      toast('ಸ್ಥಿತಿ ನವೀಕರಿಸಲಾಗಿದೆ', 'success');
    },
  });
}
