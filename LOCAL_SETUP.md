# Local Development Setup Guide

Complete guide to running the SPV Platform locally.

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **npm** 9+ (comes with Node.js)

### Verify Installation

```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 9.0.0 or higher
psql --version  # Should be 14.0 or higher
```

## Quick Start

### 1. Clone and Install

```bash
# Navigate to project directory
cd spv-platform

# Run setup script (macOS/Linux)
chmod +x scripts/setup.sh
./scripts/setup.sh

# Or manually:
npm install
npm install --workspaces
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb spv_platform

# Or use the init script
chmod +x scripts/init-db.sh
./scripts/init-db.sh
```

### 3. Configure Environment Variables

**Backend** (`backend/.env`):
```env
# Server
NODE_ENV=development
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000

# Database
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/spv_platform?schema=public

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Blockchain (optional for local dev)
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
PRIVATE_KEY=your-private-key-for-deployments

# Sumsub KYC/AML (optional for local dev)
SUMSUB_APP_TOKEN=your-sumsub-app-token
SUMSUB_SECRET_KEY=your-sumsub-secret-key
SUMSUB_BASE_URL=https://api.sumsub.com

# AWS (optional for local dev)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=spv-platform-documents
AWS_REGION=us-east-1

# Email (optional for local dev)
EMAIL_API_KEY=your-email-api-key
EMAIL_FROM=noreply@spvplatform.com
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:4000
VITE_ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
```

### 4. Run Database Migrations

```bash
cd backend
npm run db:migrate
npm run db:generate
```

### 5. Seed Database (Optional)

```bash
cd backend
npm run db:seed
```

This creates test accounts:
- **Admin**: `admin@spvplatform.com` / `admin123`
- **Manager**: `manager@spvplatform.com` / `manager123`
- **Investor**: `investor@spvplatform.com` / `investor123`

### 6. Start Development Servers

**Option 1: Run both together**
```bash
# From project root
npm run dev
```

**Option 2: Run separately**

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### 7. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Health Check**: http://localhost:4000/api/health
- **Prisma Studio** (Database GUI): `cd backend && npm run db:studio`

## Development Workflow

### Backend Development

```bash
cd backend

# Run in development mode (auto-reload)
npm run dev

# Run database migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Open Prisma Studio (database GUI)
npm run db:studio

# Run tests
npm test

# Lint code
npm run lint
```

### Frontend Development

```bash
cd frontend

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Smart Contracts Development

```bash
cd contracts

# Compile contracts
npm run compile

# Run tests
npm test

# Deploy to local network
npm run deploy:local
```

## Common Issues & Solutions

### Database Connection Error

**Error**: `Can't reach database server`

**Solution**:
1. Check PostgreSQL is running:
   ```bash
   # macOS
   brew services list
   brew services start postgresql@14
   
   # Linux
   sudo systemctl status postgresql
   sudo systemctl start postgresql
   ```

2. Verify DATABASE_URL in `backend/.env`
3. Check database exists:
   ```bash
   psql -l | grep spv_platform
   ```

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::4000`

**Solution**:
```bash
# Find process using port
lsof -ti:4000

# Kill process
kill -9 $(lsof -ti:4000)

# Or change port in backend/.env
PORT=4001
```

### Prisma Migration Issues

**Error**: `Migration failed`

**Solution**:
```bash
cd backend

# Reset database (WARNING: deletes all data)
npm run db:reset

# Or manually fix migration
npx prisma migrate dev
```

### Module Not Found Errors

**Error**: `Cannot find module`

**Solution**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# For workspaces
npm install --workspaces
```

### Frontend Can't Connect to Backend

**Error**: `Network Error` or `CORS Error`

**Solution**:
1. Verify backend is running on port 4000
2. Check `VITE_API_URL` in `frontend/.env`
3. Verify CORS settings in `backend/src/server.ts`
4. Check `FRONTEND_ORIGIN` in `backend/.env`

## Database Management

### Reset Database

```bash
cd backend
npm run db:reset
npm run db:seed
```

### View Database Schema

```bash
cd backend
npm run db:studio
```

### Manual Database Access

```bash
psql spv_platform

# List tables
\dt

# View users
SELECT * FROM "User";

# Exit
\q
```

## Testing

### Backend Tests

```bash
cd backend
npm test
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Smart Contract Tests

```bash
cd contracts
npm test
```

## Project Structure

```
spv-platform/
├── backend/          # Express API server
│   ├── src/
│   ├── prisma/
│   └── scripts/
├── frontend/         # React application
│   └── src/
├── contracts/         # Smart contracts
│   └── contracts/
├── scripts/          # Setup scripts
└── docs/            # Documentation
```

## Environment Variables Reference

### Required for Local Development

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT tokens
- `FRONTEND_ORIGIN` - CORS origin (usually http://localhost:3000)

### Optional (for full functionality)

- `SUMSUB_APP_TOKEN` - KYC/AML provider
- `SUMSUB_SECRET_KEY` - KYC/AML provider
- `ETHEREUM_RPC_URL` - Blockchain RPC endpoint
- `PRIVATE_KEY` - For contract deployments
- AWS credentials - For document storage
- Email API key - For notifications

## Troubleshooting

### Check Logs

Backend logs are in `backend/logs/`:
- `combined.log` - All logs
- `error.log` - Error logs only

### Verify Services

```bash
# Check Node.js
node --version

# Check PostgreSQL
psql --version
psql -l

# Check ports
lsof -i :3000
lsof -i :4000
```

### Reset Everything

```bash
# Stop all processes
pkill -f "node.*dev"

# Reset database
cd backend
npm run db:reset

# Reinstall dependencies
cd ..
rm -rf node_modules backend/node_modules frontend/node_modules contracts/node_modules
npm install
npm install --workspaces

# Restart
npm run dev
```

## Next Steps

1. ✅ Set up local environment
2. ✅ Run database migrations
3. ✅ Seed test data
4. ✅ Start development servers
5. 🔄 Implement features
6. 🧪 Write tests
7. 🚀 Deploy to staging

## Getting Help

- Check `docs/` directory for detailed documentation
- Review API docs: `docs/API.md`
- Check logs: `backend/logs/`
- Prisma Studio: `cd backend && npm run db:studio`

## Useful Commands

```bash
# Start everything
npm run dev

# Database
cd backend && npm run db:migrate
cd backend && npm run db:studio
cd backend && npm run db:seed

# Backend only
cd backend && npm run dev

# Frontend only
cd frontend && npm run dev

# Contracts
cd contracts && npm run compile
```

Happy coding! 🚀

