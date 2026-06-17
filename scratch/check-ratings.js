const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.workRating.count();
  console.log("TOTAL RATINGS IN DB:", count);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
