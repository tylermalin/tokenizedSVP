#!/bin/bash

# Database Initialization Script
set -e

echo "🗄️  Initializing SPV Platform Database..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    if [ -f backend/.env ]; then
        export $(cat backend/.env | grep DATABASE_URL | xargs)
    fi
    
    if [ -z "$DATABASE_URL" ]; then
        echo -e "${RED}❌ DATABASE_URL not set${NC}"
        echo "Please set DATABASE_URL in backend/.env or as environment variable"
        exit 1
    fi
fi

echo -e "${GREEN}✓${NC} Database URL configured"

# Extract database name from URL
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

if [ -z "$DB_NAME" ]; then
    echo -e "${RED}❌ Could not extract database name from DATABASE_URL${NC}"
    exit 1
fi

echo -e "${BLUE}Database: ${DB_NAME}${NC}"

# Check if database exists
if psql -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo -e "${YELLOW}⚠${NC} Database '$DB_NAME' already exists"
    read -p "Do you want to drop and recreate it? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Dropping database..."
        dropdb "$DB_NAME" || true
        echo "Creating database..."
        createdb "$DB_NAME"
        echo -e "${GREEN}✓${NC} Database recreated"
    else
        echo "Using existing database..."
    fi
else
    echo "Creating database..."
    createdb "$DB_NAME" || {
        echo -e "${RED}❌ Failed to create database${NC}"
        echo "Make sure PostgreSQL is running and you have permissions"
        exit 1
    }
    echo -e "${GREEN}✓${NC} Database created"
fi

# Run migrations
echo -e "\n${BLUE}Running database migrations...${NC}"
cd backend
npx prisma migrate dev --name init

# Generate Prisma client
echo -e "\n${BLUE}Generating Prisma client...${NC}"
npx prisma generate

echo -e "\n${GREEN}✅ Database initialized successfully!${NC}"

