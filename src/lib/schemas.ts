// schemas.ts — client-side Zod form schemas (mirror of backend request schemas).
import { z } from 'zod';
import { aadhaarField, panField, optionalAadhaarField, optionalPanField } from './identity';

export const phoneField = z
  .string()
  .trim()
  .regex(/^(?:\+?91)?[6-9]\d{9}$/, 'Enter a valid 10-digit mobile number');

export const loginForm = z.object({
  phone: phoneField,
  password: z.string().min(1, 'Password is required'),
  mfaToken: z.string().trim().length(6, 'Enter the 6-digit code').optional().or(z.literal('')),
});
export type LoginForm = z.infer<typeof loginForm>;

export const registerForm = z
  .object({
    fullName: z.string().trim().min(1, 'Required').max(120),
    phone: phoneField,
    email: z.string().trim().email('Enter a valid email').optional().or(z.literal('')),
    centreName: z.string().trim().max(160).optional().or(z.literal('')),
    pincode: z.string().trim().regex(/^\d{6}$/, 'Enter a 6-digit PIN code'),
    aadhaar: aadhaarField,
    pan: panField,
    password: z.string().min(12, 'Use at least 12 characters'),
    confirm: z.string().min(1, 'ಪಾಸ್‌ವರ್ಡ್ ಮತ್ತೆ ನಮೂದಿಸಿ · Please confirm your password'),
  })
  .refine((v) => !v.confirm || v.password === v.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });
export type RegisterForm = z.infer<typeof registerForm>;

export const customerForm = z.object({
  fullName: z.string().trim().min(1, 'Required').max(120),
  mobile: phoneField,
  serviceId: z.string().uuid('Choose a service'),
  referenceCode: z.string().trim().max(100).optional().or(z.literal('')),
  feeRupees: z
    .string()
    .trim()
    .optional()
    .or(z.literal(''))
    .refine((v) => !v || /^\d+(\.\d{1,2})?$/.test(v), 'Enter a valid amount'),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  aadhaar: optionalAadhaarField,
  pan: optionalPanField,
});
export type CustomerForm = z.infer<typeof customerForm>;


export const insuranceForm = z.object({
  customerName: z.string().trim().min(1, 'Required').max(120),
  mobile: phoneField,
  vehicleNumber: z.string().trim().max(32).optional().or(z.literal('')),
  nomineeName: z.string().trim().max(120).optional().or(z.literal('')),
  nomineeRelation: z.string().trim().max(60).optional().or(z.literal('')),
  policyType: z.string().trim().max(80).optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});
export const membershipFormSchema = z.object({
  operatorName: z.string().trim().min(1, 'Required').max(120),
  centreName: z.string().trim().min(1, 'Required').max(160),
  district: z.string().trim().min(1, 'Required').max(120),
  taluk: z.string().trim().min(1, 'Required').max(120),
  phone: phoneField,
  email: z.string().trim().email('Enter a valid email').optional().or(z.literal('')),
});
export const trainingFormSchema = z.object({
  name: z.string().trim().min(1, 'Required').max(120),
  phone: phoneField,
  topic: z.string().trim().min(1, 'Required').max(160),
  mode: z.enum(['ONLINE', 'OFFLINE']),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});
export const grievanceFormSchema = z.object({
  name: z.string().trim().min(1, 'Required').max(120),
  phone: phoneField,
  category: z.string().trim().min(1, 'Required').max(80),
  details: z.string().trim().min(1, 'Required').max(4000),
});

export const resetForm = z
  .object({
    token: z.string().min(10),
    password: z.string().min(12, 'Use at least 12 characters'),
    confirm: z.string().min(1, 'ಪಾಸ್‌ವರ್ಡ್ ಮತ್ತೆ ನಮೂದಿಸಿ · Please confirm your password'),
  })
  .refine((v) => !v.confirm || v.password === v.confirm, { message: 'Passwords do not match', path: ['confirm'] });
