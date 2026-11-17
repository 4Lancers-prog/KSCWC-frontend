// RouteError.tsx — friendly page instead of React Router's raw "Unexpected Application Error!".
import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { Emblem } from './Emblem';

export function RouteError() {
  const err = useRouteError();
  const notFound = isRouteErrorResponse(err) && err.status === 404;
  if (import.meta.env.DEV) console.error(err);
  return (
    <div className="grid min-h-screen place-items-center bg-mist p-6" translate="no">
      <div className="w-full max-w-md rounded-xl2 border border-line bg-white p-8 text-center shadow-card">
        <div className="mx-auto w-fit"><Emblem size={64} /></div>
        <h1 className="mt-4 font-display text-xl text-navy-900">
          {notFound ? 'ಈ ಪುಟ ಕಂಡುಬಂದಿಲ್ಲ' : 'ಏನೋ ತಪ್ಪಾಗಿದೆ'}
        </h1>
        <p className="mt-1 text-slate2">
          {notFound ? 'This page was not found.' : 'Something went wrong on this page. Reloading usually fixes it.'}
        </p>
        {!notFound && (
          <p className="mt-3 text-xs text-slate2">
            ಬ್ರೌಸರ್‌ನ “ಅನುವಾದಿಸಿ / Translate” ಆನ್ ಆಗಿದ್ದರೆ ಅದನ್ನು ಆಫ್ ಮಾಡಿ · If your browser is translating this page, turn translation off — the site is already in Kannada and English.
          </p>
        )}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => window.location.reload()}
            className="inline-flex min-h-11 items-center rounded-lg border border-navy-700 bg-navy-600 px-5 pt-[11px] pb-[5px] font-semibold text-white shadow-[0_3px_0_0_#0a2150] hover:bg-navy-500">
            ಮರುಲೋಡ್ · Reload
          </button>
          <a href="/" className="inline-flex min-h-11 items-center rounded-lg border-[1.5px] border-navy-300 bg-white px-5 pt-[11px] pb-[5px] font-semibold text-navy-800 shadow-[0_3px_0_0_#aec6ee] hover:bg-navy-50">
            ಮುಖಪುಟ · Home
          </a>
        </div>
      </div>
    </div>
  );
}
