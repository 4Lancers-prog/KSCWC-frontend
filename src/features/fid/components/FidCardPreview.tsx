// FidCardPreview.tsx — live card preview mirroring the PDF layout (85.6×54mm aspect).
import { Emblem } from '@/components/Emblem';

export interface FidPreviewData {
  farmerName?: string;
  gender?: string;
  fidNumber?: string;
  address?: string;
  maskedAadhaar?: string;
  photoDataUrl?: string | null;
}

export function FidCardPreview(d: FidPreviewData) {
  return (
    <div className="mx-auto w-full max-w-[360px]">
      {/* 85.6:54 ≈ 1.585 aspect ratio */}
      <div
        className="overflow-hidden rounded-xl border border-navy-900 bg-white shadow-card ring-1 ring-gold-500"
        style={{ aspectRatio: '85.6 / 54' }}
      >
        <div className="flex items-center gap-2 bg-navy-900 px-3 py-2 text-white">
          <Emblem size={26} />
          <div className="leading-tight">
            <p className="font-display text-sm font-bold">ಕೆಎಸ್‌ಸಿಡಬ್ಲ್ಯೂಸಿ</p>
            <p className="text-[10px] text-navy-100">FID Information Card</p>
          </div>
        </div>
        <div className="flex gap-3 px-3 py-2">
          <div className="flex-1 space-y-1 text-[11px] leading-tight">
            <p><span className="text-slate2">ಹೆಸರು / Name:</span> <b className="text-ink">{d.farmerName || '—'}</b></p>
            <p><span className="text-slate2">ಲಿಂಗ / Gender:</span> {d.gender || '—'}</p>
            <p><span className="text-slate2">ಎಫ್‌ಐಡಿ / FID:</span> <b className="text-ink">{d.fidNumber || '—'}</b></p>
            <p className="line-clamp-2"><span className="text-slate2">ವಿಳಾಸ / Address:</span> {d.address || '—'}</p>
            {d.maskedAadhaar && <p><span className="text-slate2">Aadhaar:</span> XXXX XXXX {d.maskedAadhaar}</p>}
          </div>
          {d.photoDataUrl ? (
            <img src={d.photoDataUrl} alt="" className="h-[70px] w-[56px] rounded border border-line object-cover" />
          ) : (
            <div className="grid h-[70px] w-[56px] place-items-center rounded border border-line bg-slate-100 text-[10px] text-slate-400">
              ಫೋಟೋ
            </div>
          )}
        </div>
        <div className="border-t border-gold-500 bg-mist px-3 py-1 text-[8px] text-slate2">
          User-generated FID information card — not an official government-issued identity document.
        </div>
      </div>
    </div>
  );
}
