#!/bin/bash

# Start Development Servers Script

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting SPV Platform Development Servers...${NC}\n"

# Check if .env files exist
if [ ! -f backend/.env ]; then
    echo -e "${YELLOW}⚠${NC} backend/.env not found. Please run setup first."
    exit 1
fi

if [ ! -f frontend/.env ]; then
    echo -e "${YELLOW}⚠${NC} frontend/.env not found. Please run setup first."
    exit 1
fi

# Check if database is accessible
cd backend
if ! npx prisma db push --accept-data-loss --skip-generate > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠${NC} Database connection issue. Please check DATABASE_URL in backend/.env"
    cd ..
    exit 1
fi
cd ..

echo -e "${GREEN}✓${NC} Environment configured"
echo -e "${GREEN}✓${NC} Database accessible\n"

# Start servers using concurrently
echo -e "${BLUE}Starting backend and frontend...${NC}\n"

npm run dev

