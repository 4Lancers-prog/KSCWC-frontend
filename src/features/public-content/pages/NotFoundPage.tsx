// NotFoundPage.tsx — 404.
import { Link } from 'react-router-dom';
import { buttonClass } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-mist p-6 text-center">
      <div>
        <p className="font-display text-5xl text-navy-900">404</p>
        <p className="mt-2 text-slate2">ಈ ಪುಟ ಕಂಡುಬಂದಿಲ್ಲ — This page was not found.</p>
        <Link to="/" className={buttonClass('primary', 'md', 'mt-6')}>
          ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ · Back home
        </Link>
      </div>
    </div>
  );
}
