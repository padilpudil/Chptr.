const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const AUTHOR_ID = "cmqetgwxb000012oe3gd8xqa4"; // padiladmin ID

const NOVELS = [
  {
    title: "The Chronicles of Eldoria: Echoes of the Past",
    summary: "An ancient kingdom long forgotten, a lone scribe discovering secrets buried beneath the archives, and the awakening of a magic that could destroy or save the realm.",
    rating: "GENERAL",
    status: "IN_PROGRESS",
    coverUrl: "https://images.unsplash.com/photo-1462400362591-9cd5527595a6?auto=format&fit=crop&q=80&w=800",
    tags: ["fantasy", "adventure"],
    preface: "Dedicated to the explorers of old, who mapped the stars and cataloged the winds.",
    afterword: "This concludes Book One. Book Two will follow the journey across the Whispering Wastes.",
    chapters: [
      {
        title: "Chapter 1: The Whispering Library",
        content: `
          <p>The library had stood for seven centuries, its spires reaching toward the grey heavens like stone fingers grasping at secrets. Within its walls, millions of scrolls lay silent, coated in a fine layer of silver dust that shimmered in the amber light of the oil lamps.</p>
          <p>Kaelen brushed a strand of dark hair from his eyes and adjusted his spectacles. He had spent the last three years in the deepest cellar, translating texts that had not felt the touch of a human hand since the age of the Star-Kings. Today, however, something was different. A draft, cold and smelling faintly of ozone and ancient pine, blew from behind the third bookshelf of the eastern wing.</p>
          <p>He reached his hand into the darkness behind the heavy oak structure. His fingers brushed against cold metal—a hidden latch, shaped like a sleeping dragon. With a soft click, the shelf swung inward, revealing a spiral staircase descending into the deep bedrock of the mountain. From below, he could hear a low, rhythmic vibration, like the heartbeat of the earth itself.</p>
        `
      },
      {
        title: "Chapter 2: The Hearth-Fire Revelations",
        content: `
          <p>Descending the stairs, Kaelen found himself in a circular chamber. In the center, a fire burned without wood or coal, suspended in mid-air above a stone basin. The flames were not orange, but a pale, luminous indigo, casting long, dancing shadows across the runic carvings on the walls.</p>
          <p>He approached the basin, his breath catching in his throat. Suspended within the fire was a single copper cylinder, untouched by soot. He hesitated, then reached into the indigo flame. To his amazement, the fire felt cool, like autumn wind. His fingers closed around the metal cylinder.</p>
          <p>Instantly, a rush of memories not his own flooded his mind. He saw great cities of crystal falling into ruin, dragons casting shadows over burning plains, and a voice—clear and commanding—whispering: <em>"The seal is broken. The King of Ash returns."</em> Kaelen stumbled backward, dropping the cylinder as the indigo fire flared brightly, casting the entire chamber into blinding white light.</p>
        `
      },
      {
        title: "Chapter 3: The Call to Journey",
        content: `
          <p>When Kaelen awoke, the indigo fire was gone. Only a handful of grey ashes remained in the stone basin, and the copper cylinder lay split in two on the floor. He sat up, his head throbbing with a dull ache. In his hand, a strange mark had appeared—a silver quill surrounded by three concentric rings.</p>
          <p>He knew what he had to do. The books he had spent his life studying were no longer just histories; they were warnings. He gathered his leather pack, stuffed it with dry rations, a flask of water, and three of his most reliable translation journals. He took one last look at the quiet alcoves of the Whispering Library, knowing he might never return.</p>
          <p>Stepping out of the heavy wooden doors, the cold mountain air hit his face. The sun was just rising over the eastern peaks, painting the valley in shades of gold and crimson. Somewhere beyond those mountains lay the ruins of Aethelgard, and the answers he desperately needed.</p>
        `
      }
    ]
  },
  {
    title: "Shadows in the Mist",
    summary: "A detective is called to a secluded coastal town where people vanish when the dense evening fog rolls in. The secrets of the lighthouse hold the answer.",
    rating: "TEEN",
    status: "COMPLETED",
    coverUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&q=80&w=800",
    tags: ["mystery", "drama"],
    preface: "To those who look closely at the shadows, and find the truth hiding in plain sight.",
    chapters: [
      {
        title: "Chapter 1: The Coastal Train",
        content: `
          <p>The train click-clacked along the jagged cliffs of Blackwood Bay, its iron wheels protesting against the salt-rusted tracks. Outside, the sea was a churning mass of dark slate, meeting a grey sky that threatened a heavy storm. Detective Julian Vance stared at his reflection in the window, his grey eyes tired and hollow.</p>
          <p>He had received the letter three days ago. It contained no return address, only a single newspaper clipping about the disappearance of Claire Sterling, and a hand-written note: <em>"The fog takes them when the light turns red. Come to the Blackwood Lighthouse."</em></p>
          <p>As the train hissed to a halt at the empty platform of Blackwood Station, Julian pulled his collar up against the biting wind. The air was thick, damp, and tasted of salt and rot. In the distance, rising like a dark monolith from the sea-beaten rocks, stood the old lighthouse, its light currently dark, waiting for the night.</p>
        `
      },
      {
        title: "Chapter 2: The Red Signal",
        content: `
          <p>Night fell over Blackwood Bay with a heavy, suffocating silence. Julian sat in the corner of the local tavern, watching the townsfolk. They spoke in hushed whispers, their eyes darting to the windows every few minutes. No one would speak to him about Claire Sterling. When he mentioned her name, the bartender simply shook his head and wiped the counter with renewed vigor.</p>
          <p>At exactly eight o'clock, the wind died down. A thick, milky fog rolled in from the sea, swallowing the docks and the narrow cobblestone streets. From the window, Julian watched the fog climb the walls. Suddenly, a collective gasp went through the tavern.</p>
          <p>He turned his gaze toward the sea. The beacon of the Blackwood Lighthouse had flared to life. But it was not the warm, white light that guided ships to safety. It was a deep, blood-red glow, cutting through the fog like an open wound. The patrons immediately began locking the doors and drawing the shutters, their faces pale with terror.</p>
        `
      },
      {
        title: "Chapter 3: The Lighthouse Secret",
        content: `
          <p>Julian did not lock his door. Instead, he slipped out into the fog, his revolver heavy in his coat pocket. The fog was so thick he could barely see his own boots. The red light from the lighthouse swept across the town, casting long, eerie shadows that seemed to move independently of the structures.</p>
          <p>He made his way down to the rocky causeway leading to the lighthouse. The waves crashed violently against the stones, spraying cold water onto his coat. He reached the heavy iron door of the lighthouse tower. It was slightly ajar, scraping against the stone floor with a high-pitched whine.</p>
          <p>He pushed the door open and stepped inside. The air was warm, smelling of ozone and burning copper. He looked up the spiral staircase. The red light pulsed from above, synchronized with a low, mechanical hum that vibrated in his chest. "Claire?" he called out, his voice echoing off the damp stone walls. The only reply was the rhythmic, mechanical pulse of the red light.</p>
        `
      }
    ]
  },
  {
    title: "Stellar Drift",
    summary: "Lost in the vast vacuum of space, the crew of the explorer vessel Aurelia must navigate an uncharted asteroid field and an internal division that threatens to tear them apart.",
    rating: "GENERAL",
    status: "IN_PROGRESS",
    coverUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800",
    tags: ["adventure", "fantasy"],
    preface: "To the crew of the Aurelia, who sailed into the dark and found the light.",
    chapters: [
      {
        title: "Chapter 1: The Jump Failure",
        content: `
          <p>The deck of the <em>Aurelia</em> shuddered violently. Alarms wailed in a dissonant chorus of red lights, casting the bridge into a state of panic. Commander Sarah Mercer gripped the edge of her console, her knuckles white. "Report! What happened to the slipspace drive?"</p>
          <p>"Complete containment failure in the primary drive core," Lieutenant Chen replied, his fingers flying across the holographic terminal. "We dropped out of warp early. We are nowhere near the Sol-III coordinates."</p>
          <p>Sarah looked at the main viewport. The familiar stars of the colonized sectors were gone. In their place was a dense, glowing nebula of violet and gold dust, surrounded by thousands of tumbling asteroids. "Establish our location," she ordered. Chen hesitated, looking up with fear in his eyes. "Commander... the navigation computer doesn't recognize any of these constellations. We are completely off the charts."</p>
        `
      },
      {
        title: "Chapter 2: Asteroid Field Navigation",
        content: `
          <p>The ship drifted deeper into the violet nebula. Every minute, small dust particles pinged against the titanium hull, a constant reminder of the fragile shield separating them from vacuum. The primary engines were offline, leaving only the thrusters to steer them through the tumbling debris.</p>
          <p>"We have a massive class-four asteroid heading directly for our port side," warned Sarah. "Chen, initiate evasive maneuvers. Use the gravitational pull of that smaller cluster to swing us clear."</p>
          <p>The ship turned sluggishly. For a long, breathless ten seconds, the giant rock filled the viewport, its cratered surface close enough to see the glittering crystals embedded within. Then, with a groan of metal, the thrusters fired, and the asteroid swept past, missing the hull by mere meters. Sarah let out a breath she hadn't realized she was holding. "Good work. Now, how do we get out of here?"</p>
        `
      },
      {
        title: "Chapter 3: The Signal from Below",
        content: `
          <p>With the immediate danger passed, the crew set to work repairing the main drive. But the mood on board was tense. Rations were limited, and the communications array was silent, unable to pierce the dense electromagnetic interference of the nebula.</p>
          <p>"Commander, you need to see this," Chen called from the scanning station. He pointed to a pulsing spike on the sensor screen. "I'm picking up a transmission. It's not a natural phenomenon. It's a repeating, structured sequence."</p>
          <p>Sarah leaned over the console. The signal was originating from the center of a giant, hollowed-out asteroid at the core of the nebula. "Is it an SOS?" she asked. "No," Chen whispered. "It's an activation code. And it's using the same encrypted frequency as our own military command."</p>
        `
      }
    ]
  },
  {
    title: "A Song for the Forgotten",
    summary: "A classical pianist losing her hearing meets a street musician who plays by feeling the vibrations of the pavement. A story of sound, silence, and connection.",
    rating: "GENERAL",
    status: "COMPLETED",
    coverUrl: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&q=80&w=800",
    tags: ["romance", "drama"],
    chapters: [
      {
        title: "Chapter 1: The Diminishing Sonata",
        content: `
          <p>Clara sat at the grand Steinway, her fingers poised above the keys. She struck a middle C. To anyone else, the note was clear, resonant, and beautiful. To Clara, it sounded like it was playing underwater, wrapped in a thick blanket of static. The doctor had told her she had less than a year of functional hearing left. For a concert pianist, it was a death sentence.</p>
          <p>She closed her eyes and began to play Beethoven's Appassionata from memory. She didn't need to hear the notes; she knew the physical distance between the keys, the exact pressure required to make the strings sing. But the joy was gone. The music was fading into a silent gray void, leaving her alone in her own mind.</p>
          <p>She stopped playing, the final chord dying away in the empty hall. She packed her sheet music into her leather bag, pulled on her woolen coat, and stepped out into the bustling streets of Vienna. The city was full of sounds she could no longer decipher—the rumble of carriages, the chatter of tourists, the chirp of birds—all merged into a dull, flat hum.</p>
        `
      },
      {
        title: "Chapter 2: The Street Musician",
        content: `
          <p>Clara walked aimlessly through the cobblestone alleys of the old town, her head down against the cold wind. As she passed the entrance to the subway station, she felt a strange sensation. It was not a sound, but a physical vibration pulsing through the soles of her boots. It was a rhythmic, warm thrumming that seemed to match the beat of her own heart.</p>
          <p>She stopped and looked around. Leaning against a brick wall was a young man with a battered acoustic guitar. He wasn't looking at the crowd; his eyes were closed, his cheek pressed flat against the wooden body of his instrument. His bare feet were pressed firmly against the stone pavement.</p>
          <p>He played with a wild, untamed energy. The melody was simple, but it carried an emotional weight that bypassed Clara's damaged ears and struck directly at her chest. She stood there, watching his fingers slide across the frets. He seemed to feel the music rather than hear it. When he opened his eyes, they were a warm amber, and he smiled directly at her.</p>
        `
      },
      {
        title: "Chapter 3: The Silent Duet",
        content: `
          <p>His name was Leo. He didn't speak much, preferring to communicate through scribbled notes in a small sketchbook. He had been deaf since birth, he explained. He played on the streets not to earn money, but to connect with the city. <em>"The stone remembers the music,"</em> he wrote. <em>"You just have to listen with your feet."</em></p>
          <p>He invited her to sit next to him on the cold stone steps. He placed his guitar across both of their laps, his hands covering hers. "Play," he gestured, pointing to the strings. Clara hesitated, then plucked the lowest string. The vibration traveled up her arm, warm and electric. Leo smiled and nodded, plucking a higher note in response.</p>
          <p>There, in the crowded subway entrance, surrounded by hundreds of strangers rushing past, they played a silent duet. They did not hear the notes, but they felt the rise and fall of the melody, a conversation of vibrations that spoke louder than any words ever could.</p>
        `
      }
    ]
  },
  {
    title: "The Iron Crown",
    summary: "Set during the turbulent era of warring states, a young prince must decide between following his father's bloody path of expansion or seeking peace at the risk of mutiny.",
    rating: "MATURE",
    status: "IN_PROGRESS",
    coverUrl: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&q=80&w=800",
    tags: ["history", "drama"],
    chapters: [
      {
        title: "Chapter 1: The Throne Room Shadow",
        content: `
          <p>The air in the Great Hall of Kael-Drak was thick with the scent of roasted meat and cheap wine. King Valerius sat upon the Iron Crown throne, his scarred face illuminated by the flickering torches. At his feet lay the banners of the defeated Southern Clans, torn and stained with blood.</p>
          <p>Prince Arthur stood in the shadow of the pillars, watching his father laugh with the warlords. Arthur was twenty, his face smooth and unmarked by battle, his hands accustomed to scrolls rather than the sword. He had spent the war in the libraries of the East, studying treaties and trade routes, hoping to find a diplomatic end to the conflict. His father, however, had chosen fire.</p>
          <p>"Arthur!" the King's voice boomed across the hall, silencing the revelers. "Come forth, boy! Look upon what we have built. Tomorrow, we march on the Eastern Valley. You will lead the vanguard. It is time you bloodied your sword and earned your place on this throne." Arthur stepped into the light, his heart sinking as he met his father's cold, demanding gaze.</p>
        `
      },
      {
        title: "Chapter 2: The Council of War",
        content: `
          <p>The war tent was warm, heated by a brass brazier in the center. A large map of the Eastern Valley was spread across the table, weighted down by daggers and gold coins. General Hector, a veteran of thirty campaigns, pointed to the mountain pass. "The defenders are weak, Prince Arthur. We can sweep through their farms before noon. By nightfall, the city of Oakhaven will be ours."</p>
          <p>"Oakhaven is a city of scholars and farmers," Arthur argued, his voice quiet but firm. "They have no standing army. If we offer them a treaty—allowing them to retain their libraries in exchange for trade rights—we can secure the region without shedding a drop of blood."</p>
          <p>Hector laughed, a harsh, grating sound. "A treaty? The King does not want treaties, Prince. He wants submission. If you show weakness now, the men will mutiny. They march for plunder, not libraries. Choose your words carefully, young master. The battlefield does not tolerate hesitation."</p>
        `
      },
      {
        title: "Chapter 3: The Crossroads",
        content: `
          <p>Arthur stood on the ridge, watching the campfires of his army in the valley below. The soldiers were sharpening their swords, their laughter carrying on the wind. Across the river, the lights of Oakhaven burned quietly, unaware of the storm gathering on their horizon.</p>
          <p>He pulled a small parchment scroll from his sleeve—the draft of the treaty he had written in secret. If he delivered it to the city elders tonight, they might surrender peacefully before Hector's vanguard could attack. But if Hector found out, it would be treason. His own men would turn on him, and his father would disown him.</p>
          <p>He looked at the iron ring on his finger, emblazoned with the crest of Kael-Drak. The path of his father was easy, paved with blood and gold. The path of peace was narrow, dangerous, and lonely. He slipped the scroll back into his pocket, took his horse's reins, and began his descent into the darkness of the valley.</p>
        `
      }
    ]
  },
  {
    title: "Threads of Fate",
    summary: "In a city where every person's fate is woven into a physical tapestry, a master weaver discovers a severed thread that belongs to someone who shouldn't exist.",
    rating: "GENERAL",
    status: "COMPLETED",
    coverUrl: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80&w=800",
    tags: ["fantasy", "drama"],
    chapters: [
      {
        title: "Chapter 1: The Loom of Destiny",
        content: `
          <p>The Great Loom of Aethelgard occupied the entire central tower of the Weaver's Guild. It was a massive contraption of brass gears, wooden beams, and silver needles, clicking and whirring day and night. From its frame, millions of glowing threads descended, woven into the Great Tapestry that covered the floor.</p>
          <p>Silas, the Master Weaver, walked along the catwalks, his magnifying glass held to his eye. He was responsible for checking the tension of the threads. Each thread represented a human life—its color showed their character, its thickness their health, and its pattern their path.</p>
          <p>As he examined the sector representing the merchant district, his hand froze. There, lying loose on the wood of the catwalk, was a severed thread. It was not glowing, but it was not dark either. It was a deep, velvet black, absorbing the light around it. He picked it up. It felt cold, vibrating with a strange, silent energy. He traced it back to the loom, but there was no empty needle. The thread had no origin, and no woven end.</p>
        `
      },
      {
        title: "Chapter 2: The Nameless Weaver",
        content: `
          <p>Silas spent the night in the Guild Archives, searching through the ancient catalogs of the Loom. Every thread ever spun was recorded in the Great Ledger. But the velvet black thread was not listed. There were no records of a child born under its sign, no fate mapped to its course.</p>
          <p>"It's a phantom thread," whispered Master Elena, the Guild Elder, when Silas showed it to her. Her old hands trembled as she touched the velvet fiber. "Legend says that once every century, the Loom spins a thread that does not belong to the world. A person born without a destiny, free from the pattern."</p>
          <p>"Where are they?" Silas asked. "They are unseen by the Loom," Elena replied, looking out the window at the dark city. "They cannot be predicted, and they cannot be controlled. They are the anomalies. If the Guild Council finds out, they will destroy the thread—and the person attached to it—to preserve the Tapestry."</p>
        `
      },
      {
        title: "Chapter 3: The Weaver's Choice",
        content: `
          <p>Silas walked through the rain-slicked streets of the lower city, the velvet thread tucked into his inner pocket. He could feel it pulsing against his chest, a warm, quiet heartbeat. He was following the faint resonance of the thread, which grew stronger as he approached the harbor docks.</p>
          <p>Near the edge of the water, sitting on a wooden crate, was a young girl wrapping a fish in newspaper. She wore a patched grey cloak, her dark hair wet from the rain. As Silas approached, she looked up. Her eyes were not black, but they had no reflections, like deep pools of ink.</p>
          <p>She did not look afraid. She simply stared at him, then looked down at his hand. "You have my thread," she said, her voice clear and calm. Silas stopped, realizing that if he handed the thread to the Council, her life would be woven into the machine—or cut permanently. He looked at the thread, then at the girl, and made his choice.</p>
        `
      }
    ]
  }
];

