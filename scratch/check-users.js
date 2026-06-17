const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("USERS IN DATABASE:");
  users.forEach(u => {
    console.log(`- ID: ${u.id} | Username: ${u.username} | Email: ${u.email} | Role: ${u.role}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
