// PassportPhotoPage.tsx — operator tool: build a 4×6 inch sheet of 8 passport
// photos at 300 DPI with background replace/remove, crop, zoom and rotate.
// Fully client-side; nothing is uploaded.
import { useEffect, useRef, useState } from 'react';
import { replaceBackground, type RGB } from '../lib/background';
import { Button, FormField, Select, Alert } from '@/components/ui';
import {
  validateImageFile,
  loadImageFromFile,
  downloadCanvasJpg,
  printCanvasAtSize,
  exportCanvasPdf,
} from '../lib/imageExport';

const W = 1800;
const H = 1200;
const MM_PX = 300 / 25.4; // 300 DPI
type SizeMode = 'reduced' | 'standard';
type BgMode = 'original' | 'white' | 'blue' | 'custom' | 'remove';

export function PassportPhotoPage() {
  const sheetRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  // caches so slider moves don't recompute rotation / background every frame
  const rotatedRef = useRef<{ rotation: number; canvas: HTMLCanvasElement } | null>(null);
  const processedRef = useRef<{ key: string; canvas: HTMLCanvasElement } | null>(null);

  const [hasImage, setHasImage] = useState(false);
  const [fileName, setFileName] = useState('passport-photo');
  const [sizeMode, setSizeMode] = useState<SizeMode>('reduced');
  const [bgMode, setBgMode] = useState<BgMode>('original');
  const [customBg, setCustomBg] = useState('#ffffff');
  const [tolerance, setTolerance] = useState(35);
  const [zoom, setZoom] = useState(1);
  const [xpos, setXpos] = useState(0);
  const [ypos, setYpos] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [status, setStatus] = useState('ಮೊದಲು ಫೋಟೋ ಆಯ್ಕೆಮಾಡಿ · Choose a photo first');
  const [error, setError] = useState<string | null>(null);

  // ── rotation base ────────────────────────────────────────────────────
  function rotatedSource(): HTMLImageElement | HTMLCanvasElement {
    const img = imgRef.current!;
    if (rotation % 360 === 0) return img;
    const cache = rotatedRef.current;
    if (cache && cache.rotation === rotation) return cache.canvas;
    const rad = (rotation * Math.PI) / 180;
    const swap = rotation % 180 !== 0;
    const c = document.createElement('canvas');
    c.width = swap ? img.height : img.width;
    c.height = swap ? img.width : img.height;
    const cx = c.getContext('2d')!;
    cx.translate(c.width / 2, c.height / 2);
    cx.rotate(rad);
    cx.drawImage(img, -img.width / 2, -img.height / 2);
    rotatedRef.current = { rotation, canvas: c };
    return c;
  }

  // ── background pass (memoized) ───────────────────────────────────────
  function ensureProcessed(): HTMLCanvasElement {
    const key = `${rotation}|${bgMode}|${customBg}|${tolerance}`;
    const cache = processedRef.current;
    if (cache && cache.key === key) return cache.canvas;

    const base = rotatedSource();
    const bw = base.width;
    const bh = base.height;
    const scale = Math.min(1, 1200 / Math.max(bw, bh));
    const src = document.createElement('canvas');
    src.width = Math.max(1, Math.round(bw * scale));
    src.height = Math.max(1, Math.round(bh * scale));
    const sctx = src.getContext('2d', { willReadFrequently: true })!;
    sctx.drawImage(base, 0, 0, src.width, src.height);

    if (bgMode !== 'original') {
      const data = sctx.getImageData(0, 0, src.width, src.height);
      const bg = bgMode === 'white' ? '#ffffff' : bgMode === 'blue' ? '#dceeff' : bgMode === 'custom' ? customBg : null;
      const rgb: RGB | null = bg ? [parseInt(bg.slice(1, 3), 16), parseInt(bg.slice(3, 5), 16), parseInt(bg.slice(5, 7), 16)] : null;
      replaceBackground(data.data, src.width, src.height, tolerance, rgb);
      sctx.putImageData(data, 0, 0);
    }
    processedRef.current = { key, canvas: src };
    return src;
  }

  // ── draw one cropped cell ────────────────────────────────────────────
  function cropDraw(ctx: CanvasRenderingContext2D, source: HTMLCanvasElement, x: number, y: number, w: number, h: number) {
    const target = w / h;
    const ar = source.width / source.height;
    let sw: number;
    let sh: number;
    if (ar > target) {
      sh = source.height;
      sw = sh * target;
    } else {
      sw = source.width;
      sh = sw / target;
    }
    sw /= zoom;
    sh /= zoom;
    const maxX = Math.max(0, (source.width - sw) / 2);
    const maxY = Math.max(0, (source.height - sh) / 2);
    const sx = (source.width - sw) / 2 + (xpos / 100) * maxX;
    const sy = (source.height - sh) / 2 + (ypos / 100) * maxY;
    ctx.drawImage(
      source,
      Math.max(0, Math.min(source.width - sw, sx)),
      Math.max(0, Math.min(source.height - sh, sy)),
      sw,
      sh,
      x,
      y,
      w,
      h,
    );
  }

  // ── render the full sheet ────────────────────────────────────────────
  function render() {
    const canvas = sheetRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, W, H);
    if (!imgRef.current) {
      ctx.fillStyle = '#9fb0c8';
      ctx.font = '30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Upload a photo to build the 4×6 sheet', W / 2, H / 2);
      return;
    }
    const source = ensureProcessed();
    const standard = sizeMode === 'standard';
    const pw = (standard ? 35 : 28) * MM_PX;
    const ph = (standard ? 45 : 36) * MM_PX;
    const cols = 4;
    const rows = 2;
    const gap = standard ? 16 : 22;
    const totalW = cols * pw + gap;
    const totalH = rows * ph + gap * (rows - 1);
    const startX = (W - totalW) / 2;
    const startY = (H - totalH) / 2;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = startX + c * (pw + gap);
        const y = startY + r * (ph + gap);
        ctx.save();
        ctx.strokeStyle = '#d8d8d8';
        ctx.lineWidth = 2;
        ctx.strokeRect(x - 1, y - 1, pw + 2, ph + 2);
        cropDraw(ctx, source, x, y, pw, ph);
        ctx.restore();
      }
    }
  }

  // re-render whenever any adjustment changes
  useEffect(() => {
    render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasImage, sizeMode, bgMode, customBg, tolerance, zoom, xpos, ypos, rotation]);

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
      rotatedRef.current = null;
      processedRef.current = null;
      setFileName(file!.name.replace(/\.[^.]+$/, '') || 'passport-photo');
      setRotation(0);
      setZoom(1);
      setXpos(0);
      setYpos(0);
      setHasImage(true);
      setStatus('ಫೋಟೋ ಲೋಡ್ ಆಗಿದೆ — Crop ಹೊಂದಿಸಿ · Loaded — adjust the crop');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ಈ ಫೋಟೋ ತೆರೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ · Could not open this photo');
    }
  }

  function resetCrop() {
    setZoom(1);
    setXpos(0);
    setYpos(0);
    setStatus('Crop ಮರುಹೊಂದಿಸಲಾಗಿದೆ · Crop reset');
  }
  function rotate90() {
    setRotation((r) => (r + 90) % 360);
    rotatedRef.current = null;
    processedRef.current = null;
  }

  const layoutLabel = `8 photos · ${sizeMode === 'standard' ? '35×45' : '28×36'} mm Portrait`;

  return (
    <div>
      <div className="gold-rule mb-3" />
      <h1 className="font-display text-2xl text-navy-900">ಪಾಸ್‌ಪೋರ್ಟ್ ಫೋಟೋ ಮೇಕರ್</h1>
      <p className="text-sm text-slate2">Passport photo maker · 4 × 6 inch sheet · 8 photos · 300 DPI</p>

      <div className="mt-4 rounded-lg bg-navy-50 px-4 py-3 text-sm text-navy-800 ring-1 ring-inset ring-navy-100">
        ಚಿತ್ರ ನಿಮ್ಮ ಸಾಧನದಲ್ಲಿಯೇ ಪ್ರಕ್ರಿಯೆಯಾಗುತ್ತದೆ; ಸರ್ವರ್‌ಗೆ ಅಪ್‌ಲೋಡ್ ಆಗುವುದಿಲ್ಲ.
        <span className="block text-xs">The image is processed on your device and never uploaded.</span>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(280px,380px)_1fr]">
        {/* controls */}
        <div className="space-y-4">
          {error && <Alert tone="error">{error}</Alert>}

          <FormField id="passfile" label="1. ಫೋಟೋ ಆಯ್ಕೆಮಾಡಿ" helper="Choose your photo">
            <input
              id="passfile"
              type="file"
              accept="image/*"
              className="w-full rounded-lg border border-dashed border-navy-200 bg-navy-50/40 px-3 py-2.5 text-sm"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
          </FormField>

          <FormField id="sizeMode" label="2. ಫೋಟೋ ಗಾತ್ರ" helper="Photo size">
            <Select id="sizeMode" value={sizeMode} onChange={(e) => setSizeMode(e.target.value as SizeMode)}>
              <option value="reduced">28 × 36 mm — 8 photos fit</option>
              <option value="standard">35 × 45 mm Standard — 8 photos</option>
            </Select>
          </FormField>

          <FormField id="bgMode" label="3. ಹಿನ್ನೆಲೆ · Background" helper="Replace or remove">
            <Select id="bgMode" value={bgMode} onChange={(e) => setBgMode(e.target.value as BgMode)}>
              <option value="original">Original background</option>
              <option value="white">White background</option>
              <option value="blue">Light blue background</option>
              <option value="custom">Custom colour</option>
              <option value="remove">Remove (transparent → white)</option>
            </Select>
          </FormField>

          {bgMode === 'custom' && (
            <FormField id="customBg" label="Custom background colour" helper="Pick a colour">
              <input
                id="customBg"
                type="color"
                value={customBg}
                onChange={(e) => setCustomBg(e.target.value)}
                className="h-10 w-full rounded-lg border border-line"
              />
            </FormField>
          )}

          {bgMode !== 'original' && (
            <div>
              <div className="flex items-center justify-between text-sm text-slate2">
                <label htmlFor="tol">Background sensitivity</label>
                <span>{tolerance}</span>
              </div>
              <input
                id="tol"
                type="range"
                min={10}
                max={100}
                value={tolerance}
                onChange={(e) => setTolerance(Number(e.target.value))}
                className="w-full accent-navy-600"
              />
              <p className="text-xs text-slate2">
                ಸರಳ/ಒಂದೇ ಬಣ್ಣದ ಹಿನ್ನೆಲೆಗೆ ಉತ್ತಮ · Works best on a plain wall. If part of the face or hair also changes, lower the sensitivity; if some background is left, raise it a little.
              </p>
            </div>
          )}

          <div className="rounded-xl2 bg-mist p-3 space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm text-slate2">
                <label htmlFor="zoom">Zoom</label>
                <span>{zoom.toFixed(2)}×</span>
              </div>
              <input id="zoom" type="range" min={1} max={3} step={0.01} value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-navy-600" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm text-slate2">
                <label htmlFor="xpos">ಎಡ / ಬಲ · Left / Right</label>
                <span>{xpos}</span>
              </div>
              <input id="xpos" type="range" min={-100} max={100} value={xpos}
                onChange={(e) => setXpos(Number(e.target.value))} className="w-full accent-navy-600" />
            </div>
            <div>
              <div className="flex items-center justify-between text-sm text-slate2">
                <label htmlFor="ypos">ಮೇಲೆ / ಕೆಳಗೆ · Up / Down</label>
                <span>{ypos}</span>
              </div>
              <input id="ypos" type="range" min={-100} max={100} value={ypos}
                onChange={(e) => setYpos(Number(e.target.value))} className="w-full accent-navy-600" />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={resetCrop} disabled={!hasImage}>Reset crop</Button>
              <Button variant="secondary" size="sm" onClick={rotate90} disabled={!hasImage}>Rotate 90°</Button>
            </div>
          </div>
          {status && <p className="text-sm text-slate2">{status}</p>}
        </div>

        {/* preview */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-slate2">4 × 6 print preview</p>
            <span className="text-xs text-slate2">{layoutLabel}</span>
          </div>
          <div className="rounded-xl2 bg-mist p-3">
            <canvas ref={sheetRef} width={W} height={H} className="mx-auto block h-auto w-full rounded-lg bg-white shadow-card" />
          </div>
          <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-inset ring-amber-100">
            {sizeMode === 'standard'
              ? '35×45 mm Portrait — 4 columns × 2 rows on one 4×6 sheet.'
              : '28×36 mm Portrait — 4 photos per row, 2 rows (8 total).'}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              onClick={() => sheetRef.current && downloadCanvasJpg(sheetRef.current, `${fileName}-4x6-300dpi.jpg`, 0.98)}
              disabled={!hasImage}
            >
              4×6 JPG (300 DPI)
            </Button>
            <Button
              variant="secondary"
              onClick={() =>
                sheetRef.current &&
                exportCanvasPdf(sheetRef.current, { widthIn: 6, heightIn: 4, filename: `${fileName}-4x6.pdf`, title: 'Passport 4x6' })
              }
              disabled={!hasImage}
            >
              PDF (4×6)
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                const ok = sheetRef.current && printCanvasAtSize(sheetRef.current, { widthMm: 152.4, heightMm: 101.6, title: 'Passport 4x6' });
                if (ok === false) setError('ಪಾಪ್-ಅಪ್ ನಿರ್ಬಂಧಿತ · Popup blocked — allow popups for this site');
              }}
              disabled={!hasImage}
            >
              Print
            </Button>
          </div>
          <p className="mt-2 text-xs text-slate2">
            Print: Paper 4×6 inch (10×15 cm), Scale 100% / Actual size, Borderless if supported.
            ಅಧಿಕೃತ ಅರ್ಜಿಗೆ ಬಳಸುವ ಮೊದಲು ಪ್ರಸ್ತುತ ಫೋಟೋ ನಿಯಮಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.
          </p>
        </div>
      </div>
    </div>
  );
}
