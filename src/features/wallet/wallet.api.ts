// wallet.api.ts — wallet balance, ledger, top-up order creation, and payment verification.
import { useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiForm } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import type { Paginated } from '@/types/api';
import type { WalletBalance, WalletTxn } from '@/types/entities';

export interface PaymentQr { upiId: string; payeeName: string; note: string | null; imageUrl: string }
export interface ManualTopup {
  id: string;
  amountPaise: number;
  utrNumber: string;
  note: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewNote: string | null;
  creditedAmountPaise: number | null;
  createdAt: string;
  reviewedAt: string | null;
}

export function useWallet() {
  return useQuery({ queryKey: ['wallet'], queryFn: () => api<WalletBalance>('/wallet'), refetchOnWindowFocus: true });
}

export function useTransactions(page: number) {
  return useQuery({
    queryKey: ['wallet-txns', page],
    queryFn: () => api<Paginated<WalletTxn>>(`/wallet/transactions?page=${page}&limit=20`),
    placeholderData: (prev) => prev,
  });
}

// ── Manual UPI / QR top-up ──
export function usePaymentQr() {
  return useQuery({
    queryKey: ['payment-qr'],
    queryFn: () => api<PaymentQr>('/payment-qr'),
    retry: false, // 404 when not configured — don't hammer
  });
}

export function usePaymentQrImage(enabled: boolean) {
  return useQuery({
    queryKey: ['payment-qr-image'],
    enabled,
    retry: false,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const base = import.meta.env.VITE_API_BASE_URL ?? '';
      const res = await fetch(`${base}/api/v1/payment-qr/image`, { credentials: 'include' });
      if (!res.ok) throw new Error('QR unavailable');
      return URL.createObjectURL(await res.blob());
    },
  });
}

export function useMyManualTopups(page: number) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ['manual-topups', page],
    queryFn: () => api<Paginated<ManualTopup>>(`/wallet/manual-topups?page=${page}&limit=10`),
    placeholderData: (prev) => prev,
    // An admin approving a UPI top-up should show here without a reload; poll while one is pending.
    refetchOnWindowFocus: true,
    refetchInterval: (q) => (q.state.data?.items.some((t) => t.status === 'PENDING') ? 20_000 : false),
  });
  // When a request flips status (admin approved/rejected it), refresh balance + ledger too.
  const sig = query.data?.items.map((t) => `${t.id}:${t.status}`).join(',');
  const prevSig = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (sig === undefined) return;
    if (prevSig.current !== undefined && prevSig.current !== sig) {
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['wallet-txns'] });
    }
    prevSig.current = sig;
  }, [sig, qc]);
  return query;
}

export function useSubmitManualTopup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: FormData) => apiForm<ManualTopup>('/wallet/manual-topups', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['manual-topups'] });
      toast('ಟಾಪ್-ಅಪ್ ವಿನಂತಿ ಸಲ್ಲಿಸಲಾಗಿದೆ — ನಿರ್ವಾಹಕರ ಪರಿಶೀಲನೆಯ ನಂತರ ಕ್ರೆಡಿಟ್ ಆಗುತ್ತದೆ', 'success');
    },
  });
}

