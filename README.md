# SPV Platform - Tokenized Investment Fund Platform

A turnkey platform enabling investment managers to easily launch, operate, and wind down single-name and multi-name special purpose vehicles (SPVs) with native tokenization support.

## 🚀 Live Demo

**Demo URL:** [Coming Soon]

## 🏗️ Architecture

- **Backend**: Node.js/Express/TypeScript API server
- **Frontend**: React/TypeScript web application with Vite
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel (Frontend + Backend API)
- **Smart Contracts**: Solidity contracts for tokenization (ERC-1400 style)
- **Blockchain**: Ethereum-compatible networks

## ✨ Features

- **Manager Dashboard**: Create and manage SPVs, invite investors, track fundraising
- **Investor Portal**: Browse SPVs, complete KYC, invest, and track portfolio
- **Admin Panel**: Review and approve KYC, SPVs, and manage platform
- **KYC/AML Integration**: Sumsub integration with mock fallback for testing
- **Document Generation**: Automatic PPM, Operating Agreement, and Subscription Agreement generation
- **Tokenization**: Mock blockchain integration for token creation and distribution
- **Invitation System**: Secure invitation links for investor onboarding

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 14+ (or use a cloud provider)
- Git

### Local Development Setup

1. **Clone the repository**

```bash
git clone https://github.com/tylermalin/tokenizedSVP.git
cd tokenizedSVP
```

2. **Install dependencies**

```bash
# Install root dependencies
npm install

# Install workspace dependencies
npm install --workspaces
```

3. **Set up environment variables**

Create `backend/.env`:

```env
NODE_ENV=development
PORT=4000
FRONTEND_ORIGIN=http://localhost:3001

DATABASE_URL=postgresql://user:password@localhost:5432/spv_platform?schema=public

JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Optional: Sumsub KYC/AML Integration
SUMSUB_APP_TOKEN=
SUMSUB_SECRET_KEY=
SUMSUB_BASE_URL=https://api.sumsub.com

LOG_LEVEL=info
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:4000
VITE_ENV=development
```

4. **Set up the database**

```bash
cd backend

# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Seed initial data (optional)
npm run db:seed
```

5. **Start development servers**

```bash
# From root directory
npm run dev
```

This starts:

- Backend API: http://localhost:4000
- Frontend App: http://localhost:3000

### Default Test Accounts

After running `npm run db:seed`, you can use:

**Admin:**

- Email: `admin@spvplatform.com`
- Password: `admin123`

**Manager:**

- Email: `manager@spvplatform.com`
- Password: `manager123`

**Investor:**

- Email: `investor@spvplatform.com`
- Password: `investor123`

## 📦 Deployment

### Deploy to Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Steps:**

1. Push code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy!

The `vercel.json` file is already configured for optimal deployment.

## 📁 Project Structure

```
spv-platform/
├── backend/              # Express API server
│   ├── prisma/          # Database schema and migrations
│   ├── src/
│   │   ├── controllers/ # Route controllers
│   │   ├── services/    # Business logic
│   │   ├── routes/      # API routes
│   │   ├── middleware/  # Express middleware
│   │   └── schemas/     # Zod validation schemas
│   └── scripts/         # Utility scripts (seed, etc.)
├── frontend/             # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts (Auth, etc.)
│   │   └── services/    # API client
├── contracts/            # Smart contracts (Solidity)
├── docs/                 # Documentation
└── vercel.json          # Vercel deployment config
```

## 🛠️ Development

### Available Scripts

**Root:**

- `npm run dev` - Start both backend and frontend in development mode
- `npm run build` - Build both backend and frontend for production
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with initial data
- `npm run db:studio` - Open Prisma Studio

**Backend:**

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript
- `npm run start` - Start production server
- `npm run db:migrate` - Run migrations
- `npm run db:seed` - Seed database

**Frontend:**

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Database Management

```bash
cd backend

# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio
```

## 🔐 Environment Variables

### Backend Required Variables

| Variable          | Description                  | Example                               |
| ----------------- | ---------------------------- | ------------------------------------- |
| `DATABASE_URL`    | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET`      | Secret for JWT token signing | `your-secret-key`                     |
| `FRONTEND_ORIGIN` | Frontend URL for CORS        | `http://localhost:3001`               |

### Backend Optional Variables

| Variable            | Description                   |
| ------------------- | ----------------------------- |
| `SUMSUB_APP_TOKEN`  | Sumsub API token for KYC      |
| `SUMSUB_SECRET_KEY` | Sumsub secret key             |
| `PORT`              | Server port (default: 4000)   |
| `LOG_LEVEL`         | Logging level (default: info) |

### Frontend Required Variables

| Variable       | Description     | Example                 |
| -------------- | --------------- | ----------------------- |
| `VITE_API_URL` | Backend API URL | `http://localhost:4000` |

## 📚 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Detailed deployment instructions
- [API Documentation](./docs/API.md) - API endpoint documentation
- [Smart Contract Documentation](./docs/CONTRACTS.md) - Contract specifications
- [PRD](./PRD.md) - Product Requirements Document

## 🔒 Security

- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control (Admin, Manager, Investor)
- **KYC/AML**: Sumsub integration with admin review workflow
- **Data Validation**: Zod schema validation on all API endpoints
- **CORS**: Configured for production and development
- **Helmet**: Security headers middleware

## 🧪 Testing

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

[Add your license here]

## 🆘 Support

For issues and questions:

- Open an issue on [GitHub](https://github.com/tylermalin/tokenizedSVP/issues)
- Check the [Documentation](./docs/)
- Review [Deployment Guide](./DEPLOYMENT.md) for deployment issues

## 🗺️ Roadmap

- [ ] Production blockchain integration
- [ ] Advanced reporting and analytics
- [ ] Email notifications
- [ ] Multi-currency support
- [ ] Mobile app
- [ ] Advanced compliance features

---

Built with ❤️ for the investment management community