async function main() {
  console.log("Seeding novels for padiladmin...");

  // 1. Ensure tags exist in database
  console.log("Ensuring tags exist...");
  const tagMap = {};
  const allTags = ["fantasy", "adventure", "mystery", "drama", "romance", "history"];
  
  for (const tagName of allTags) {
    const dbTag = await prisma.tag.upsert({
      where: { name: tagName },
      update: {},
      create: {
        name: tagName,
        type: "GENRE"
      }
    });
    tagMap[tagName] = dbTag.id;
  }

  // 2. Create the novels
  for (const novelData of NOVELS) {
    console.log(`Creating novel: "${novelData.title}"...`);

    // Calculate total word count for the novel
    let totalWordCount = 0;
    for (const chap of novelData.chapters) {
      // rough word count based on words split
      const wordCount = chap.content.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
      chap.wordCount = wordCount;
      totalWordCount += wordCount;
    }

    // Create Work entry
    const createdWork = await prisma.work.create({
      data: {
        title: novelData.title,
        summary: novelData.summary,
        authorId: AUTHOR_ID,
        rating: novelData.rating,
        status: novelData.status,
        language: "en",
        coverUrl: novelData.coverUrl,
        wordCount: totalWordCount,
        preface: novelData.preface || null,
        afterword: novelData.afterword || null,
        format: "NOVEL",
        publishedAt: new Date()
      }
    });

    // Create Chapters entries
    let index = 1;
    for (const chap of novelData.chapters) {
      console.log(`- Adding Chapter ${index}: "${chap.title}" (${chap.wordCount} words)`);
      await prisma.chapter.create({
        data: {
          workId: createdWork.id,
          title: chap.title,
          content: chap.content,
          number: index,
          wordCount: chap.wordCount,
          isDraft: false,
          publishedAt: new Date()
        }
      });
      index++;
    }

    // Link Tags
    for (const tagName of novelData.tags) {
      const tagId = tagMap[tagName];
      await prisma.workTag.create({
        data: {
          workId: createdWork.id,
          tagId: tagId
        }
      });
    }

    console.log(`Successfully created novel "${novelData.title}" with ID: ${createdWork.id}`);
  }

  console.log("Database seeding completed successfully!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
