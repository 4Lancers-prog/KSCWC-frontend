// NotFoundPage.tsx — 404.
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-mist p-6 text-center">
      <div>
        <p className="font-display text-5xl text-navy-900">404</p>
        <p className="mt-2 text-slate2">ಈ ಪುಟ ಕಂಡುಬಂದಿಲ್ಲ — This page was not found.</p>
        <Link to="/" className="mt-6 inline-block rounded-lg bg-navy-600 px-5 py-2.5 text-white hover:bg-navy-700">
          ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ · Back home
        </Link>
      </div>
    </div>
  );
}
