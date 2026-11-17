// entities.ts — client DTO types (mirror backend responses).
export type CustomerStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Service {
  id: string;
  code: string;
  nameKn: string;
  nameEn: string | null;
  isActive?: boolean;
  defaultFeePaise?: number | null;
  sortOrder?: number;
}

export interface Customer {
  id: string;
  ownerUserId: string;
  serviceId: string;
  service?: Pick<Service, 'id' | 'code' | 'nameKn' | 'nameEn'>;
  fullName: string;
  mobileNormalized: string;
  referenceCode: string | null;
  feePaise: number | null;
  status: CustomerStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerStatusHistory {
  id: string;
  oldStatus: CustomerStatus | null;
  newStatus: CustomerStatus;
  reason: string | null;
  createdAt: string;
}

export interface WalletBalance {
  balancePaise: number;
  currency: string;
}

export type WalletTxType =
  | 'TOPUP' | 'CARD_CHARGE' | 'REFUND' | 'ADMIN_CREDIT' | 'ADMIN_DEBIT' | 'REVERSAL';

export interface WalletTxn {
  id: string;
  type: WalletTxType;
  direction: 'CREDIT' | 'DEBIT';
  amountPaise: number;
  balanceAfterPaise: number;
  status: string;
  description: string | null;
  referenceType: string | null;
  createdAt: string;
}

export interface PublicAnnouncement {
  id: string;
  title: string;
  body: string | null;
  contentType: 'ANNOUNCEMENT' | 'VIDEO';
  videoUrl: string | null;
  status?: string;
  publishAt: string | null;
  expiresAt: string | null;
  sortOrder?: number;
  createdAt?: string;
}

export interface CommitteeMember {
  id: string;
  committeeType: 'FOUNDER' | 'TRUSTEE' | 'STATE' | 'DISTRICT';
  name: string;
  roleTitle: string | null;
  district: string | null;
  bio: string | null;
  publicPhone: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface GovLink {
  id: string;
  title: string;
  /** null for visitors who are not logged in — opening a portal needs a login */
  url: string | null;
  locked?: boolean;
  /** logo/photo shown on the tile (served by the API), or null */
  imageUrl?: string | null;
  description: string | null;
  category?: 'STATE' | 'CENTRAL' | 'OTHER';
  categoryId?: string | null;
  featured?: boolean;
  sortOrder?: number;
  isActive?: boolean;
}

export interface PublicDocument {
  id: string;
  title: string;
  description?: string | null;
  kind?: DocumentKind;
  categoryId?: string | null;
  imageUrl?: string | null;
  mimeType: string;
  fileExt?: string;
  sizeBytes: number;
  createdAt: string;
  visibility?: 'PUBLIC' | 'PRIVATE';
}

export type CategoryScope = 'LINKS' | 'DOCUMENTS' | 'DRAFTS';
export type DocumentKind = 'APPLICATION' | 'DRAFT';
export interface Category {
  id: string;
  scope: CategoryScope;
  nameKn: string;
  nameEn: string | null;
  parentId: string | null;
  sortOrder: number;
}

export interface CustomerReport {
  totals: { total: number; feeTotalPaise: number };
  byStatus: { status: CustomerStatus; count: number }[];
  byService: { serviceId: string; nameKn: string; nameEn: string | null; count: number; feeTotalPaise: number }[];
  byDay: { date: string; count: number }[];
}
