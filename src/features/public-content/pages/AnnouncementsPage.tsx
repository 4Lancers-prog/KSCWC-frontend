// AnnouncementsPage.tsx — published announcements + safe YouTube embeds.
import { PageIntro } from '@/components/layout/PageIntro';
import { Spinner, Alert } from '@/components/ui';
import { L, H } from '@/i18n';
import { usePublicAnnouncements } from '../public-content.api';
import { formatDateOnly } from '@/lib/format';

export function AnnouncementsPage() {
  const { data, isLoading, isError } = usePublicAnnouncements();
  return (
    <PageIntro title={L.nav_announcements} subtitle={H.nav_announcements}>
      {isLoading ? (
        <div className="grid place-items-center py-16"><Spinner className="h-7 w-7 text-navy-500" /></div>
      ) : isError ? (
        <Alert tone="error">ಲೋಡ್ ಆಗಲಿಲ್ಲ · Could not load announcements.</Alert>
      ) : !data || data.length === 0 ? (
        <div className="rounded-xl2 border border-dashed border-line bg-mist p-10 text-center text-slate2">
          ಪ್ರಸ್ತುತ ಯಾವುದೇ ಪ್ರಕಟಣೆಗಳಿಲ್ಲ · No announcements right now.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {data.map((a) => (
            <article key={a.id} className="rounded-xl2 border border-line bg-white p-5 shadow-card">
              {a.contentType === 'VIDEO' && a.videoUrl ? (
                <div className="mb-3 overflow-hidden rounded-lg" style={{ aspectRatio: '16 / 9' }}>
                  <iframe
                    src={a.videoUrl}
                    title={a.title}
                    className="h-full w-full"
                    loading="lazy"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : null}
              <h2 className="font-display text-lg text-navy-900">{a.title}</h2>
              {a.publishAt && <p className="mt-0.5 text-xs text-slate2">{formatDateOnly(a.publishAt)}</p>}
              {a.body && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate2">{a.body}</p>}
            </article>
          ))}
        </div>
      )}
    </PageIntro>
  );
}
