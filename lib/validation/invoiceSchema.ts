import { z } from 'zod';

export const createInvoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
});

export const addLineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().int().positive('Quantity must be greater than zero'),
  unitPrice: z.number().positive('Unit price must be greater than zero'),
});

export type CreateInvoiceFormData = z.infer<typeof createInvoiceSchema>;
export type AddLineItemFormData = z.infer<typeof addLineItemSchema>;


