# Operator photo tools

Two client-side utilities were added to the operator dashboard, ported from the
client's prototypes (`B2_Photo_Converter`, `passport_photo_maker`, and the combined
`Digital_Karnataka_Login_Approval_Portal`). They are deliberately **100% in-browser**:
the selected image is processed on the operator's device and is never uploaded,
stored, or sent to the backend. This matches the BPD's privacy-minimisation stance
and needs no server endpoint, table, or migration.

## Where they live

- Routes (operator-only, behind `RequireAuth`):
  - `/app/tools/b2-photo` → `features/tools/pages/B2ConverterPage.tsx`
  - `/app/tools/passport-photo` → `features/tools/pages/PassportPhotoPage.tsx`
- Linked from the operator sidebar (`DashboardLayout`) and the dashboard tiles.
- Shared export/validation helpers: `features/tools/lib/imageExport.ts`.

## B2 Photo Converter

Converts any photo to **2673 × 1890 px** (B2 landscape, 707 × 500 mm).

- Upload with validation (image MIME, ≤ 15 MB).
- **Manual crop** — a draggable / resizable box locked to the B2 aspect ratio
  (drag inside to move, drag the bottom-right handle to resize).
- Fit mode: *Fill (crop)* or *Whole image (letterbox)*.
- JPG quality: High / Medium / Maximum.
- Output: **JPG download**, **B2 PDF**, or **Print** at true 707 × 500 mm size.

## Passport Photo Maker

Builds a **4 × 6 inch sheet of 8 passport photos at 300 DPI** (1800 × 1200 px).

- Upload with the same validation.
- Size: 28 × 36 mm (8 fit) or 35 × 45 mm standard portrait.
- Background: keep original, replace with white / light-blue / custom colour, or
  remove (edge flood-fill with an adjustable sensitivity slider).
- Crop with zoom + left/right + up/down, plus **Rotate 90°**.
- Output: **JPG (300 DPI)**, **PDF (4 × 6)**, or **Print**.

## Export mechanics

`imageExport.ts` centralises output so both tools behave identically:

- `downloadCanvasJpg` — `canvas.toDataURL('image/jpeg', q)` download.
- `exportCanvasPdf` — lazy-`import('jspdf')` and emit a true-size PDF; if jsPDF
  fails to load it falls back to the print window, so PDF output degrades
  gracefully rather than breaking.
- `printCanvasAtSize` — opens a dedicated print window sized with `@page` so the
  SPA layout is never involved; returns `false` if a popup blocker intervened
  (the UI then shows a "allow popups" message).
- `validateImageFile` — bilingual (Kannada · English) guard for type and size.

`jspdf` is the only new dependency; Vite code-splits it into its own chunk, so it
is downloaded only when an operator first exports a PDF.
