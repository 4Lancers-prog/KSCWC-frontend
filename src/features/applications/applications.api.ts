// applications.api.ts — public form submissions.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

type Kind = 'insurance' | 'membership' | 'training' | 'grievance';

export function useSubmitApplication(kind: Kind) {
  const qc = useQueryClient();
  return useMutation({
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-applications'] }),
    mutationFn: (body: Record<string, unknown>) =>
      api<{ id: string; status: string; ticketCode?: string }>(`/applications/${kind}`, {
        method: 'POST',
        body,
      }),
  });
}

// ── The signed-in operator's own submissions + the admin's decisions on them ──
export interface MyApplicationRow {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: string | null;
}
export interface MyApplications {
  insurance: MyApplicationRow[];
  membership: MyApplicationRow[];
  training: MyApplicationRow[];
  grievances: MyApplicationRow[];
}
export function useMyApplications(enabled = true) {
  return useQuery({
    queryKey: ['my-applications'],
    queryFn: () => api<MyApplications>('/me/applications'),
    enabled,
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  });
}
