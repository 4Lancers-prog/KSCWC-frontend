// admin.api.ts — admin console data hooks (users, content, committees, links, docs, wallets, apps, audit).
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiForm, getCsrfToken } from '@/lib/api-client';
import { toast } from '@/lib/toast';
import type { Paginated, SessionUser } from '@/types/api';
import type { CommitteeMember, GovLink, PublicAnnouncement, Service } from '@/types/entities';

const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

// Queues that USERS fill (sign-ups, UPI top-ups, applications) must update without a page reload,
// otherwise a registration made in another tab never "comes" to the admin. The app-wide default
// disables focus refetch, so these queries opt back in and also poll.
const LIVE = { refetchOnWindowFocus: true, refetchInterval: 20_000, staleTime: 5_000 } as const;

// ── Overview: counts of everything waiting on staff (dashboard tiles + nav badges) ──
export interface AdminOverview {
  pendingUsers: number;
  activeUsers: number;
  pendingManualTopups: number;
  openGrievances: number;
  newApplications: number;
  newInsurance: number;
  newMembership: number;
  newTraining: number;
  totalCustomers: number;
}
export function useAdminOverview() {
  return useQuery({ queryKey: ['admin-overview'], queryFn: () => api<AdminOverview>('/admin/overview'), ...LIVE });
}

// ── Users / approvals ── (shape matches the backend SAFE_SELECT, not SessionUser)
export interface AdminUser {
  id: string;
  fullName: string;
  phoneNormalized: string;
  emailNormalized: string | null;
  role: SessionUser['role'];
  accountStatus: SessionUser['accountStatus'];
  centreName: string | null;
  cscId: string | null;
  rejectedReason?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  aadhaarMasked?: string | null;
  panMasked?: string | null;
  logoUrl?: string | null;
  registrationPaymentUtr?: string | null;
  registrationPaymentAmountPaise?: number | null;
  registrationPaymentProofUrl?: string | null;
}
export function useAdminUsers(params: { status?: string; search?: string; page: number }) {
  const qs = new URLSearchParams({ page: String(params.page), limit: '20' });
  if (params.status) qs.set('status', params.status);
  if (params.search) qs.set('search', params.search);
  return useQuery({ queryKey: ['admin-users', params], queryFn: () => api<Paginated<AdminUser>>(`/admin/users?${qs}`), placeholderData: (p) => p, ...LIVE });
}
export function useUserAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action, reason }: { id: string; action: 'approve' | 'reject' | 'suspend' | 'reactivate'; reason?: string }) =>
      api(`/admin/users/${id}/${action}`, { method: 'POST', body: reason ? { reason } : undefined }),
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-overview'] });
      const msg: Record<string, string> = {
        approve: 'ಬಳಕೆದಾರ ಅನುಮೋದಿಸಲಾಗಿದೆ',
        reject: 'ಅರ್ಜಿ ತಿರಸ್ಕರಿಸಲಾಗಿದೆ',
        suspend: 'ಖಾತೆ ಅಮಾನತುಗೊಳಿಸಲಾಗಿದೆ',
        reactivate: 'ಖಾತೆ ಮರುಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ',
      };
      toast(msg[v.action] ?? 'ಪೂರ್ಣಗೊಂಡಿದೆ', 'success');
    },
  });
}

// ── Announcements ──
export function useAdminAnnouncements(page: number) {
  return useQuery({ queryKey: ['admin-ann', page], queryFn: () => api<Paginated<PublicAnnouncement>>(`/admin/announcements?page=${page}&limit=20`), placeholderData: (p) => p });
}
export function useAnnouncementMutations() {
  const qc = useQueryClient();
  const done = (msg: string) => () => { qc.invalidateQueries({ queryKey: ['admin-ann'] }); toast(msg, 'success'); };
  return {
    create: useMutation({ mutationFn: (b: Record<string, unknown>) => api('/admin/announcements', { method: 'POST', body: b }), onSuccess: done('ಪ್ರಕಟಣೆ ಸೇರಿಸಲಾಗಿದೆ') }),
    update: useMutation({ mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api(`/admin/announcements/${id}`, { method: 'PATCH', body }), onSuccess: done('ಪ್ರಕಟಣೆ ನವೀಕರಿಸಲಾಗಿದೆ') }),
    archive: useMutation({ mutationFn: (id: string) => api(`/admin/announcements/${id}/archive`, { method: 'POST' }), onSuccess: done('ಪ್ರಕಟಣೆ ಆರ್ಕೈವ್ ಆಗಿದೆ') }),
  };
}

