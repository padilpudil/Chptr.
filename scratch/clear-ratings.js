const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Wiping all rating records from database...");
  const deleteResult = await prisma.workRating.deleteMany({});
  console.log(`Successfully deleted ${deleteResult.count} rating records. Rating system is now empty and ready for a fresh start!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
