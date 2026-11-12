// api.ts — API contract (MIRROR of backend src/shared/types/api.ts — keep in sync).
export type Role = 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'SUPPORT';
export type AccountStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';

export interface FieldError {
  field: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  fieldErrors?: FieldError[];
  requestId?: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SessionUser {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  role: Role;
  accountStatus: AccountStatus;
  centreName: string | null;
  cscId: string | null;
  mfaEnabled: boolean;
}