// ── Committees ──
export function useAdminCommittees() {
  return useQuery({ queryKey: ['admin-committees'], queryFn: () => api<{ items: CommitteeMember[] }>('/admin/committees').then((r) => r.items) });
}
export function useCommitteeMutations() {
  const qc = useQueryClient();
  const done = (msg: string) => () => { qc.invalidateQueries({ queryKey: ['admin-committees'] }); toast(msg, 'success'); };
  return {
    create: useMutation({ mutationFn: (b: Record<string, unknown>) => api('/admin/committees', { method: 'POST', body: b }), onSuccess: done('ಸಮಿತಿ ಸದಸ್ಯ ಸೇರಿಸಲಾಗಿದೆ') }),
    update: useMutation({ mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api(`/admin/committees/${id}`, { method: 'PATCH', body }), onSuccess: done('ಸಮಿತಿ ಸದಸ್ಯ ನವೀಕರಿಸಲಾಗಿದೆ') }),
    archive: useMutation({ mutationFn: (id: string) => api(`/admin/committees/${id}/archive`, { method: 'POST' }), onSuccess: done('ಸದಸ್ಯ ತೆಗೆದುಹಾಕಲಾಗಿದೆ') }),
  };
}

// ── Government links ──
export function useAdminLinks() {
  return useQuery({ queryKey: ['admin-links'], queryFn: () => api<{ items: GovLink[] }>('/admin/government-links').then((r) => r.items) });
}
export function useLinkMutations() {
  const qc = useQueryClient();
  const done = (msg: string) => () => { qc.invalidateQueries({ queryKey: ['admin-links'] }); toast(msg, 'success'); };
  return {
    create: useMutation({ mutationFn: (b: Record<string, unknown>) => api<{ link: GovLink }>('/admin/government-links', { method: 'POST', body: b }), onSuccess: done('ಕೊಂಡಿ ಸೇರಿಸಲಾಗಿದೆ') }),
    setImage: useMutation({
      mutationFn: ({ id, file }: { id: string; file: File }) => {
        const fd = new FormData();
        fd.append('image', file);
        return apiForm<{ link: GovLink }>(`/admin/government-links/${id}/image`, fd);
      },
      onSuccess: done('ಚಿತ್ರ ಉಳಿಸಲಾಗಿದೆ · Image saved'),
    }),
    removeImage: useMutation({
      mutationFn: (id: string) => api<{ link: GovLink }>(`/admin/government-links/${id}/image`, { method: 'DELETE' }),
      onSuccess: done('ಚಿತ್ರ ತೆಗೆದುಹಾಕಲಾಗಿದೆ · Image removed'),
    }),
    update: useMutation({ mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api(`/admin/government-links/${id}`, { method: 'PATCH', body }), onSuccess: done('ಕೊಂಡಿ ನವೀಕರಿಸಲಾಗಿದೆ') }),
    deactivate: useMutation({ mutationFn: (id: string) => api(`/admin/government-links/${id}/deactivate`, { method: 'POST' }), onSuccess: done('ಕೊಂಡಿ ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ') }),
    reactivate: useMutation({ mutationFn: (id: string) => api(`/admin/government-links/${id}`, { method: 'PATCH', body: { isActive: true } }), onSuccess: done('ಕೊಂಡಿ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ') }),
  };
}

// ── Service catalogue ──
export function useAdminServices(page: number) {
  return useQuery({ queryKey: ['admin-services', page], queryFn: () => api<Paginated<Service>>(`/admin/services?page=${page}&limit=50`), placeholderData: (p) => p });
}
export function useServiceMutations() {
  const qc = useQueryClient();
  const done = (msg: string) => () => { qc.invalidateQueries({ queryKey: ['admin-services'] }); toast(msg, 'success'); };
  return {
    create: useMutation({ mutationFn: (b: Record<string, unknown>) => api('/admin/services', { method: 'POST', body: b }), onSuccess: done('ಸೇವೆ ಸೇರಿಸಲಾಗಿದೆ') }),
    update: useMutation({ mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api(`/admin/services/${id}`, { method: 'PATCH', body }), onSuccess: done('ಸೇವೆ ನವೀಕರಿಸಲಾಗಿದೆ') }),
    deactivate: useMutation({ mutationFn: (id: string) => api(`/admin/services/${id}/deactivate`, { method: 'POST' }), onSuccess: done('ಸೇವೆ ನಿಷ್ಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ') }),
  };
}

