// lazy-page.ts — load a page's code only when it's first opened (smaller first download).
// After a new deploy, an already-open tab may ask for an old file that no longer exists; in that
// case reload once to pick up the new version instead of showing an error.
import { lazy, type ComponentType } from 'react';

const RELOADED = 'kscwc.chunkReload';

export function lazyPage<M extends Record<string, unknown>>(load: () => Promise<M>, name: keyof M) {
  return lazy(async () => {
    try {
      const m = await load();
      sessionStorage.removeItem(RELOADED);
      return { default: m[name] as ComponentType };
    } catch (err) {
      const msg = String((err as Error)?.message ?? err);
      const stale = /dynamically imported module|Importing a module script failed|Loading chunk|Failed to fetch/i.test(msg);
      if (stale && !sessionStorage.getItem(RELOADED)) {
        sessionStorage.setItem(RELOADED, '1');
        window.location.reload();
        return new Promise<never>(() => {}); // page is reloading
      }
      throw err;
    }
  });
}
