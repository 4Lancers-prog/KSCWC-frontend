// main.tsx — React entry. Loads self-hosted fonts + styles and mounts the providers.
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';

// self-hosted fonts (bundled; no CDN)
import '@fontsource/baloo-tamma-2/500.css';
import '@fontsource/baloo-tamma-2/600.css';
import '@fontsource/baloo-tamma-2/700.css';
import '@fontsource/noto-sans-kannada/400.css';
import '@fontsource/noto-sans-kannada/500.css';
import '@fontsource/noto-sans-kannada/600.css';

import './styles/tokens.css';
import './styles/globals.css';

import { queryClient } from './lib/query-client';
import { router } from './router';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from './components/ui';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  </React.StrictMode>,
);