// ── Documents (multipart upload) ──
export interface AdminDocument { id: string; title: string; description?: string | null; kind?: 'APPLICATION' | 'DRAFT'; imageUrl?: string | null; categoryId?: string | null; mimeType: string; fileExt?: string; sizeBytes: number; visibility: 'PUBLIC' | 'PRIVATE'; createdAt: string }
export function useAdminDocuments() {
  return useQuery({ queryKey: ['admin-docs'], queryFn: () => api<{ items: AdminDocument[] }>('/admin/documents').then((r) => r.items) });
}
export function useDocumentMutations() {
  const qc = useQueryClient();
  const done = (msg: string) => () => { qc.invalidateQueries({ queryKey: ['admin-docs'] }); toast(msg, 'success'); };
  return {
    upload: useMutation({
      mutationFn: async (form: FormData) => {
        const res = await fetch(`${BASE}/api/v1/admin/documents`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'x-csrf-token': await getCsrfToken() },
          body: form,
        });
        if (!res.ok) {
          const b = await res.json().catch(() => ({}));
          const f = (b.fieldErrors ?? []).map((x: { message: string }) => x.message).join(' · ');
          throw new Error(f ? `${b.message}: ${f}` : (b.message ?? 'Upload failed'));
        }
        return res.json();
      },
      onSuccess: done('ದಾಖಲೆ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆ'),
    }),
    archive: useMutation({ mutationFn: (id: string) => api(`/admin/documents/${id}/archive`, { method: 'POST' }), onSuccess: done('ದಾಖಲೆ ಆರ್ಕೈವ್ ಆಗಿದೆ') }),
    setImage: useMutation({
      mutationFn: ({ id, file }: { id: string; file: File }) => {
        const fd = new FormData();
        fd.append('image', file);
        return apiForm<{ document: AdminDocument }>(`/admin/documents/${id}/image`, fd);
      },
      onSuccess: done('ಚಿತ್ರ ಉಳಿಸಲಾಗಿದೆ · Image saved'),
    }),
    removeImage: useMutation({
      mutationFn: (id: string) => api<{ document: AdminDocument }>(`/admin/documents/${id}/image`, { method: 'DELETE' }),
      onSuccess: done('ಚಿತ್ರ ತೆಗೆದುಹಾಕಲಾಗಿದೆ · Image removed'),
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api(`/admin/documents/${id}`, { method: 'PATCH', body }),
      onSuccess: done('ಉಳಿಸಲಾಗಿದೆ · Saved'),
    }),
  };
}

// ── Wallets ──
export interface AdminWallet { id: string; balancePaise: number; user: { id: string; fullName: string; phoneNormalized: string; accountStatus: string } }
export function useAdminWallets(params: { search?: string; page: number }) {
  const qs = new URLSearchParams({ page: String(params.page), limit: '20' });
  if (params.search) qs.set('search', params.search);
  return useQuery({ queryKey: ['admin-wallets', params], queryFn: () => api<Paginated<AdminWallet>>(`/admin/wallets?${qs}`), placeholderData: (p) => p });
}
export function useWalletAdjust() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, ...body }: { userId: string; amountPaise: number; direction: 'CREDIT' | 'DEBIT'; reason: string }) =>
      api(`/admin/wallets/${userId}/adjustments`, { method: 'POST', body }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-wallets'] }); toast('ವಾಲೆಟ್ ಹೊಂದಾಣಿಕೆ ಆಗಿದೆ', 'success'); },
  });
}

