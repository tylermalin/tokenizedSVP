# Deployment Guide

This guide covers deploying the SPV Platform to Vercel and setting up the production environment.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Vercel Deployment](#vercel-deployment)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Post-Deployment Steps](#post-deployment-steps)
- [Troubleshooting](#troubleshooting)

## Prerequisites

1. **GitHub Account** - Your code should be pushed to GitHub
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **PostgreSQL Database** - Use Vercel Postgres, Supabase, or any PostgreSQL provider
4. **Node.js 18+** - For local development and build processes

## Vercel Deployment

### Step 1: Push to GitHub

```bash
# Initialize git if not already done
git init

# Add remote repository
git remote add origin https://github.com/tylermalin/tokenizedSVP.git

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Push to GitHub
git push -u origin main
```

### Step 2: Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository: `tylermalin/tokenizedSVP`
4. Vercel will auto-detect the project structure

### Step 3: Configure Build Settings

**Root Directory:** Leave as root (`.`)

**Build Command:**
```bash
npm run build
```

**Output Directory:**
```
frontend/dist
```

**Install Command:**
```bash
npm install
```

### Step 4: Set Environment Variables

In Vercel project settings, add the following environment variables:

#### Backend Environment Variables

```
NODE_ENV=production
PORT=4000
FRONTEND_ORIGIN=https://your-app.vercel.app

DATABASE_URL=postgresql://user:password@host:5432/database?schema=public

JWT_SECRET=your-super-secret-jwt-key-min-32-characters

SUMSUB_APP_TOKEN=your-sumsub-token
SUMSUB_SECRET_KEY=your-sumsub-secret
SUMSUB_BASE_URL=https://api.sumsub.com

LOG_LEVEL=info
```

#### Frontend Environment Variables

```
VITE_API_URL=https://your-app.vercel.app/api
VITE_ENV=production
```

**Important:** Replace `https://your-app.vercel.app` with your actual Vercel deployment URL after the first deployment.

### Step 5: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete
3. Note your deployment URL

### Step 6: Update Frontend API URL

After the first deployment:

1. Go to **Project Settings** → **Environment Variables**
2. Update `VITE_API_URL` to match your deployment URL
3. Update `FRONTEND_ORIGIN` in backend variables
4. Redeploy the project

## Database Setup

### Option 1: Vercel Postgres (Recommended)

1. In your Vercel project dashboard, go to **Storage** tab
2. Click **"Create Database"** → Select **Postgres**
3. Copy the `DATABASE_URL` connection string
4. Add it to your environment variables

### Option 2: Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **Settings** → **Database**
4. Copy the connection string
5. Add to Vercel environment variables as `DATABASE_URL`

### Option 3: External PostgreSQL

Use any PostgreSQL provider (AWS RDS, DigitalOcean, etc.) and add the connection string to environment variables.

### Run Migrations

After setting up the database, run Prisma migrations:

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Run migrations
cd backend
npx prisma migrate deploy
```

**Option B: Using Vercel Build Command**

Add to your `package.json`:

```json
{
  "scripts": {
    "postinstall": "cd backend && npx prisma generate",
    "build": "cd backend && npm run build && cd ../frontend && npm run build",
    "migrate": "cd backend && npx prisma migrate deploy"
  }
}
```

Then add a build hook or use Vercel's database migrations feature.

## Environment Variables Reference

### Backend (.env)

```env
# Server Configuration
NODE_ENV=production
PORT=4000
FRONTEND_ORIGIN=https://your-app.vercel.app

# Database
DATABASE_URL=postgresql://user:password@host:5432/database?schema=public

# JWT Secret (Generate: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Sumsub KYC/AML Integration (Optional)
SUMSUB_APP_TOKEN=
SUMSUB_SECRET_KEY=
SUMSUB_BASE_URL=https://api.sumsub.com

# Blockchain Configuration (Optional)
BLOCKCHAIN_RPC_URL=
BLOCKCHAIN_NETWORK=mainnet
WALLET_PRIVATE_KEY=

# Logging
LOG_LEVEL=info
```

### Frontend (.env)

```env
# API Configuration
VITE_API_URL=https://your-app.vercel.app/api

# Environment
VITE_ENV=production
```

## Post-Deployment Steps

### 1. Seed Initial Data

Create an admin user and seed initial data:

```bash
# Connect to your database
cd backend
npx prisma studio

# Or use the seed script
npm run db:seed
```

### 2. Verify Deployment

1. Visit your Vercel deployment URL
2. Test user registration
3. Test login functionality
4. Verify API endpoints are accessible

### 3. Set Up Custom Domain (Optional)

1. Go to **Project Settings** → **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update `FRONTEND_ORIGIN` environment variable

### 4. Enable HTTPS

Vercel automatically provides HTTPS certificates. Ensure all API calls use HTTPS.

## Troubleshooting

### Build Fails

**Issue:** Build command fails
**Solution:**
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check build logs in Vercel dashboard

### Database Connection Errors

**Issue:** `Can't reach database server`
**Solution:**
- Verify `DATABASE_URL` is correct
- Check database firewall settings
- Ensure database allows connections from Vercel IPs

### CORS Errors

**Issue:** Frontend can't connect to backend
**Solution:**
- Verify `FRONTEND_ORIGIN` matches your frontend URL exactly
- Check `VITE_API_URL` in frontend environment variables
- Ensure CORS middleware is configured correctly

### Prisma Client Errors

**Issue:** `PrismaClient is not configured`
**Solution:**
- Add `prisma generate` to build command
- Ensure `DATABASE_URL` is set correctly
- Check Prisma schema is valid

### Environment Variables Not Working

**Issue:** Variables not accessible
**Solution:**
- Restart deployment after adding variables
- Verify variable names match exactly (case-sensitive)
- Check variable scopes (Production, Preview, Development)

## Production Checklist

- [ ] Database migrations run successfully
- [ ] Environment variables configured
- [ ] JWT_SECRET is strong and unique
- [ ] Database backups enabled
- [ ] CORS configured correctly
- [ ] HTTPS enabled
- [ ] Error logging configured
- [ ] Admin user created
- [ ] Test user registration/login
- [ ] API endpoints tested
- [ ] Frontend builds successfully
- [ ] Custom domain configured (if applicable)

## Monitoring

### Vercel Analytics

Enable Vercel Analytics in project settings for:
- Performance monitoring
- Error tracking
- User analytics

### Logs

View logs in Vercel dashboard:
- **Deployments** → Select deployment → **Logs**
- Real-time function logs
- Build logs

## Support

For issues specific to:
- **Vercel:** [Vercel Documentation](https://vercel.com/docs)
- **Prisma:** [Prisma Documentation](https://www.prisma.io/docs)
- **Project Issues:** Open an issue on GitHub

