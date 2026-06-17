const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const username = args[0];

  if (!username) {
    console.error("ERROR: Please provide a username. Usage: node scratch/create-admin.js <username>");
    process.exit(1);
  }

  try {
    console.log(`Searching for user with username: "${username}"...`);
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      console.error(`ERROR: User "${username}" not found in database.`);
      process.exit(1);
    }

    console.log(`Found user: ${user.username} (Email: ${user.email}, Role: ${user.role})`);
    
    if (user.role === "ADMIN") {
      console.log(`User "${username}" is already an ADMIN.`);
      return;
    }

    console.log(`Elevating "${username}" to ADMIN...`);
    const updatedUser = await prisma.user.update({
      where: { username },
      data: { role: "ADMIN" },
    });

    console.log(`SUCCESS: User "${updatedUser.username}" is now an ADMIN!`);
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
