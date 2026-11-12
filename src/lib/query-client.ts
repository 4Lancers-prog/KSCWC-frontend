// query-client.ts — TanStack Query defaults.
import { MutationCache, QueryClient } from '@tanstack/react-query';
import { ApiClientError } from './api-client';
import { toast } from './toast';

export const queryClient = new QueryClient({
  // Every failed mutation surfaces a toast. The message comes from the server's
  // sanitised error envelope (AppError.expose); 5xx collapse to a generic line,
  // so this never leaks internals. Individual hooks may still show inline errors.
  // Soft/expected conditions the UI handles inline (e.g. the duplicate-customer
  // confirm) are skipped, and a hook can opt out with meta.skipErrorToast.
  mutationCache: new MutationCache({
    onError: (error, _vars, _ctx, mutation) => {
      if ((mutation.options.meta as { skipErrorToast?: boolean } | undefined)?.skipErrorToast) return;
      if (error instanceof ApiClientError) {
        if (error.code === 'DUPLICATE_WARNING') return; // inline confirm, not a failure
        toast(error.message, 'error');
        return;
      }
      toast('ಏನೋ ತಪ್ಪಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.', 'error');
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (count, error) => {
        // don't retry auth/permission/validation errors
        if (error instanceof ApiClientError && error.status < 500) return false;
        return count < 2;
      },
    },
  },
});
