import { z } from "zod";

export const mintTokensSchema = z.object({
  body: z.object({
    spvId: z.string().uuid(),
    investorId: z.string().uuid(),
    amount: z.string(), // BigNumber as string
  }),
});

export const updateNAVSchema = z.object({
  body: z.object({
    spvId: z.string().uuid(),
    nav: z.string(), // BigNumber as string
  }),
});

export const triggerDistributionSchema = z.object({
  body: z.object({
    spvId: z.string().uuid(),
    totalAmount: z.string(), // BigNumber as string
    distributionType: z.enum(["income", "capital_gain", "liquidation"]),
  }),
});

export const updateWhitelistSchema = z.object({
  body: z.object({
    walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    whitelisted: z.boolean(),
  }),
});

export const reviewInvestorKYCSchema = z.object({
  body: z.object({
    action: z.enum(["approve", "reject"]),
    notes: z.string().optional(),
  }),
});

export const reviewManagerKYCSchema = z.object({
  body: z.object({
    action: z.enum(["approve", "reject"]),
    notes: z.string().optional(),
  }),
});

export const reviewSPVSchema = z.object({
  body: z.object({
    action: z.enum(["approve", "reject", "request_changes"]),
    notes: z.string().optional(),
  }),
});

export const approveAccountSchema = z.object({
  body: z.object({
    action: z.enum(["approve", "reject"]),
    rejectionReason: z.string().optional(),
  }),
});
