// image-shrink.ts — make any phone photo a small logo before uploading (max 512px, ~50–150 KB).
// Avoids "file too large" errors and keeps the portal pages fast on mobile data.
export async function shrinkImage(file: File, maxSide = 512): Promise<File> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('ಚಿತ್ರ ಓದಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ · Could not read this image. Use a PNG or JPG photo.'));
      i.src = url;
    });
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
    // PNG keeps transparent logo corners; JPG for photos without transparency is much smaller.
    const isPng = file.type === 'image/png' || file.type === 'image/webp';
    const type = isPng ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, type, 0.9));
    if (!blob) return file;
    const name = file.name.replace(/\.[^.]+$/, '') + (isPng ? '.png' : '.jpg');
    return new File([blob], name, { type });
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** "kaveri.karnataka.gov.in" → "https://kaveri.karnataka.gov.in" (the server does the same). */
export function normalizeHttpsUrl(v: string): string {
  let s = v.trim();
  if (!s) return s;
  if (/^http:\/\//i.test(s)) s = 'https://' + s.slice(7);
  else if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) s = 'https://' + s.replace(/^\/+/, '');
  return s;
}
