const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const AUTHOR_ID = "cmqetgwxb000012oe3gd8xqa4"; // padiladmin ID

// Pools of literary words/sentences to generate unique titles, summaries, and contents
const PREFIXES = [
  "The Legacy of", "Shadows of", "Echoes from", "The Secret of", "Chronicles of",
  "The Lost", "Whispers of", "The Last", "Return to", "Tears of",
  "The Song of", "Shattered", "Beyond the", "The Curse of", "Journey to",
  "Kingdom of", "The Hidden", "Prophecy of", "Gates of", "Heart of",
  "Path of", "Fires of", "The Legend of", "Breeze of", "Sentinel of",
  "Realm of", "The Watcher of", "Bonds of", "Emperor of", "The Silent"
];

const NAMES = [
  "Eldoria", "Blackwood", "Aurelia", "Oakhaven", "Veridia", "Thornfield",
  "Silvermoon", "Ironclad", "Aethelgard", "Stormhaven", "Winterfell", "Valoria",
  "Deepwood", "Ravenloft", "Ashenvale", "Novasgard", "Cinderfell", "Mistwood",
  "Highcliff", "Stonehaven", "Crestwood", "Goldvale", "Ironhold", "Shieldbrook",
  "Windshear", "Sunspear", "Bravos", "Oldtown", "Gulltown", "Duskendale"
];

const SUFFIXES = [
  "the Forgotten", "the Star-Kings", "the Red Signal", "Destiny", "the Eclipse",
  "the Void", "the Hearth-Fire", "the Wind", "the Empire", "the Sage",
  "the Ancient Oak", "the Moon", "the Crown", "the Abyss", "the Phoenix",
  "the Loom", "the Horizon", "the Ocean", "the Mountain", "the Oracle",
  "the Fallen Star", "the Rising Tide", "the Last Dawn", "the Twilight", "the Golden Age",
  "the Iron Fist", "the Deep Sea", "the Hollow King", "the Broken Sword", "the Sacred Rune"
];

const SETTINGS = [
  "a decaying cathedral on the edge of the world",
  "a bustling celestial city orbiting a dying star",
  "a secluded valley hidden beneath a canopy of golden leaves",
  "an underground labyrinth where time flows backward",
  "a windswept harbor town haunted by ancient shipwrecks",
  "a high-altitude fortress carved from solid mountain ice",
  "a forgotten archive deep beneath the city library",
  "a floating island suspended in a sea of violet clouds"
];

const PROTAGONISTS = [
  "disillusioned scholar who lost his memories",
  "young blacksmith who inherited a sword that burns with white fire",
  "street-smart thief searching for a legendary key",
  "exiled princess hiding in plain sight as a tavern maid",
  "weary cartographer mapping a territory that changes every night",
  "silent archivist who can hear the whispers of old books",
  "master weaver who discovered a thread that does not belong to the world",
  "disgraced knight seeking redemption in the borderlands"
];

const MYSTERIES = [
  "a silver cylinder containing the memories of a fallen emperor",
  "a copper coin that never falls on the same side twice",
  "a glowing parchment containing maps of stars that do not exist",
  "a silent clockwork mechanical bird that hums with ancient energy",
  "a series of red signal fires lit along the deserted cliffs",
  "a velvet black thread that absorbs all light around it",
  "a stone tablet written in a language older than the mountains",
  "a mysterious letter delivered by a bird made of pure mist"
];

const CONSEQUENCES = [
  "awaken a dormant magic capable of vaporizing entire cities",
  "shatter the fragile peace treaty between warring kingdoms",
  "unlock the gate to a realm of ash and eternal night",
  "reveal a treasonous plot at the heart of the royal court",
  "unravel the physical tapestry of fate itself",
  "summon a celestial leviathan that lives within the deep ocean",
  "change the flow of time across the entire continent",
  "disrupt the magical beacons guiding ships through the mist"
];

const ANTAGONISTS = [
  "the shadow syndicate known as the Obsidian Hand",
  "the Ash King, an ancient warlord entombed beneath the bedrock",
  "a corrupt grand inquisitor obsessed with absolute control",
  "a silent, phantom entity that stalks the coastal fog",
  "the Guild Council, who seek to preserve the tapestry of fate at any cost",
  "a mechanical colossus awakened from its centuries-long sleep",
  "a rogue celestial navigator who seeks to burn the stars",
  "a ruthless mercenary leader heading the vanguard of war"
];

const DEADLINES = [
  "the arrival of the next solar eclipse",
  "the tolling of the midnight bell at winter solstice",
  "the dense evening fog completely swallows the valley",
  "the crystal spires of the capital city begin to fracture",
  "the stars align to form the shape of the dragon's eye",
  "the iron gates of the underworld swing open",
  "the last petal of the golden lotus drops into the basin",
  "the military vanguard crosses the river border"
];

