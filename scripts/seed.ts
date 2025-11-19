import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@spvplatform.com' },
    update: {},
    create: {
      email: 'admin@spvplatform.com',
      passwordHash: adminPassword,
      role: 'admin'
    }
  });
  console.log('✓ Admin user created:', admin.email);

  // Create manager user
  const managerPassword = await bcrypt.hash('manager123', 10);
  const manager = await prisma.user.upsert({
    where: { email: 'manager@spvplatform.com' },
    update: {},
    create: {
      email: 'manager@spvplatform.com',
      passwordHash: managerPassword,
      role: 'manager'
    }
  });
  console.log('✓ Manager user created:', manager.email);

  // Create investor user
  const investorPassword = await bcrypt.hash('investor123', 10);
  const investorUser = await prisma.user.upsert({
    where: { email: 'investor@spvplatform.com' },
    update: {},
    create: {
      email: 'investor@spvplatform.com',
      passwordHash: investorPassword,
      role: 'investor'
    }
  });
  console.log('✓ Investor user created:', investorUser.email);

  // Create investor profile
  const investor = await prisma.investor.upsert({
    where: { userId: investorUser.id },
    update: {},
    create: {
      userId: investorUser.id,
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      kycStatus: 'pending',
      amlStatus: 'pending',
      jurisdiction: 'US'
    }
  });
  console.log('✓ Investor profile created');

  // Create sample SPV
  const spv = await prisma.sPV.create({
    data: {
      name: 'Tech Growth SPV',
      type: 'single_name',
      status: 'fundraising',
      managerId: manager.id,
      fundraisingStart: new Date(),
      fundraisingEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      lifespanYears: 5,
      targetAmount: 10000000,
      managementFee: 2.0,
      carryFee: 20.0,
      adminFee: 0.5
    }
  });
  console.log('✓ Sample SPV created:', spv.name);

  // Create another SPV (real estate)
  const realEstateSPV = await prisma.sPV.create({
    data: {
      name: 'Downtown Development Fund',
      type: 'real_estate',
      status: 'fundraising',
      managerId: manager.id,
      fundraisingStart: new Date(),
      fundraisingEnd: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      lifespanYears: 7,
      targetAmount: 5000000,
      managementFee: 1.5,
      carryFee: 15.0,
      capitalStack: JSON.stringify({
        equity: 3000000,
        preferred: 1500000,
        mezzanine: 500000
      })
    }
  });
  console.log('✓ Real estate SPV created:', realEstateSPV.name);

  console.log('\n✅ Seeding completed!');
  console.log('\n📋 Test Accounts:');
  console.log('  Admin:   admin@spvplatform.com / admin123');
  console.log('  Manager: manager@spvplatform.com / manager123');
  console.log('  Investor: investor@spvplatform.com / investor123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

