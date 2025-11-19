export interface User {
  id: string;
  email: string;
  role: 'manager' | 'investor' | 'admin';
}

export interface SPV {
  id: string;
  name: string;
  type: 'single_name' | 'multi_name' | 'real_estate';
  status: 'configuring' | 'fundraising' | 'active' | 'liquidating' | 'liquidated';
  managerId: string;
  tokenContractAddress?: string;
  fundraisingStart: string;
  fundraisingEnd: string;
  targetAmount?: number;
  lifespanYears: number;
  managementFee?: number;
  carryFee?: number;
  adminFee?: number;
  currentNAV?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  spvId: string;
  investorId: string;
  amount: number;
  tokenAmount?: number;
  status: 'pending' | 'funded' | 'completed' | 'cancelled';
  walletAddress?: string;
  wireReference?: string;
  createdAt: string;
}

export interface Investor {
  id: string;
  email: string;
  walletAddress?: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  amlStatus: 'pending' | 'cleared' | 'flagged';
  jurisdiction?: string;
}

export interface TokenHolding {
  spvId: string;
  spvName: string;
  spvType: string;
  spvStatus: string;
  tokenBalance: number;
  onChainBalance: number;
}

export interface Distribution {
  id: string;
  spvId: string;
  spvName: string;
  amount: number;
  perTokenAmount: number;
  distributionType: 'income' | 'capital_gain' | 'liquidation';
  processedAt: string;
}

export interface Drawdown {
  id: string;
  spvId: string;
  developerId: string;
  amount: number;
  milestone: string;
  status: 'requested' | 'approved' | 'rejected' | 'disbursed';
  documentsHash?: string;
  rejectionReason?: string;
  requestedAt: string;
  approvedAt?: string;
  disbursedAt?: string;
}

export interface Milestone {
  id: string;
  spvId: string;
  description: string;
  proof?: string;
  completed: boolean;
  completionTime?: string;
}

