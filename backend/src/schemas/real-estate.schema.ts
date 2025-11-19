import { z } from 'zod';

export const requestDrawdownSchema = z.object({
  params: z.object({
    spvId: z.string().uuid()
  }),
  body: z.object({
    amount: z.number().positive(),
    milestone: z.string().min(1),
    documents: z.array(z.string().url()).optional()
  })
});

export const recordMilestoneSchema = z.object({
  params: z.object({
    spvId: z.string().uuid()
  }),
  body: z.object({
    milestoneId: z.string().uuid().optional(),
    description: z.string().min(1),
    proof: z.string().optional() // URL or hash
  })
});

