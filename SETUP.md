# Setup Instructions

This guide will help you set up the SPV Platform for local development and production deployment.

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **PostgreSQL 14+** installed or access to a cloud database
- **Git** installed
- **npm** or **yarn** package manager

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/tylermalin/tokenizedSVP.git
cd tokenizedSVP
```

### Step 2: Install Dependencies

```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm install --workspaces
```

### Step 3: Set Up Environment Variables

#### Backend Environment Variables

Create `backend/.env` file:

```env
# Server Configuration
NODE_ENV=development
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/spv_platform?schema=public

# JWT Secret (Generate a strong random string)
# You can generate one with: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Sumsub KYC/AML Integration (Optional - leave empty for mock mode)
SUMSUB_APP_TOKEN=
SUMSUB_SECRET_KEY=
SUMSUB_BASE_URL=https://api.sumsub.com

# Blockchain Configuration (Optional - for production)
BLOCKCHAIN_RPC_URL=
BLOCKCHAIN_NETWORK=mainnet
WALLET_PRIVATE_KEY=

# Logging
LOG_LEVEL=info
```

#### Frontend Environment Variables

Create `frontend/.env` file:

```env
# API Configuration
VITE_API_URL=http://localhost:4000

# Environment
VITE_ENV=development
```

### Step 4: Set Up PostgreSQL Database

#### Option A: Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a new database:

```bash
createdb spv_platform
# Or using psql:
psql -U postgres
CREATE DATABASE spv_platform;
```

3. Update `DATABASE_URL` in `backend/.env` with your credentials

#### Option B: Cloud Database (Recommended for Production)

Use one of these providers:
- **Supabase** (Free tier available): [supabase.com](https://supabase.com)
- **Vercel Postgres**: Available in Vercel dashboard
- **AWS RDS**: For production workloads
- **DigitalOcean Managed Databases**

### Step 5: Run Database Migrations

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed initial data
npm run db:seed
```

### Step 6: Start Development Servers

From the root directory:

```bash
npm run dev
```

This will start:
- **Backend API**: http://localhost:4000
- **Frontend App**: http://localhost:3000

### Step 7: Verify Installation

1. Open http://localhost:3000 in your browser
2. You should see the landing page
3. Try registering a new account or logging in with seeded credentials

## Default Test Accounts

After running `npm run db:seed`, you can use these accounts:

### Admin Account
- **Email**: `admin@spvplatform.com`
- **Password**: `admin123`
- **Access**: Full admin panel access

### Manager Account
- **Email**: `manager@spvplatform.com`
- **Password**: `manager123`
- **Access**: Manager dashboard, SPV creation

### Investor Account
- **Email**: `investor@spvplatform.com`
- **Password**: `investor123`
- **Access**: Investor dashboard, SPV browsing

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed Vercel deployment instructions.

### Quick Deploy Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables configured
- [ ] Database set up and migrations run
- [ ] Frontend API URL updated
- [ ] CORS configured correctly
- [ ] Test deployment

## Troubleshooting

### Database Connection Issues

**Error**: `Can't reach database server`

**Solutions**:
- Verify PostgreSQL is running: `pg_isready`
- Check `DATABASE_URL` format is correct
- Ensure database exists
- Check firewall settings for cloud databases

### Port Already in Use

**Error**: `Port 4000 is already in use`

**Solutions**:
- Change `PORT` in `backend/.env`
- Kill the process using the port: `lsof -ti:4000 | xargs kill`
- Use a different port

### Prisma Client Errors

**Error**: `PrismaClient is not configured`

**Solutions**:
```bash
cd backend
npx prisma generate
```

### CORS Errors

**Error**: `CORS policy blocked`

**Solutions**:
- Verify `FRONTEND_ORIGIN` matches your frontend URL exactly
- Check `VITE_API_URL` in frontend `.env`
- Ensure no trailing slashes in URLs

### Build Errors

**Error**: Build fails during deployment

**Solutions**:
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs for specific errors
- Ensure environment variables are set

## Next Steps

1. **Customize Configuration**: Update environment variables for your use case
2. **Set Up KYC Provider**: Configure Sumsub credentials if using real KYC
3. **Configure Blockchain**: Set up blockchain RPC and wallet for tokenization
4. **Review Security**: Update JWT_SECRET and review security settings
5. **Set Up Monitoring**: Configure logging and error tracking

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment-specific issues
3. Open an issue on [GitHub](https://github.com/tylermalin/tokenizedSVP/issues)
4. Check application logs for detailed error messages

