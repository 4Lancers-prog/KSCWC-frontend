// status.ts — customer status labels (Kannada + English) + badge tone + allowed transitions.
import type { CustomerStatus } from '@/types/entities';

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export const customerStatusMeta: Record<CustomerStatus, { kn: string; en: string; tone: Tone }> = {
  PENDING: { kn: 'ಬಾಕಿ', en: 'Pending', tone: 'warning' },
  IN_PROGRESS: { kn: 'ಪ್ರಗತಿಯಲ್ಲಿ', en: 'In progress', tone: 'info' },
  COMPLETED: { kn: 'ಪೂರ್ಣಗೊಂಡಿದೆ', en: 'Completed', tone: 'success' },
  CANCELLED: { kn: 'ರದ್ದುಗೊಂಡಿದೆ', en: 'Cancelled', tone: 'danger' },
};

export const nextStatuses: Record<CustomerStatus, CustomerStatus[]> = {
  PENDING: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};
