const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const tags = await prisma.tag.findMany();
  console.log("TAGS IN DATABASE:");
  tags.forEach(t => {
    console.log(`- ID: ${t.id} | Name: ${t.name} | Type: ${t.type}`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
