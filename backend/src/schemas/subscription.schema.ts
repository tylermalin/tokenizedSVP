import { z } from 'zod';

export const createSubscriptionSchema = z.object({
  body: z.object({
    spvId: z.string().uuid(),
    amount: z.number().positive(),
    walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional()
  })
});

export const submitFundingSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    wireReference: z.string().min(1),
    bankName: z.string().optional(),
    accountNumber: z.string().optional()
  })
});

