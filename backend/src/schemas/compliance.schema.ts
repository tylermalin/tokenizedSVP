import { z } from 'zod';

export const initiateKYCSchema = z.object({
  body: z.object({
    email: z.string().email().optional()
  })
});

