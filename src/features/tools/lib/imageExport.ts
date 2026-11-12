// imageExport.ts — shared, dependency-light helpers for the operator photo tools.
// All processing is client-side: nothing here uploads, stores, or transmits the image.

/** Accepted input types and a generous size ceiling to avoid OOM on huge files. */
export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];
export const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15 MB

export interface ValidationResult {
  ok: boolean;
  /** Bilingual (Kannada · English) message when !ok. */
  message?: string;
}

/** Validate a user-selected file before we read it into a canvas. */
export function validateImageFile(file: File | undefined | null): ValidationResult {
  if (!file) return { ok: false, message: 'ಫೈಲ್ ಆಯ್ಕೆಯಾಗಿಲ್ಲ · No file selected' };
  if (!file.type.startsWith('image/')) {
    return { ok: false, message: 'ದಯವಿಟ್ಟು ಚಿತ್ರ ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ · Please select an image file' };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, message: '15MB ಗಿಂತ ಚಿಕ್ಕ ಚಿತ್ರ ಬಳಸಿ · Use an image under 15MB' };
  }
  return { ok: true };
}

/** Load a File into an HTMLImageElement, revoking the object URL afterwards. */
export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('ಚಿತ್ರ ಓದಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ · Could not read the image'));
    };
    img.src = url;
  });
}

/** Trigger a browser download of a canvas as a JPEG. */
export function downloadCanvasJpg(canvas: HTMLCanvasElement, filename: string, quality = 0.95) {
  const a = document.createElement('a');
  a.download = filename;
  a.href = canvas.toDataURL('image/jpeg', quality);
  a.click();
}

/**
 * Print a canvas at an exact physical paper size by opening a dedicated print
 * window. This avoids fighting the SPA layout with @media print rules and
 * yields a true-to-size "Save as PDF" from the browser's print dialog.
 * Returns false if a popup blocker prevented the window from opening.
 */
export function printCanvasAtSize(
  canvas: HTMLCanvasElement,
  opts: { widthMm: number; heightMm: number; title?: string },
): boolean {
  const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
  const w = window.open('', '_blank', 'noopener,noreferrer');
  if (!w) return false;
  const { widthMm, heightMm, title = 'Print' } = opts;
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
  @page { size: ${widthMm}mm ${heightMm}mm; margin: 0; }
  html, body { margin: 0; padding: 0; background: #fff; }
  img { display: block; width: ${widthMm}mm; height: ${heightMm}mm; }
  @media screen { body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #e9edf4; }
    img { box-shadow: 0 6px 24px rgba(0,0,0,.2); } }
</style></head><body>
  <img src="${dataUrl}" alt="${title}" onload="setTimeout(function(){window.focus();window.print();},150)">
</body></html>`);
  w.document.close();
  return true;
}

/**
 * Export a canvas to a PDF at an exact size (in inches) using jsPDF.
 * Falls back to the print window if jsPDF cannot be loaded.
 */
export async function exportCanvasPdf(
  canvas: HTMLCanvasElement,
  opts: { widthIn: number; heightIn: number; filename: string; title?: string },
): Promise<void> {
  const { widthIn, heightIn, filename } = opts;
  try {
    const { jsPDF } = await import('jspdf');
    const orientation = widthIn >= heightIn ? 'landscape' : 'portrait';
    const pdf = new jsPDF({ orientation, unit: 'in', format: [widthIn, heightIn], compress: true });
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, widthIn, heightIn, undefined, 'FAST');
    pdf.save(filename);
  } catch {
    // Graceful fallback: true-size print dialog (user picks "Save as PDF").
    printCanvasAtSize(canvas, { widthMm: widthIn * 25.4, heightMm: heightIn * 25.4, title: opts.title ?? filename });
  }
}