// ── Applications ──
export function useAdminApplications(kind: string, page: number, status?: string) {
  const qs = new URLSearchParams({ page: String(page), limit: '20' });
  if (status) qs.set('status', status);
  return useQuery({
    queryKey: ['admin-apps', kind, page, status ?? ''],
    queryFn: () => api<Paginated<Record<string, unknown>>>(`/admin/applications/${kind}?${qs}`),
    placeholderData: (p) => p,
    ...LIVE,
  });
}
export function useApplicationStatus(kind: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, resolutionNote }: { id: string; status: string; resolutionNote?: string }) =>
      api(`/admin/applications/${kind}/${id}/status`, { method: 'POST', body: { status, resolutionNote } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-apps', kind] });
      qc.invalidateQueries({ queryKey: ['admin-overview'] });
      toast('ಅರ್ಜಿ ಸ್ಥಿತಿ ನವೀಕರಿಸಲಾಗಿದೆ', 'success');
    },
  });
}

// ── Audit ──
export function useAuditLogs(page: number) {
  return useQuery({ queryKey: ['admin-audit', page], queryFn: () => api<Paginated<Record<string, unknown>>>(`/admin/audit-logs?page=${page}&limit=30`), placeholderData: (p) => p });
}

// ── Manual UPI top-ups + payment QR ──
export interface AdminManualTopup {
  id: string;
  amountPaise: number;
  utrNumber: string;
  note: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewNote: string | null;
  creditedAmountPaise: number | null;
  createdAt: string;
  reviewedAt: string | null;
  user: { fullName: string; phone: string; centreName: string | null };
  hasScreenshot: boolean;
}

export function useAdminManualTopups(status: string, page: number) {
  const qs = new URLSearchParams({ page: String(page), limit: '20' });
  if (status) qs.set('status', status);
  return useQuery({
    queryKey: ['admin-manual-topups', status, page],
    queryFn: () => api<Paginated<AdminManualTopup>>(`/admin/manual-topups?${qs}`),
    placeholderData: (p) => p,
    ...LIVE,
  });
}

export function useManualTopupReview() {
  const qc = useQueryClient();
  const inv = () => {
    qc.invalidateQueries({ queryKey: ['admin-manual-topups'] });
    qc.invalidateQueries({ queryKey: ['admin-overview'] });
    qc.invalidateQueries({ queryKey: ['admin-wallets'] });
  };
  return {
    approve: useMutation({
      mutationFn: ({ id, amountPaise, note }: { id: string; amountPaise?: number; note?: string }) =>
        api(`/admin/manual-topups/${id}/approve`, { method: 'POST', body: { amountPaise, note } }),
      onSuccess: () => { inv(); toast('ಟಾಪ್-ಅಪ್ ಅನುಮೋದಿಸಿ ವಾಲೆಟ್‌ಗೆ ಜಮೆ ಮಾಡಲಾಗಿದೆ', 'success'); },
    }),
    reject: useMutation({
      mutationFn: ({ id, reason }: { id: string; reason: string }) =>
        api(`/admin/manual-topups/${id}/reject`, { method: 'POST', body: { reason } }),
      onSuccess: () => { inv(); toast('ವಿನಂತಿ ತಿರಸ್ಕರಿಸಲಾಗಿದೆ', 'success'); },
    }),
  };
}

export interface PaymentQrConfig { upiId: string; payeeName: string; note: string | null; imageUrl: string }

export function usePaymentQrConfig() {
  return useQuery({
    queryKey: ['payment-qr'],
    queryFn: () => api<(PaymentQrConfig & { configured: true }) | { configured: false }>('/payment-qr').then((r) => (r.configured ? r : null)),
    retry: false,
  });
}

export function useSetPaymentQr() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: FormData) => apiForm<PaymentQrConfig>('/admin/payment-qr', form, 'PUT'),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-qr'] });
      qc.invalidateQueries({ queryKey: ['payment-qr-image'] });
      toast('ಪಾವತಿ QR ಉಳಿಸಲಾಗಿದೆ', 'success');
    },
  });
}


