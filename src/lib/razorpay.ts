// razorpay.ts — lazy-load the Razorpay Checkout script and expose a typed opener.
let loading: Promise<void> | null = null;

export function loadRazorpay(): Promise<void> {
  if (typeof window !== 'undefined' && (window as unknown as { Razorpay?: unknown }).Razorpay) {
    return Promise.resolve();
  }
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Failed to load Razorpay Checkout'));
    document.body.appendChild(s);
  });
  return loading;
}

export interface RazorpayCheckoutResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  handler: (resp: RazorpayCheckoutResponse) => void;
  modal?: { ondismiss?: () => void };
  theme?: { color?: string };
  prefill?: { contact?: string; name?: string };
}

export function openRazorpay(options: RazorpayOptions): void {
  const Ctor = (window as unknown as { Razorpay: new (o: RazorpayOptions) => { open: () => void } }).Razorpay;
  new Ctor(options).open();
}
