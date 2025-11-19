# Smart Contract Documentation

## Overview

The SPV Platform uses smart contracts to tokenize LP interests, enabling compliant digital securities with transfer restrictions, whitelisting, and lockup periods.

## Contracts

### TokenizedSPV

Main ERC-20 token contract representing LP interests in an SPV.

**Features:**
- Transfer restrictions (whitelist-only)
- Lockup periods
- NAV tracking
- Distribution recording
- Pausable functionality

**Key Functions:**
- `mint(address to, uint256 amount)` - Mint tokens (admin only)
- `burn(address from, uint256 amount)` - Burn tokens (admin only)
- `updateWhitelist(address account, bool whitelisted)` - Update whitelist
- `setLockup(address account, uint256 unlockTime)` - Set lockup period
- `updateNAV(uint256 newNAV)` - Update Net Asset Value
- `canTransfer(address from, address to, uint256 value)` - Check transfer eligibility

### ComplianceEngine

Simplified on-chain compliance checking (production would use oracles).

**Features:**
- KYC verification
- AML clearance
- Jurisdiction tracking

## Deployment

Contracts are deployed using Hardhat. See `contracts/README.md` for deployment instructions.

## Security Considerations

1. **Audits**: Contracts must be audited before production
2. **Access Control**: Admin functions are protected
3. **Transfer Restrictions**: Enforced at contract level
4. **Upgradeability**: Consider proxy patterns for future upgrades

## Integration

The backend `BlockchainService` interacts with deployed contracts using ethers.js.