// ── Customers across all operators + the admin report ──
export interface AdminCustomer {
  id: string;
  fullName: string;
  mobileNormalized: string;
  referenceCode: string | null;
  feePaise: number | null;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  service: { id: string; nameKn: string; nameEn: string } | null;
  owner: { id: string; fullName: string; phoneNormalized: string; centreName: string | null } | null;
}
export interface AdminCustomerFilter {
  page: number;
  status?: string;
  serviceId?: string;
  search?: string;
  ownerUserId?: string;
}
function filterQs(f: Record<string, unknown>) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(f)) if (v !== undefined && v !== '') qs.set(k, String(v));
  return qs.toString();
}
export function useAdminCustomers(f: AdminCustomerFilter) {
  return useQuery({
    queryKey: ['admin-customers', f],
    queryFn: () => api<Paginated<AdminCustomer>>(`/admin/customers?${filterQs({ ...f, limit: 20 })}`),
    placeholderData: (p) => p,
    refetchOnWindowFocus: true,
  });
}
export interface AdminCustomerReport {
  totals: { total: number; feeTotalPaise: number };
  byStatus: { status: string; count: number }[];
  byService: { serviceId: string; nameKn: string; nameEn?: string; count: number }[];
}
export function useAdminCustomerReport(f: { status?: string; serviceId?: string; ownerUserId?: string }) {
  return useQuery({
    queryKey: ['admin-customer-report', f],
    queryFn: () => api<AdminCustomerReport>(`/admin/reports/customers?${filterQs(f)}`),
    refetchOnWindowFocus: true,
  });
}
export function adminCustomersCsvPath(f: { status?: string; serviceId?: string; ownerUserId?: string }) {
  const q = filterQs(f);
  return `/admin/reports/export.csv${q ? `?${q}` : ''}`;
}

// ── Operator devices (max 2, one signed in at a time) ──
export interface OperatorDevice {
  id: string;
  label: string;
  createdAt: string;
  lastSeenAt: string;
  signedIn: boolean;
  idle: boolean | null;
}
export interface OperatorDevices {
  maxDevices: number;
  idleMinutes: number;
  devices: OperatorDevice[];
}
export function useOperatorDevices(userId: string | null) {
  return useQuery({
    queryKey: ['admin-user-devices', userId],
    queryFn: () => api<OperatorDevices>(`/admin/users/${userId}/devices`),
    enabled: !!userId,
    refetchOnWindowFocus: true,
  });
}
export function useDeviceActions(userId: string | null) {
  const qc = useQueryClient();
  const refresh = () => qc.invalidateQueries({ queryKey: ['admin-user-devices', userId] });
  return {
    remove: useMutation({
      mutationFn: (deviceRowId: string) => api(`/admin/users/${userId}/devices/${deviceRowId}`, { method: 'DELETE' }),
      onSuccess: () => { refresh(); toast('ಸಾಧನ ತೆಗೆದುಹಾಕಲಾಗಿದೆ · Device removed', 'success'); },
      onError: (e: Error) => toast(e.message, 'error'),
    }),
    signOut: useMutation({
      mutationFn: () => api(`/admin/users/${userId}/sign-out`, { method: 'POST' }),
      onSuccess: () => { refresh(); toast('ಸೈನ್ ಔಟ್ ಮಾಡಲಾಗಿದೆ · Signed out', 'success'); },
      onError: (e: Error) => toast(e.message, 'error'),
    }),
  };
}

// ── Categories (links + templates) ──
export function useCategoryMutations(scope: 'LINKS' | 'DOCUMENTS' | 'DRAFTS') {
  const qc = useQueryClient();
  const done = (msg: string) => () => { qc.invalidateQueries({ queryKey: ['categories', scope] }); toast(msg, 'success'); };
  return {
    create: useMutation({
      mutationFn: (b: { nameKn: string; nameEn?: string; parentId?: string | null }) => api('/admin/categories', { method: 'POST', body: { ...b, scope } }),
      onSuccess: done('ವರ್ಗ ಸೇರಿಸಲಾಗಿದೆ · Category added'),
    }),
    update: useMutation({
      mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => api(`/admin/categories/${id}`, { method: 'PATCH', body }),
      onSuccess: done('ಉಳಿಸಲಾಗಿದೆ · Saved'),
    }),
    remove: useMutation({
      mutationFn: (id: string) => api(`/admin/categories/${id}`, { method: 'DELETE' }),
      onSuccess: done('ಅಳಿಸಲಾಗಿದೆ · Deleted'),
    }),
  };
}
