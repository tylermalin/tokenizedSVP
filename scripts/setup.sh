#!/bin/bash

# SPV Platform Local Setup Script
set -e

echo "🚀 Setting up SPV Platform for local development..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js $(node -v) detected"

# Check if PostgreSQL is running
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} PostgreSQL not found. Please install PostgreSQL 14+"
    echo "   macOS: brew install postgresql@14"
    echo "   Ubuntu: sudo apt-get install postgresql-14"
    exit 1
fi

echo -e "${GREEN}✓${NC} PostgreSQL detected"

# Install root dependencies
echo -e "\n${BLUE}Installing root dependencies...${NC}"
npm install

# Install workspace dependencies
echo -e "\n${BLUE}Installing backend dependencies...${NC}"
cd backend
npm install

# Install frontend dependencies
echo -e "\n${BLUE}Installing frontend dependencies...${NC}"
cd ../frontend
npm install

# Install contract dependencies
echo -e "\n${BLUE}Installing contract dependencies...${NC}"
cd ../contracts
npm install

cd ..

# Create .env files if they don't exist
echo -e "\n${BLUE}Setting up environment files...${NC}"

if [ ! -f backend/.env ]; then
    if [ -f backend/.env.example ]; then
        echo "Creating backend/.env from .env.example..."
        cp backend/.env.example backend/.env
    else
        echo "Creating backend/.env template..."
        cat > backend/.env << 'EOF'
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
EOF
    fi
    echo -e "${YELLOW}⚠${NC} Please edit backend/.env with your configuration"
else
    echo -e "${GREEN}✓${NC} backend/.env already exists"
fi

if [ ! -f frontend/.env ]; then
    if [ -f frontend/.env.example ]; then
        echo "Creating frontend/.env from .env.example..."
        cp frontend/.env.example frontend/.env
    else
        echo "Creating frontend/.env template..."
        cat > frontend/.env << 'EOF'
VITE_API_URL=http://localhost:4000
VITE_ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/YOUR_PROJECT_ID
EOF
    fi
    echo -e "${GREEN}✓${NC} frontend/.env created"
else
    echo -e "${GREEN}✓${NC} frontend/.env already exists"
fi

# Create logs directory
mkdir -p backend/logs
echo -e "${GREEN}✓${NC} Logs directory created"

echo -e "\n${GREEN}✅ Setup complete!${NC}"
echo -e "\n${BLUE}Next steps:${NC}"
echo "1. Set up PostgreSQL database:"
echo "   createdb spv_platform"
echo ""
echo "2. Update backend/.env with your database URL:"
echo "   DATABASE_URL=postgresql://user:password@localhost:5432/spv_platform?schema=public"
echo ""
echo "3. Run database migrations:"
echo "   cd backend && npm run db:migrate"
echo ""
echo "4. Start development servers:"
echo "   npm run dev"
echo ""
echo "   Or start separately:"
echo "   Backend:  cd backend && npm run dev"
echo "   Frontend: cd frontend && npm run dev"

