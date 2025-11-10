import { z } from 'zod';

export const recordPaymentSchema = z.object({
  invoiceId: z.string().min(1, 'Invoice is required'),
  amount: z.number().positive('Amount must be greater than zero'),
  paymentDate: z.string().min(1, 'Payment date is required'),
});

export type RecordPaymentFormData = z.infer<typeof recordPaymentSchema>;