const COVER_IMAGES = [
  "https://images.unsplash.com/photo-1474932430478-367db26836c1?auto=format&fit=crop&q=80&w=800", // open book
  "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&w=600&q=80", // classic book
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80", // library stack
  "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=800", // reading
  "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&q=80&w=800", // study desk
  "https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&q=80&w=800", // stack of books
  "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=800&q=80", // medieval castle
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800"  // starry sky
];

const LITERARY_SENTENCES = [
  "The wind howled through the narrow corridors of the fortress, bringing with it the scent of ash and winter snow.",
  "He stared at the ancient runes, feeling a strange warmth radiating from the cold stone.",
  "In the quiet corners of the library, the only sound was the rhythmic ticking of the grandfather clock.",
  "She moved through the shadows with the grace of a panther, her hand resting lightly on the hilt of her blade.",
  "The light of the dying sun painted the clouds in shades of bruised purple and brilliant copper.",
  "A single tear traced a path down her dust-covered cheek as she turned her back on her home forever.",
  "The mechanical gears clicked into place, and the heavy iron door slowly began to swing open.",
  "He knew that the path ahead was fraught with danger, yet he took his first step into the darkness without hesitation.",
  "The ocean waves crashed against the black rocks, spraying cold salt water onto his face.",
  "Within the amber glow of the oil lamp, the words on the parchment seemed to dance and shift.",
  "The forest was alive with whispers, the rustling of leaves sounding like voices from a forgotten age.",
  "A low, vibrating hum resonated through the bedrock, shaking the loose pebbles on the cavern floor.",
  "She closed her eyes, trying to remember the sound of her mother's voice, but only static remained.",
  "The crimson banners of the empire fluttered in the autumn breeze, a stark reminder of the conquest.",
  "He held the copper coin tightly in his palm, praying that this time, it would land in his favor.",
  "A thick, suffocating silence settled over the docks as the midnight bell began to toll.",
  "The crystals on the wall flared to life, illuminating the chamber in a pale, iridescent blue light.",
  "He had spent decades searching for the archives, and now that he was here, he felt only a profound hollowness.",
  "The heat of the forge was intense, casting a warm orange glow over the blacksmith's determined face.",
  "She watched the smoke curl upward from the chimney, wondering if anyone was left to keep the fire burning.",
  "The stars above were cold and distant, completely indifferent to the struggles of the mortals below.",
  "A single, crimson leaf fell from the branches, landing softly in the center of the stone basin.",
  "He pulled his leather cloak tighter around his shoulders, shivering as the damp fog rolled in from the shore.",
  "The ink had faded over the centuries, but the warning written in the margins was still clear: do not enter.",
  "She struck the keys of the old piano, the discordant note echoing through the empty, dusty parlor.",
  "The shadow under the archway seemed to deepen, expanding until it swallowed the nearby streetlamp's glow.",
  "He reached into his pack, his fingers closing around the cold metal of the key he had stolen.",
  "The mountain spires rose like jagged teeth against the grey sky, blocking out the light of the sun.",
  "Within her chest, a strange heartbeat began to thrum, synchronized with the pulsing of the star core.",
  "They spoke in hushed tones, their eyes darting to the heavy wooden door at every sudden sound."
];

// Helper to generate a random item from a list
function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to generate a unique title
function generateTitle(index) {
  const prefix = getRandomItem(PREFIXES);
  const name = getRandomItem(NAMES);
  const suffix = getRandomItem(SUFFIXES);
  return `${prefix} ${name}: ${suffix} (Vol. ${index})`;
}

// Helper to generate a unique summary
function generateSummary() {
  const setting = getRandomItem(SETTINGS);
  const protagonist = getRandomItem(PROTAGONISTS);
  const mystery = getRandomItem(MYSTERIES);
  const consequence = getRandomItem(CONSEQUENCES);
  const antagonist = getRandomItem(ANTAGONISTS);
  const deadline = getRandomItem(DEADLINES);

  return `In ${setting}, a ${protagonist} discovers ${mystery} that could ${consequence}. Pursued by ${antagonist}, they must race against time before ${deadline}.`;
}

