// public-content.api.ts — public read hooks for announcements, committees, links, documents.
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { Category, CategoryScope, CommitteeMember, GovLink, PublicAnnouncement, PublicDocument } from '@/types/entities';

export function usePublicAnnouncements() {
  return useQuery({
    queryKey: ['public', 'announcements'],
    queryFn: () => api<{ items: PublicAnnouncement[] }>('/public/announcements').then((r) => r.items),
    staleTime: 60_000,
  });
}

export function usePublicCommittees(params?: { committeeType?: string; district?: string }) {
  const qs = new URLSearchParams();
  if (params?.committeeType) qs.set('committeeType', params.committeeType);
  if (params?.district) qs.set('district', params.district);
  const suffix = qs.toString() ? `?${qs}` : '';
  return useQuery({
    queryKey: ['public', 'committees', params],
    queryFn: () => api<{ items: CommitteeMember[] }>(`/public/committees${suffix}`).then((r) => r.items),
    staleTime: 60_000,
  });
}

export function usePublicGovLinks() {
  return useQuery({
    queryKey: ['public', 'gov-links'],
    queryFn: () => api<{ items: GovLink[] }>('/public/government-links').then((r) => r.items),
    staleTime: 60_000,
  });
}

export function usePublicDocuments() {
  return useQuery({
    queryKey: ['public', 'documents'],
    queryFn: () => api<{ items: PublicDocument[] }>('/public/documents').then((r) => r.items),
    staleTime: 60_000,
  });
}

export function useCategories(scope: CategoryScope) {
  return useQuery({
    queryKey: ['categories', scope],
    queryFn: () => api<{ items: Category[] }>(`/public/categories?scope=${scope}`).then((r) => r.items),
    staleTime: 60_000,
  });
}
