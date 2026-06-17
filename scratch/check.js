const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const works = await prisma.work.findMany({
    select: { id: true, title: true }
  });
  console.log("WORKS IN DB:", works);
}
main().catch(console.error).finally(() => prisma.$disconnect());
