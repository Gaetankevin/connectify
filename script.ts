import { prisma } from "./lib/prisma";

async function main() {
  const role = await prisma.role.createMany({
    data: [
      {
        name: "superadmin",
        createdAt: new Date(),
      },
      {
        name: "admin",
        createdAt: new Date(),
      },
      {
        name: "user",
        createdAt: new Date(),
      },
    ],
  });
  console.log("roles creer avec succes", JSON.stringify(role, null, 2));

  const user = await prisma.user.create({
    data: {
      name: "gaetan",
      surname: "kevin",
      username: "gaetankevin1",
      email: "gaetankevin@gmail.com",
      passwordHash: "00000000",
      createdAt: new Date(),
      roleId: 1,
    },
  });
  console.log("user creer avec succes", user);

  const allRoles = await prisma.role.findMany({
    include: {
      users: true,
    },
  });
  console.log("All roles are :", JSON.stringify(allRoles, null, 2));
  const allUsers = await prisma.user.findMany({
    include: {
      role: true,
    },
  });
  console.log("All users are :", JSON.stringify(allUsers, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
