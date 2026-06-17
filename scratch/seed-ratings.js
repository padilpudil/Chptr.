const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { createHash } = require("crypto");

async function main() {
  console.log("Seeding realistic ratings for all works in database...");

  const works = await prisma.work.findMany({
    select: { id: true, title: true }
  });

  console.log(`Found ${works.length} works to rate.`);

  for (const work of works) {
    // Generate a random number of ratings between 3 and 15
    const ratingCount = 3 + Math.floor(Math.random() * 13);

    for (let r = 0; r < ratingCount; r++) {
      // Mostly 4s and 5s, some 3s to keep it realistic
      const rand = Math.random();
      let value = 5;
      if (rand < 0.1) value = 3;
      else if (rand < 0.45) value = 4;

      // Create a unique mock IP hash for each rating to satisfy the unique constraint
      const mockIp = `192.168.1.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
      const ipHash = createHash("sha256").update(mockIp + work.id + r).digest("hex");

      try {
        await prisma.workRating.create({
          data: {
            workId: work.id,
            value,
            ipHash,
          }
        });
      } catch (err) {
        // Ignore unique constraint collisions if any
      }
    }
  }

  console.log("Successfully seeded ratings for all works!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
