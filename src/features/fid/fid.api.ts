// fid.api.ts — FID generation, history and detail hooks.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import type { Paginated } from '@/types/api';
import type { FidGeneration } from '@/types/entities';

export interface GenerateBody {
  farmerName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  fidNumber: string;
  address: string;
  maskedAadhaar?: string;
  photoBase64?: string;
}

export function useGenerateFid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ body, idempotencyKey }: { body: GenerateBody; idempotencyKey: string }) =>
      api<FidGeneration>('/fid-generations', {
        method: 'POST',
        body,
        headers: { 'Idempotency-Key': idempotencyKey },
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['wallet-txns'] });
      qc.invalidateQueries({ queryKey: ['fid-history'] });
      toast('ಎಫ್‌ಐಡಿ ಕಾರ್ಡ್ ತಯಾರಾಗಿದೆ', 'success');
    },
  });
}

export const DEFAULT_FID_PORTAL_URL =
  'https://kkisan.karnataka.gov.in/Citizen/FarmServiceFIDDetails.aspx?AID=FM';

export function useFidPortalLink() {
  return useQuery({
    queryKey: ['fid-portal-link'],
    queryFn: () => api<{ url: string }>('/fid/portal-link'),
    staleTime: 5 * 60_000,
  });
}

export function useFidHistory(page: number) {
  return useQuery({
    queryKey: ['fid-history', page],
    queryFn: () => api<Paginated<FidGeneration>>(`/fid-generations?page=${page}&limit=20`),
    placeholderData: (prev) => prev,
  });
}
