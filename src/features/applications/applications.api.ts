// applications.api.ts — public form submissions.
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

type Kind = 'insurance' | 'membership' | 'training' | 'grievance';

export function useSubmitApplication(kind: Kind) {
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api<{ id: string; status: string; ticketCode?: string }>(`/applications/${kind}`, {
        method: 'POST',
        body,
      }),
  });
}
