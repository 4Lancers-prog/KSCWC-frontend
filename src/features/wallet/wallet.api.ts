// wallet.api.ts — wallet balance, ledger, top-up order creation, and payment verification.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiForm } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import type { Paginated } from '@/types/api';
import type { TopupOrder, WalletBalance, WalletTxn } from '@/types/entities';

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
  return useQuery({ queryKey: ['wallet'], queryFn: () => api<WalletBalance>('/wallet') });
}

export function useTransactions(page: number) {
  return useQuery({
    queryKey: ['wallet-txns', page],
    queryFn: () => api<Paginated<WalletTxn>>(`/wallet/transactions?page=${page}&limit=20`),
    placeholderData: (prev) => prev,
  });
}

export function useCreateTopup() {
  return useMutation({
    mutationFn: (amountPaise: number) =>
      api<TopupOrder>('/wallet/topups', { method: 'POST', body: { amountPaise } }),
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
  return useQuery({
    queryKey: ['manual-topups', page],
    queryFn: () => api<Paginated<ManualTopup>>(`/wallet/manual-topups?page=${page}&limit=10`),
    placeholderData: (prev) => prev,
  });
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

export function useVerifyPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) =>
      api<{ status: string; alreadyCredited: boolean }>('/payments/verify', { method: 'POST', body }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['wallet-txns'] });
      toast(res.alreadyCredited ? 'ಈ ಪಾವತಿ ಈಗಾಗಲೇ ಜಮೆಯಾಗಿದೆ' : 'ವಾಲೆಟ್ ಟಾಪ್-ಅಪ್ ಯಶಸ್ವಿಯಾಗಿದೆ', 'success');
    },
  });
}
