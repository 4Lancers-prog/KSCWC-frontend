// download.ts — fetch a file endpoint with credentials and trigger a browser download.
const BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export async function downloadFile(path: string, filename: string): Promise<void> {
  const res = await fetch(`${BASE}/api/v1${path}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
