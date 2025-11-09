import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Email must be valid'),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

