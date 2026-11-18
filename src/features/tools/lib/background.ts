// background.ts — replace or remove a plain photo background (passport photos).
//
// How it works:
//  1. The background colour is read from the TOP edge and the UPPER part of the side edges only —
//     never the bottom corners, which in a passport photo are the person's shoulders/clothes.
//  2. Starting from those edges, it grows into neighbouring pixels that either match the
//     background colour, or continue it smoothly (small step from the previous pixel) — so wall
//     shading, gradients and camera noise are followed instead of stopping the fill.
//  3. The outline is softened (1-pixel blend) so hair/shoulder edges don't look cut out.
export type RGB = [number, number, number];

const d2 = (a: ArrayLike<number>, i: number, r: number, g: number, b: number) => {
  const dr = a[i]! - r, dg = a[i + 1]! - g, db = a[i + 2]! - b;
  return dr * dr + dg * dg + db * db;
};

function median(values: number[]) {
  const s = values.slice().sort((x, y) => x - y);
  return s[s.length >> 1] ?? 0;
}

/**
 * px: RGBA pixels (modified in place). tolerance: 5–120 (slider value).
 * colour: new background colour, or null to make it transparent.
 * Returns how many pixels were treated as background.
 */
export function replaceBackground(px: Uint8ClampedArray, w: number, h: number, tolerance: number, colour: RGB | null): number {
  const orig = new Uint8ClampedArray(px); // compare against original colours, not ones already replaced
  const sideLimit = Math.floor(h * 0.55);  // sides: only the upper part (below that are shoulders)

  // 1) reference colour from the top edge + upper sides
  const border: number[] = [];
  for (let x = 0; x < w; x++) border.push(x);                       // top row
  for (let y = 1; y < sideLimit; y++) border.push(y * w, y * w + w - 1); // upper left/right columns
  const ref: RGB = [0, 1, 2].map((c) => median(border.map((id) => orig[id * 4 + c]!))) as RGB;

  const T = tolerance * tolerance * 3;              // "is this the background colour?"
  const wide = T * 2.6;                             // overall limit when following shading
  const step = Math.max(14, tolerance * 0.55) ** 2 * 3; // "is this a smooth continuation?"

  const mask = new Uint8Array(w * h);
  const stack: number[] = [];
  for (const id of border) {
    if (!mask[id] && d2(orig, id * 4, ...ref) <= T) { mask[id] = 1; stack.push(id); }
  }

  // 2) grow through the background
  while (stack.length) {
    const id = stack.pop()!;
    const x = id % w, y = (id / w) | 0, i = id * 4;
    const n = [x > 0 ? id - 1 : -1, x < w - 1 ? id + 1 : -1, y > 0 ? id - w : -1, y < h - 1 ? id + w : -1];
    for (const nid of n) {
      if (nid < 0 || mask[nid]) continue;
      const j = nid * 4;
      const toRef = d2(orig, j, ...ref);
      const smooth = d2(orig, j, orig[i]!, orig[i + 1]!, orig[i + 2]!) <= step;
      if (toRef <= T || (smooth && toRef <= wide)) { mask[nid] = 1; stack.push(nid); }
    }
  }

  // 3) paint: background fully, the 1-pixel outline half-way (softer edge)
  let count = 0;
  for (let id = 0; id < w * h; id++) {
    const i = id * 4;
    if (mask[id]) {
      count++;
      if (colour) { px[i] = colour[0]; px[i + 1] = colour[1]; px[i + 2] = colour[2]; px[i + 3] = 255; }
      else px[i + 3] = 0;
      continue;
    }
    const x = id % w, y = (id / w) | 0;
    const edge = (x > 0 && mask[id - 1]) || (x < w - 1 && mask[id + 1]) || (y > 0 && mask[id - w]) || (y < h - 1 && mask[id + w]);
    if (edge) {
      if (colour) for (let c = 0; c < 3; c++) px[i + c] = Math.round(orig[i + c]! * 0.6 + colour[c]! * 0.4);
      else px[i + 3] = 150;
    }
  }
  return count;
}