// Helper to generate 1000+ words of realistic chapter text
function generateChapterContent(chapterNum, title) {
  let content = `<h3>${title}</h3>`;
  content += `<p>The journey had begun under a sky the color of wet slate, with the promise of rain heavy on the wind. Chapter ${chapterNum} marks a significant turning point in the unfolding saga, as the threads of destiny begin to tighten around the characters.</p>`;

  // Generate 8-12 paragraphs to easily reach 1000+ words
  const paragraphCount = 9 + Math.floor(Math.random() * 4); 
  for (let p = 0; p < paragraphCount; p++) {
    let paragraph = "<p>";
    // Select 6-9 random sentences per paragraph
    const sentenceCount = 6 + Math.floor(Math.random() * 4);
    for (let s = 0; s < sentenceCount; s++) {
      paragraph += getRandomItem(LITERARY_SENTENCES) + " ";
    }
    paragraph += "</p>";
    content += paragraph;
  }

  content += `<p>As the hour grew late, the realization of what lay ahead settled heavily on the group. With only the flickering light of the campfire to guide them, they looked out into the uncharted wilderness, knowing that tomorrow would test every ounce of their resolve.</p>`;
  return content;
}

async function main() {
  console.log("Starting Seeding of 150 Large Novels for padiladmin...");

  // 1. Fix "The Chronicles of Eldoria" image url first
  console.log("Updating 'The Chronicles of Eldoria' cover image...");
  const eldoria = await prisma.work.findFirst({
    where: { title: "The Chronicles of Eldoria: Echoes of the Past" }
  });

  if (eldoria) {
    await prisma.work.update({
      where: { id: eldoria.id },
      data: {
        coverUrl: "https://images.unsplash.com/photo-1474932430478-367db26836c1?auto=format&fit=crop&q=80&w=800"
      }
    });
    console.log("Successfully updated Eldoria cover image!");
  } else {
    console.log("Eldoria novel not found, skipping cover fix.");
  }

  // 2. Get tag IDs
  const tags = await prisma.tag.findMany();
  const tagIds = tags.map(t => t.id);

  if (tagIds.length === 0) {
    console.error("ERROR: No tags found in the database. Run seed-novels.js first!");
    process.exit(1);
  }

  // 3. Create 150 novels in batches of 10 to manage database load smoothly
  const TOTAL_NOVELS = 150;
  const BATCH_SIZE = 10;

  for (let i = 1; i <= TOTAL_NOVELS; i += BATCH_SIZE) {
    const batchPromises = [];
    const limit = Math.min(i + BATCH_SIZE - 1, TOTAL_NOVELS);
    
    console.log(`Processing batch: Novels ${i} to ${limit}...`);

    for (let j = i; j <= limit; j++) {
      const title = generateTitle(j);
      const summary = generateSummary();
      const rating = getRandomItem(["GENERAL", "TEEN", "MATURE"]);
      const status = getRandomItem(["IN_PROGRESS", "COMPLETED"]);
      const coverUrl = getRandomItem(COVER_IMAGES);

      // Create chapters data beforehand to calculate word count
      const chapterData = [];
      let totalWordCount = 0;

      for (let c = 1; c <= 3; c++) {
        const chapTitle = `Chapter ${c}: The ${getRandomItem(NAMES)} ${getRandomItem(SUFFIXES).replace("the ", "")}`;
        const content = generateChapterContent(c, chapTitle);
        // Calculate words
        const wordCount = content.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
        
        chapterData.push({
          title: chapTitle,
          content: content,
          number: c,
          wordCount: wordCount
        });
        totalWordCount += wordCount;
      }

      // Add task to create Work and Chapters
      const promise = (async () => {
        // Create Work
        const work = await prisma.work.create({
          data: {
            title: title,
            summary: summary,
            authorId: AUTHOR_ID,
            rating: rating,
            status: status,
            language: "en",
            coverUrl: coverUrl,
            wordCount: totalWordCount,
            format: "NOVEL",
            publishedAt: new Date()
          }
        });

        // Create Chapters
        for (const chap of chapterData) {
          await prisma.chapter.create({
            data: {
              workId: work.id,
              title: chap.title,
              content: chap.content,
              number: chap.number,
              wordCount: chap.wordCount,
              isDraft: false,
              publishedAt: new Date()
            }
          });
        }

        // Link 1-2 random tags
        const numTags = 1 + Math.floor(Math.random() * 2);
        const selectedTags = [];
        const tempTagIds = [...tagIds];
        for (let t = 0; t < numTags; t++) {
          if (tempTagIds.length === 0) break;
          const idx = Math.floor(Math.random() * tempTagIds.length);
          selectedTags.push(tempTagIds.splice(idx, 1)[0]);
        }

        for (const tagId of selectedTags) {
          await prisma.workTag.create({
            data: {
              workId: work.id,
              tagId: tagId
            }
          });
        }
      })();

      batchPromises.push(promise);
    }

    // Await batch insertion
    await Promise.all(batchPromises);
    console.log(`Successfully completed batch ${i} to ${limit}.`);
  }

  console.log("Successfully seeded all 150 novels with thousands of words each for padiladmin!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
