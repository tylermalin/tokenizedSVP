import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@spvplatform.com" },
    update: {},
    create: {
      email: "admin@spvplatform.com",
      passwordHash: adminPassword,
      role: "admin",
      accountStatus: "approved",
    },
  });
  console.log("✓ Admin user created:", admin.email);

  // Create manager user
  const managerPassword = await bcrypt.hash("manager123", 10);
  const manager = await prisma.user.upsert({
    where: { email: "manager@spvplatform.com" },
    update: {},
    create: {
      email: "manager@spvplatform.com",
      passwordHash: managerPassword,
      role: "manager",
      accountStatus: "approved",
    },
  });
  console.log("✓ Manager user created:", manager.email);

  // Create investor user
  const investorPassword = await bcrypt.hash("investor123", 10);
  const investorUser = await prisma.user.upsert({
    where: { email: "investor@spvplatform.com" },
    update: {},
    create: {
      email: "investor@spvplatform.com",
      passwordHash: investorPassword,
      role: "investor",
      accountStatus: "approved",
    },
  });
  console.log("✓ Investor user created:", investorUser.email);

  // Create investor profile
  const investor = await prisma.investor.upsert({
    where: { userId: investorUser.id },
    update: {},
    create: {
      userId: investorUser.id,
      walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      kycStatus: "pending",
      amlStatus: "pending",
      jurisdiction: "US",
    },
  });
  console.log("✓ Investor profile created");

  // Create Manager profile if it doesn't exist
  const managerProfile = await prisma.manager.upsert({
    where: { userId: manager.id },
    update: {},
    create: {
      userId: manager.id,
      kycStatus: "verified",
      amlStatus: "cleared",
      adminKycStatus: "approved",
      jurisdiction: "US",
      companyName: "Tech Ventures Management LLC",
      companyAddress: "123 Innovation Drive, San Francisco, CA 94105",
      taxId: "12-3456789",
    },
  });
  console.log("✓ Manager profile created");

  // Create SPV 1: Tech Growth SPV (single_name) - Approved and Fundraising
  const techGrowthSPV = await prisma.sPV.create({
    data: {
      name: "Tech Growth SPV",
      type: "single_name",
      status: "fundraising",
      adminStatus: "approved",
      managerId: manager.id,
      fundraisingStart: new Date(),
      fundraisingEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      lifespanYears: 5,
      targetAmount: 10000000,
      managementFee: 2.0,
      carryFee: 20.0,
      adminFee: 0.5,
      reviewedBy: admin.id,
      reviewedAt: new Date(),
    },
  });
  console.log("✓ Tech Growth SPV created:", techGrowthSPV.name);

  // Create SPV 2: Downtown Development Fund (real_estate) - Approved and Fundraising
  const realEstateSPV = await prisma.sPV.create({
    data: {
      name: "Downtown Development Fund",
      type: "real_estate",
      status: "fundraising",
      adminStatus: "approved",
      managerId: manager.id,
      fundraisingStart: new Date(),
      fundraisingEnd: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      lifespanYears: 7,
      targetAmount: 5000000,
      managementFee: 1.5,
      carryFee: 15.0,
      adminFee: 0.25,
      capitalStack: JSON.stringify({
        equity: 3000000,
        preferred: 1500000,
        mezzanine: 500000,
      }),
      reviewedBy: admin.id,
      reviewedAt: new Date(),
    },
  });
  console.log("✓ Downtown Development Fund created:", realEstateSPV.name);

  // Create SPV 3: Venture Capital Multi-Name SPV - Pending Admin Approval
  const vcMultiNameSPV = await prisma.sPV.create({
    data: {
      name: "Venture Capital Multi-Name SPV",
      type: "multi_name",
      status: "configuring",
      adminStatus: "pending",
      managerId: manager.id,
      fundraisingStart: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      fundraisingEnd: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000), // 120 days from start
      lifespanYears: 10,
      targetAmount: 15000000,
      managementFee: 2.5,
      carryFee: 25.0,
      adminFee: 0.75,
    },
  });
  console.log("✓ Venture Capital Multi-Name SPV created:", vcMultiNameSPV.name);

  console.log("\n✅ Seeding completed!");
  console.log("\n📋 Test Accounts:");
  console.log("  Admin:   admin@spvplatform.com / admin123");
  console.log("  Manager: manager@spvplatform.com / manager123");
  console.log("  Investor: investor@spvplatform.com / investor123");
  console.log("\n📊 SPVs Created:");
  console.log("  1. Tech Growth SPV - $10M target, fundraising (approved)");
  console.log(
    "  2. Downtown Development Fund - $5M target, fundraising (approved)"
  );
  console.log(
    "  3. Venture Capital Multi-Name SPV - $15M target, configuring (pending approval)"
  );
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
