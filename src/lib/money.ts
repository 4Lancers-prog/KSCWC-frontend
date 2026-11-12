// money.ts — rupee/paise conversion (client side; server recomputes authoritatively).
export const rupeesToPaise = (rupees: number): number => Math.round(rupees * 100);
export const paiseToRupees = (paise: number): number => paise / 100;
