// identity.ts — Aadhaar & PAN checks in the browser (same rules as the server), plus formatting.
import { z } from 'zod';

const D = [[0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],[3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],[6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0]];
const P = [[0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],[8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],[2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]];
export function verhoeffValid(num: string): boolean {
  if (!/^\d+$/.test(num)) return false;
  let c = 0;
  const d = num.split('').reverse().map(Number);
  for (let i = 0; i < d.length; i++) c = D[c]![P[i % 8]![d[i]!]!]!;
  return c === 0;
}
export const aadhaarDigits = (s: string) => s.replace(/\D/g, '').slice(0, 12);
/** "234567890123" → "2345 6789 0123" while typing */
export const formatAadhaar = (s: string) => aadhaarDigits(s).replace(/(\d{4})(?=\d)/g, '$1 ');
export const formatPan = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 10);

export function aadhaarProblem(raw: string): string | null {
  const v = aadhaarDigits(raw);
  if (v.length !== 12) return 'ಆಧಾರ್ 12 ಅಂಕಿಗಳು · Aadhaar must be 12 digits';
  if (!/^[2-9]/.test(v)) return 'ಆಧಾರ್ 0 ಅಥವಾ 1 ರಿಂದ ಆರಂಭವಾಗುವುದಿಲ್ಲ · Aadhaar cannot start with 0 or 1';
  if (!verhoeffValid(v)) return 'ಆಧಾರ್ ಸಂಖ್ಯೆ ತಪ್ಪಾಗಿದೆ · This Aadhaar number is not valid — please check the digits';
  return null;
}
export function panProblem(raw: string): string | null {
  const v = formatPan(raw);
  if (v.length !== 10) return 'ಪ್ಯಾನ್ 10 ಅಕ್ಷರಗಳು · PAN must be 10 characters, e.g. ABCDE1234F';
  if (!/^[A-Z]{3}[PCHFATBLJG][A-Z]\d{4}[A-Z]$/.test(v)) return 'ಪ್ಯಾನ್ ಸ್ವರೂಪ ತಪ್ಪಾಗಿದೆ · PAN format is not valid (5 letters, 4 digits, 1 letter, e.g. ABCDE1234F)';
  return null;
}
export const aadhaarField = z.string().superRefine((v, ctx) => { const p = aadhaarProblem(v); if (p) ctx.addIssue({ code: 'custom', message: p }); });
export const panField = z.string().superRefine((v, ctx) => { const p = panProblem(v); if (p) ctx.addIssue({ code: 'custom', message: p }); });
/** optional: empty is fine, anything typed must be valid */
export const optionalAadhaarField = z.string().optional().superRefine((v, ctx) => { if (v && v.trim()) { const p = aadhaarProblem(v); if (p) ctx.addIssue({ code: 'custom', message: p }); } });
export const optionalPanField = z.string().optional().superRefine((v, ctx) => { if (v && v.trim()) { const p = panProblem(v); if (p) ctx.addIssue({ code: 'custom', message: p }); } });
