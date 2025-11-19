# SPV Platform Smart Contracts

Smart contracts for tokenized SPV interests, implementing ERC-1400-style permissioned security tokens.

## Contracts

- **TokenizedSPV**: Main token contract with transfer restrictions, whitelisting, and lockup periods
- **ComplianceEngine**: KYC/AML compliance checking (simplified on-chain version)

## Development

```bash
# Install dependencies
npm install

# Compile contracts
npm run compile

# Run tests
npm run test

# Deploy to local network
npm run deploy:local
```

## Security

These contracts are for reference and development purposes. Before production deployment:

1. Conduct comprehensive security audits
2. Review compliance requirements for your jurisdiction
3. Implement proper access controls
4. Add comprehensive test coverage
5. Consider using battle-tested libraries like OpenZeppelin

## License

MIT

