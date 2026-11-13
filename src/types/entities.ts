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

export interface FidGeneration {
  id: string;
  status: 'QUEUED' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED';
  chargePaise: number;
  createdAt: string;
  completedAt: string | null;
  downloadUrl: string | null;
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
  url: string;
  description: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface PublicDocument {
  id: string;
  title: string;
  category: string | null;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  visibility?: 'PUBLIC' | 'PRIVATE';
}

export interface CustomerReport {
  totals: { total: number; feeTotalPaise: number };
  byStatus: { status: CustomerStatus; count: number }[];
  byService: { serviceId: string; nameKn: string; nameEn: string | null; count: number; feeTotalPaise: number }[];
  byDay: { date: string; count: number }[];
}
