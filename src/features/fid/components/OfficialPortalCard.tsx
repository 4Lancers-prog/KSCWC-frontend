// OfficialPortalCard.tsx — link-out to the official Karnataka FID portal (K-KISAN / FRUITS).
// Aadhaar + OTP verification and the authoritative FID lookup happen there, not in this app.
// The URL is admin-editable (SystemSetting fid_portal_url); falls back to the default.
import { useFidPortalLink, DEFAULT_FID_PORTAL_URL } from '../fid.api';

export function OfficialPortalCard() {
  const link = useFidPortalLink();
  const url = link.data?.url || DEFAULT_FID_PORTAL_URL;
  return (
    <>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 rounded-xl2 border border-line bg-white p-4 shadow-card transition hover:-translate-y-0.5 hover:shadow-lift"
      >
        <span className="grid h-11 w-11 flex-none place-items-center rounded-lg bg-navy-900 text-xl" aria-hidden>🏛️</span>
        <span className="flex-1">
          <span className="block font-display text-navy-900">ಅಧಿಕೃತ ಎಫ್‌ಐಡಿ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಪರಿಶೀಲಿಸಿ · Verify on the official portal</span>
          <span className="block text-sm text-slate2">
            ಆಧಾರ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ, OTP ಪಡೆದು ಸರ್ಕಾರದ K-KISAN ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ನೇರವಾಗಿ ಎಫ್‌ಐಡಿ ವಿವರ ಪಡೆಯಿರಿ.
            Enter Aadhaar, get the OTP and fetch FID details on the Karnataka government portal.
          </span>
        </span>
        <span className="flex-none rounded-lg bg-gold-500 px-4 py-2 text-sm font-semibold text-navy-950">ತೆರೆಯಿರಿ →</span>
      </a>
      <p className="mt-2 text-xs text-slate2">
        ಈ ಪುಟದಲ್ಲಿ ತಯಾರಾಗುವ ಕಾರ್ಡ್ ಮುದ್ರಣ ಸಹಾಯಕ್ಕಾಗಿ ಮಾತ್ರ; ಅಧಿಕೃತ ದೃಢೀಕರಣ ಸರ್ಕಾರದ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ನಡೆಯುತ್ತದೆ ·
        The card made here is a printable aid; official verification happens on the government portal.
      </p>
    </>
  );
}
