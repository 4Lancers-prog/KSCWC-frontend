// FormShell.tsx — shared public-form layout (intro + success state).
import { type ReactNode } from 'react';
import { PageIntro } from '@/components/layout/PageIntro';
import { Alert } from '@/components/ui';

export function FormShell({
  title,
  subtitle,
  success,
  children,
}: {
  title: string;
  subtitle: string;
  success: ReactNode | null;
  children: ReactNode;
}) {
  return (
    <PageIntro title={title} subtitle={subtitle}>
      <div className="max-w-xl">
        {success ? <Alert tone="success" title="ಸ್ವೀಕರಿಸಲಾಗಿದೆ">{success}</Alert> : children}
      </div>
    </PageIntro>
  );
}
