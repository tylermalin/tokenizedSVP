import { z } from 'zod';

export const updateManagerProfileSchema = z.object({
  body: z.object({
    companyName: z.string().min(1).optional(),
    companyAddress: z.string().min(1).optional(),
    taxId: z.string().optional(),
    jurisdiction: z.string().optional()
  })
});

export const initiateManagerKYCSchema = z.object({
  body: z.object({
    email: z.string().email().optional()
  })
});

