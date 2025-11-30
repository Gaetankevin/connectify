import { prisma } from "../lib/prisma";

async function main() {
  console.log("🌱 Starting seed...");

  // Create or upsert the three roles
  const roles = [
    { name: "superadmin" },
    { name: "admin" },
    { name: "user" },
  ];

  for (const role of roles) {
    const createdRole = await prisma.role.upsert({
      where: { name: role.name },
      update: {}, // don't update if exists
      create: {
        name: role.name,
        createdAt: new Date(),
      },
    });
    console.log(`✓ Role "${createdRole.name}" created or already exists (ID: ${createdRole.id})`);
  }

  console.log("🌱 Seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
