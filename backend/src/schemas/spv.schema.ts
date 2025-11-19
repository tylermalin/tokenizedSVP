import { z } from 'zod';

export const createSPVSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(255),
    type: z.enum(['single_name', 'multi_name', 'real_estate']),
    fundraisingStart: z.string().datetime(),
    fundraisingEnd: z.string().datetime(),
    lifespanYears: z.number().int().min(3),
    managementFee: z.number().min(0).max(100).optional(),
    carryFee: z.number().min(0).max(100).optional(),
    adminFee: z.number().min(0).max(100).optional(),
    targetAmount: z.number().positive().optional(),
    // Real estate specific
    capitalStack: z.object({
      equity: z.number().min(0).optional(),
      preferred: z.number().min(0).optional(),
      mezzanine: z.number().min(0).optional()
    }).optional()
  })
});

export const updateSPVSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    status: z.enum(['configuring', 'fundraising', 'active', 'liquidating', 'liquidated']).optional()
  }).partial()
});

export const inviteLPsSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    emails: z.array(z.string().email()).min(1)
  })
});

