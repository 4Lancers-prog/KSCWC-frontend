// reports.api.ts — my customer report.
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { CustomerReport } from '@/types/entities';

export function useMyReport() {
  return useQuery({
    queryKey: ['report', 'my-customers'],
    queryFn: () => api<CustomerReport>('/reports/my-customers'),
  });
}
