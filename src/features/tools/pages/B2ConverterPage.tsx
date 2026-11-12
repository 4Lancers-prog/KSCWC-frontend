// B2ConverterPage.tsx — operator tool: convert any photo to B2 size (2673×1890 px)
// with a manual, ratio-locked crop. Fully client-side; nothing is uploaded.
import { useEffect, useRef, useState } from 'react';
import { Button, FormField, Select, Alert } from '@/components/ui';
import {
  validateImageFile,
  loadImageFromFile,
  downloadCanvasJpg,
  printCanvasAtSize,
  exportCanvasPdf,
} from '../lib/imageExport';

const W = 2673;
const H = 1890;
const R = W / H; // B2 landscape ratio
const B2_W_MM = 707;
const B2_H_MM = 500;

type Box = { x: number; y: number; w: number; h: number };
type Drag = { type: 'move' | 'resize' | 'new'; start: { x: number; y: number }; original: Box };

export function B2ConverterPage() {
  const cropCanvasRef = useRef<HTMLCanvasElement>(null);
  const outCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const imageBoxRef = useRef<Box | null>(null);
  const cropRef = useRef<Box | null>(null);
  const dragRef = useRef<Drag | null>(null);

  const [mode, setMode] = useState<'cover' | 'contain'>('cover');
  const [quality, setQuality] = useState('0.95');
  const [hasImage, setHasImage] = useState(false);
  const [converted, setConverted] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);

  // ── crop-stage geometry ──────────────────────────────────────────────
  function fitImageBox() {
    const img = imgRef.current;
    const cc = cropCanvasRef.current;
    if (!img || !cc) return;
    const pad = 22;
    const s = Math.min((cc.width - pad * 2) / img.width, (cc.height - pad * 2) / img.height);
    const w = img.width * s;
    const h = img.height * s;
    imageBoxRef.current = { x: (cc.width - w) / 2, y: (cc.height - h) / 2, w, h };
  }
  function initialCrop() {
    const ib = imageBoxRef.current;
    if (!ib) return;
    const w = Math.min(ib.w, ib.h * R);
    const h = w / R;
    cropRef.current = { x: ib.x + (ib.w - w) / 2, y: ib.y + (ib.h - h) / 2, w, h };
  }
  function drawCropUI() {
    const img = imgRef.current;
    const cc = cropCanvasRef.current;
    const ib = imageBoxRef.current;
    const crop = cropRef.current;
    if (!img || !cc || !ib) return;
    const ctx = cc.getContext('2d')!;
    ctx.clearRect(0, 0, cc.width, cc.height);
    ctx.fillStyle = '#0e2c59';
    ctx.fillRect(0, 0, cc.width, cc.height);
    ctx.drawImage(img, ib.x, ib.y, ib.w, ib.h);
    if (!crop) return;
    ctx.fillStyle = 'rgba(6,20,54,.6)';
    ctx.fillRect(ib.x, ib.y, ib.w, ib.h);
    ctx.clearRect(crop.x, crop.y, crop.w, crop.h);
    ctx.drawImage(
      img,
      ((crop.x - ib.x) / ib.w) * img.width,
      ((crop.y - ib.y) / ib.h) * img.height,
      (crop.w / ib.w) * img.width,
      (crop.h / ib.h) * img.height,
      crop.x,
      crop.y,
      crop.w,
      crop.h,
    );
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(crop.x, crop.y, crop.w, crop.h);
    // resize handle (bottom-right)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(crop.x + crop.w - 14, crop.y + crop.h - 14, 22, 22);
    ctx.strokeStyle = '#dca81f';
    ctx.lineWidth = 2;
    ctx.strokeRect(crop.x + crop.w - 14, crop.y + crop.h - 14, 22, 22);
  }

  // ── pointer math ─────────────────────────────────────────────────────
  function pointerPos(e: React.PointerEvent) {
    const cc = cropCanvasRef.current!;
    const r = cc.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * cc.width) / r.width,
      y: ((e.clientY - r.top) * cc.height) / r.height,
    };
  }
  const inside = (p: { x: number; y: number }, r: Box) =>
    p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;

  function onPointerDown(e: React.PointerEvent) {
    const img = imgRef.current;
    const ib = imageBoxRef.current;
    const crop = cropRef.current;
    if (!img || !ib || !crop) return;
    const p = pointerPos(e);
    const handle = { x: crop.x + crop.w, y: crop.y + crop.h };
    if (Math.hypot(p.x - handle.x, p.y - handle.y) < 35) {
      dragRef.current = { type: 'resize', start: p, original: { ...crop } };
    } else if (inside(p, crop)) {
      dragRef.current = { type: 'move', start: p, original: { ...crop } };
    } else {
      const relX = Math.max(ib.x, Math.min(p.x, ib.x + ib.w));
      const relY = Math.max(ib.y, Math.min(p.y, ib.y + ib.h));
      dragRef.current = { type: 'new', start: { x: relX, y: relY }, original: { ...crop } };
    }
    cropCanvasRef.current!.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    const drag = dragRef.current;
    const ib = imageBoxRef.current;
    if (!drag || !ib) return;
    const p = pointerPos(e);
    const o = drag.original;
    const dx = p.x - drag.start.x;
    const dy = p.y - drag.start.y;
    if (drag.type === 'move') {
      cropRef.current = {
        x: Math.max(ib.x, Math.min(ib.x + ib.w - o.w, o.x + dx)),
        y: Math.max(ib.y, Math.min(ib.y + ib.h - o.h, o.y + dy)),
        w: o.w,
        h: o.h,
      };
    } else if (drag.type === 'resize') {
      const maxW = Math.min(ib.x + ib.w - o.x, (ib.y + ib.h - o.y) * R);
      const nw = Math.max(100, Math.min(maxW, Math.max(o.w + dx, (o.h + dy) * R)));
      cropRef.current = { x: o.x, y: o.y, w: nw, h: nw / R };
    } else {
      const maxW = Math.min(ib.x + ib.w - drag.start.x, (ib.y + ib.h - drag.start.y) * R);
      const nw = Math.max(100, Math.min(maxW, Math.max(p.x - drag.start.x, (p.y - drag.start.y) * R)));
      cropRef.current = { x: drag.start.x, y: drag.start.y, w: nw, h: nw / R };
    }
    drawCropUI();
    setConverted(false);
  }
  function stopDrag() {
    dragRef.current = null;
  }

  // ── file select ──────────────────────────────────────────────────────
  async function onFile(file?: File) {
    setError(null);
    const v = validateImageFile(file);
    if (!v.ok) {
      setError(v.message!);
      return;
    }
    try {
      const img = await loadImageFromFile(file!);
      imgRef.current = img;
      fitImageBox();
      initialCrop();
      drawCropUI();
      setHasImage(true);
      setConverted(false);
      setStatus('ಚಿತ್ರ ಸಿದ್ಧ — ಬೇಕಾದ ಭಾಗವನ್ನು ಎಳೆದು ಆಯ್ಕೆಮಾಡಿ · Ready — drag to choose the crop');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ಚಿತ್ರ ಓದಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ · Could not read the image');
    }
  }

  // ── convert to the 2673×1890 output canvas ───────────────────────────
  function draw() {
    const img = imgRef.current;
    const out = outCanvasRef.current;
    const ib = imageBoxRef.current;
    const crop = cropRef.current;
    if (!img || !out) return;
    const ctx = out.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    if (mode === 'cover' && crop && ib) {
      const sx = ((crop.x - ib.x) / ib.w) * img.width;
      const sy = ((crop.y - ib.y) / ib.h) * img.height;
      const sw = (crop.w / ib.w) * img.width;
      const sh = (crop.h / ib.h) * img.height;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
    } else {
      const scale = Math.min(W / img.width, H / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
    }
    setConverted(true);
    setStatus('ಯಶಸ್ವಿ! 2673 × 1890 px ಗೆ ಪರಿವರ್ತಿಸಲಾಗಿದೆ · Converted to 2673×1890 px');
  }

  // Re-render the output when the fit mode changes after a conversion.
  useEffect(() => {
    if (converted) draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  function resetCrop() {
    if (!imgRef.current) return;
    fitImageBox();
    initialCrop();
    drawCropUI();
    setConverted(false);
    setStatus('Crop ಮೂಲ ಸ್ಥಿತಿಗೆ ಮರಳಿದೆ · Crop reset');
  }
  function resetAll() {
    imgRef.current = null;
    imageBoxRef.current = null;
    cropRef.current = null;
    setHasImage(false);
    setConverted(false);
    setStatus('');
    setError(null);
    const out = outCanvasRef.current;
    if (out) out.getContext('2d')!.clearRect(0, 0, W, H);
    const cc = cropCanvasRef.current;
    if (cc) cc.getContext('2d')!.clearRect(0, 0, cc.width, cc.height);
  }

  function onPrint() {
    const out = outCanvasRef.current;
    if (!out || !converted) return;
    const ok = printCanvasAtSize(out, { widthMm: B2_W_MM, heightMm: B2_H_MM, title: 'B2 Photo' });
    if (!ok) setError('ಪಾಪ್-ಅಪ್ ನಿರ್ಬಂಧಿತ — ಈ ಸೈಟ್‌ಗೆ ಪಾಪ್-ಅಪ್ ಅನುಮತಿಸಿ · Popup blocked — allow popups for this site');
  }

  return (
    <div>
      <div className="gold-rule mb-3" />
      <h1 className="font-display text-2xl text-navy-900">B2 ಫೋಟೋ ಕನ್ವರ್ಟರ್</h1>
      <p className="text-sm text-slate2">
        B2 photo converter · ಯಾವುದೇ ಚಿತ್ರವನ್ನು 2673 × 1890 px (707 × 500 mm) ಗೆ ಪರಿವರ್ತಿಸಿ
      </p>

      <div className="mt-4 rounded-lg bg-navy-50 px-4 py-3 text-sm text-navy-800 ring-1 ring-inset ring-navy-100">
        ಚಿತ್ರ ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿಯೇ ಪ್ರಕ್ರಿಯೆಯಾಗುತ್ತದೆ; ಸರ್ವರ್‌ಗೆ ಅಪ್‌ಲೋಡ್ ಆಗುವುದಿಲ್ಲ.
        <span className="block text-xs">The image is processed on your device and never uploaded.</span>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        {/* controls + crop */}
        <div className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}

          <FormField id="b2file" label="1. ಚಿತ್ರ ಆಯ್ಕೆಮಾಡಿ" helper="Choose an image (JPG/PNG/WEBP)">
            <input
              id="b2file"
              type="file"
              accept="image/*"
              className="w-full rounded-lg border border-dashed border-navy-200 bg-navy-50/40 px-3 py-2.5 text-sm"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id="b2mode" label="ಹೊಂದಿಸುವ ವಿಧಾನ" helper="Fit mode">
              <Select id="b2mode" value={mode} onChange={(e) => setMode(e.target.value as 'cover' | 'contain')}>
                <option value="cover">Crop ಮಾಡಿ ತುಂಬಿಸಿ · Fill (crop)</option>
                <option value="contain">ಪೂರ್ಣ ಚಿತ್ರ · Whole image (letterbox)</option>
              </Select>
            </FormField>
            <FormField id="b2quality" label="JPG ಗುಣಮಟ್ಟ" helper="JPG quality">
              <Select id="b2quality" value={quality} onChange={(e) => setQuality(e.target.value)}>
                <option value="0.95">High</option>
                <option value="0.85">Medium</option>
                <option value="1">Maximum</option>
              </Select>
            </FormField>
          </div>

          <p className="text-sm text-slate2">
            <strong className="text-navy-800">Manual crop:</strong> ಚಿತ್ರದ ಮೇಲೆ ಎಳೆದು ಬೇಕಾದ ಭಾಗ ಆಯ್ಕೆಮಾಡಿ. ಆಯ್ಕೆಯ ಒಳಗೆ
            ಎಳೆದರೆ ಸ್ಥಳ ಬದಲಾಗುತ್ತದೆ; ಬಲ-ಕೆಳಗಿನ ಹಿಡಿ ಎಳೆದರೆ ಗಾತ್ರ. B2 ಅನುಪಾತ ಉಳಿಯುತ್ತದೆ.
          </p>

          <div className="rounded-xl2 bg-mist p-2">
            <canvas
              ref={cropCanvasRef}
              width={1000}
              height={700}
              hidden={!hasImage}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={stopDrag}
              onPointerCancel={stopDrag}
              className="block w-full touch-none rounded-lg"
              style={{ cursor: 'crosshair' }}
            />
            {!hasImage && (
              <p className="px-2 py-10 text-center text-sm text-slate2">
                ಮೊದಲು ಚಿತ್ರ ಆಯ್ಕೆಮಾಡಿ · Choose an image first
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={draw} disabled={!hasImage}>
              2673 × 1890 ಗೆ ಪರಿವರ್ತಿಸಿ · Convert
            </Button>
            <Button variant="secondary" onClick={resetCrop} disabled={!hasImage}>
              Crop Reset
            </Button>
            <Button variant="ghost" onClick={resetAll}>
              ಎಲ್ಲಾ Reset
            </Button>
          </div>
          {status && <p className="text-sm text-success">{status}</p>}
        </div>

        {/* preview + output */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-3 text-sm text-slate2">B2 ಮುನ್ನೋಟ · Output preview</p>
          <div className="rounded-xl2 bg-mist p-3">
            <canvas
              ref={outCanvasRef}
              width={W}
              height={H}
              className="mx-auto block h-auto max-h-[60vh] w-full rounded-lg bg-white shadow-card"
            />
          </div>
          <p className="mt-3 text-xs text-slate2">
            Output: 2673 × 1890 px · B2 ಕಾಗದ 707 × 500 mm. ಈ pixel ಗಾತ್ರದಲ್ಲಿ ಪರಿಣಾಮಕಾರಿ resolution ~96 PPI
            (300 DPI ಮುದ್ರಣ ಗುಣಮಟ್ಟವಲ್ಲ).
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={() => outCanvasRef.current && downloadCanvasJpg(outCanvasRef.current, 'B2-photo-2673x1890.jpg', Number(quality))}
              disabled={!converted}
            >
              JPG ಡೌನ್‌ಲೋಡ್
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                outCanvasRef.current &&
                exportCanvasPdf(outCanvasRef.current, {
                  widthIn: B2_W_MM / 25.4,
                  heightIn: B2_H_MM / 25.4,
                  filename: 'B2-photo.pdf',
                  title: 'B2 Photo',
                })
              }
              disabled={!converted}
            >
              B2 PDF
            </Button>
            <Button variant="secondary" onClick={onPrint} disabled={!converted}>
              Print
            </Button>
          </div>
          <p className="mt-2 text-xs text-slate2">
            Print/PDF: Paper B2 (707 × 500 mm), Landscape, Margins None. ಪ್ರಿಂಟರ್‌ನಲ್ಲಿ B2 ಇಲ್ಲದಿದ್ದರೆ Custom size ಬಳಸಿ.
          </p>
        </div>
      </div>
    </div>
  );
}
