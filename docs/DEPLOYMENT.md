# Deployment Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn
- AWS account (for S3 document storage)
- Ethereum RPC endpoint (Infura, Alchemy, etc.)

## Environment Setup

### Backend

1. Copy `.env.example` to `.env`:
```bash
cd backend
cp .env.example .env
```

2. Configure environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT tokens
- `ETHEREUM_RPC_URL`: Ethereum RPC endpoint
- `PRIVATE_KEY`: Private key for blockchain transactions
- AWS credentials for document storage
- KYC/AML provider credentials

3. Run database migrations:
```bash
npx prisma migrate dev
npx prisma generate
```

### Frontend

1. Copy `.env.example` to `.env`:
```bash
cd frontend
cp .env.example .env
```

2. Set `VITE_API_URL` to your backend URL

## Local Development

```bash
# Install dependencies
npm install
npm install --workspaces

# Start backend
cd backend
npm run dev

# Start frontend (in another terminal)
cd frontend
npm run dev
```

## Production Deployment

### Backend (Node.js/Express)

**Option 1: Vercel/Serverless**
- Deploy as serverless functions
- Configure environment variables in dashboard
- Set up PostgreSQL database (e.g., Supabase, Neon)

**Option 2: Docker**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]
```

**Option 3: Traditional Server**
- Use PM2 for process management
- Set up reverse proxy (nginx)
- Configure SSL certificates

### Frontend (React/Vite)

**Option 1: Vercel**
```bash
npm i -g vercel
vercel
```

**Option 2: Netlify**
- Connect GitHub repository
- Build command: `npm run build`
- Publish directory: `dist`

**Option 3: Static Hosting**
```bash
npm run build
# Upload dist/ folder to S3, Cloudflare Pages, etc.
```

### Database

**Recommended:**
- Supabase (PostgreSQL)
- Neon (Serverless PostgreSQL)
- AWS RDS (PostgreSQL)

### Smart Contracts

1. Deploy to testnet first:
```bash
cd contracts
npm run deploy:testnet
```

2. Verify contracts on Etherscan

3. Deploy to mainnet:
```bash
npm run deploy:mainnet
```

## Security Checklist

- [ ] Change all default secrets
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable database backups
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerts
- [ ] Review and audit smart contracts
- [ ] Set up log aggregation
- [ ] Configure error tracking (Sentry, etc.)

## Monitoring

- Set up health check endpoints
- Configure application monitoring (Datadog, New Relic)
- Set up error tracking
- Monitor blockchain transactions
- Track API usage and performance

