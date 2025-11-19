# 🚀 Quick Start - Local Development

Get the SPV Platform running locally in 5 minutes!

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm 9+

## Setup Steps

### 1. Install Dependencies

```bash
npm install
npm install --workspaces
```

### 2. Create Database

```bash
createdb spv_platform
```

### 3. Configure Environment

Copy and edit environment files:

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your DATABASE_URL

# Frontend  
cp frontend/.env.example frontend/.env
```

**Minimum `backend/.env` required:**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/spv_platform?schema=public
JWT_SECRET=your-secret-key-here
FRONTEND_ORIGIN=http://localhost:3000
```

### 4. Run Migrations

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

Creates test accounts:
- Admin: `admin@spvplatform.com` / `admin123`
- Manager: `manager@spvplatform.com` / `manager123`
- Investor: `investor@spvplatform.com` / `investor123`

### 6. Start Development

```bash
# From project root - starts both backend and frontend
npm run dev
```

Or separately:
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd frontend && npm run dev
```

### 7. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **Health Check**: http://localhost:4000/api/health
- **Prisma Studio**: `cd backend && npm run db:studio`

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
brew services list  # macOS
# or
sudo systemctl status postgresql  # Linux

# Start PostgreSQL
brew services start postgresql@14  # macOS
# or
sudo systemctl start postgresql  # Linux
```

### Port Already in Use

```bash
# Kill process on port 4000
kill -9 $(lsof -ti:4000)

# Or change port in backend/.env
PORT=4001
```

### Reset Everything

```bash
# Reset database
cd backend && npm run db:reset && npm run db:seed

# Reinstall dependencies
rm -rf node_modules backend/node_modules frontend/node_modules
npm install && npm install --workspaces
```

## Useful Commands

```bash
# Database
npm run db:migrate    # Run migrations
npm run db:seed       # Seed test data
npm run db:studio     # Open Prisma Studio

# Development
npm run dev           # Start both servers
npm run dev:backend   # Backend only
npm run dev:frontend   # Frontend only

# Testing
npm test              # Run all tests
npm run lint          # Lint code
```

## Next Steps

- Read [LOCAL_SETUP.md](./LOCAL_SETUP.md) for detailed setup
- Check [docs/](./docs/) for API documentation
- Review [PRD.md](./PRD.md) for product requirements

Happy coding! 🎉

