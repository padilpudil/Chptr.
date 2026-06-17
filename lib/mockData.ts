import { Rating, WorkStatus, TagType } from "@prisma/client";

export const MOCK_TAGS = [
  { id: "t1", name: "Harry Potter", type: TagType.FANDOM, _count: { works: 42 } },
  { id: "t2", name: "Original Work", type: TagType.FANDOM, _count: { works: 25 } },
  { id: "t3", name: "Naruto", type: TagType.FANDOM, _count: { works: 18 } },
  { id: "t4", name: "Hermione Granger", type: TagType.CHARACTER, _count: { works: 30 } },
  { id: "t5", name: "Romance", type: TagType.GENRE, _count: { works: 85 } },
  { id: "t6", name: "Angst", type: TagType.GENRE, _count: { works: 45 } },
  { id: "t7", name: "Fluff", type: TagType.GENRE, _count: { works: 35 } },
  { id: "t8", name: "Happy Ending", type: TagType.ADDITIONAL, _count: { works: 60 } },
  { id: "t9", name: "Hurt/Comfort", type: TagType.ADDITIONAL, _count: { works: 50 } },
  { id: "t10", name: "Alternate Universe", type: TagType.ADDITIONAL, _count: { works: 75 } },
];

export const MOCK_WORKS = [
  {
    id: "work-1",
    title: "The Whispering Willows",
    summary: "In the silence of the night by the Hogwarts lake, Hermione discovers an ancient secret hidden behind the roots of the Whomping Willow. A mystery adventure story of forbidden love and inevitable destiny.",
    rating: Rating.GENERAL,
    status: WorkStatus.COMPLETED,
    language: "en",
    wordCount: 14200,
    coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000&auto=format&fit=crop",
    authorId: "user-1",
    author: { username: "LuminaraWriter", avatarUrl: null },
    tags: [
      { tag: { id: "t1", name: "Harry Potter", type: TagType.FANDOM } },
      { tag: { id: "t4", name: "Hermione Granger", type: TagType.CHARACTER } },
      { tag: { id: "t5", name: "Romance", type: TagType.GENRE } },
      { tag: { id: "t8", name: "Happy Ending", type: TagType.ADDITIONAL } },
    ],
    _count: { chapters: 3, kudos: 154, comments: 24, bookmarks: 45 },
    createdAt: new Date("2026-06-01T08:00:00.000Z"),
    updatedAt: new Date("2026-06-12T14:30:00.000Z"),
  },
  {
    id: "work-2",
    title: "Rain Symphony in Shibuya",
    summary: "A talented street musician meets a mysterious girl who always stands in the rain without an umbrella. They are united by melody, but separated by the secrets of Tokyo's underground world.",
    rating: Rating.TEEN,
    status: WorkStatus.IN_PROGRESS,
    language: "en",
    wordCount: 8500,
    coverUrl: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=1000&auto=format&fit=crop",
    authorId: "user-2",
    author: { username: "RhythmShadow", avatarUrl: null },
    tags: [
      { tag: { id: "t2", name: "Original Work", type: TagType.FANDOM } },
      { tag: { id: "t5", name: "Romance", type: TagType.GENRE } },
      { tag: { id: "t6", name: "Angst", type: TagType.GENRE } },
      { tag: { id: "t9", name: "Hurt/Comfort", type: TagType.ADDITIONAL } },
    ],
    _count: { chapters: 2, kudos: 98, comments: 12, bookmarks: 18 },
    createdAt: new Date("2026-06-05T10:00:00.000Z"),
    updatedAt: new Date("2026-06-14T09:15:00.000Z"),
  },
  {
    id: "work-3",
    title: "The Scarlet Shadow of Konoha",
    summary: "Naruto faces his greatest dilemma when a mysterious organization claiming to be the heirs of an ancient clan tries to seize control of Konoha from the shadows. Can he protect the peace of the village?",
    rating: Rating.TEEN,
    status: WorkStatus.COMPLETED,
    language: "en",
    wordCount: 22000,
    coverUrl: null,
    authorId: "user-3",
    author: { username: "HokageDreamer", avatarUrl: null },
    tags: [
      { tag: { id: "t3", name: "Naruto", type: TagType.FANDOM } },
      { tag: { id: "t6", name: "Angst", type: TagType.GENRE } },
      { tag: { id: "t10", name: "Alternate Universe", type: TagType.ADDITIONAL } },
    ],
    _count: { chapters: 5, kudos: 231, comments: 45, bookmarks: 64 },
    createdAt: new Date("2026-05-20T07:00:00.000Z"),
    updatedAt: new Date("2026-06-10T11:00:00.000Z"),
  },
  {
    id: "work-4",
    title: "Guardian of the Strait",
    summary: "An old lighthouse keeper in the Sunda Strait guards a mystery of a colonial ghost ship that appears during every lunar eclipse. When an oceanography student comes to investigate, long-submerged secrets slowly rise to the surface.",
    rating: Rating.GENERAL,
    status: WorkStatus.COMPLETED,
    language: "en",
    wordCount: 12500,
    coverUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000&auto=format&fit=crop",
    authorId: "user-4",
    author: { username: "MercusuarKuno", avatarUrl: null },
    tags: [
      { tag: { id: "t2", name: "Original Work", type: TagType.FANDOM } },
      { tag: { id: "t5", name: "Romance", type: TagType.GENRE } },
      { tag: { id: "t10", name: "Alternate Universe", type: TagType.ADDITIONAL } },
    ],
    _count: { chapters: 4, kudos: 120, comments: 15, bookmarks: 22 },
    createdAt: new Date("2026-06-02T09:00:00.000Z"),
    updatedAt: new Date("2026-06-11T16:00:00.000Z"),
  }
];

export const MOCK_CHAPTERS: Record<string, any[]> = {
  "work-1": [
    {
      id: "ch-1",
      title: "Chapter 1: Meeting by the Lake",
      content: "<p>The night was freezing. Hermione Granger wrapped her warm cloak tighter as she walked along the path by the Black Lake. The full moon cast soft reflections on the calm water, like a giant mirror.</p><p>She wasn't supposed to be out of the dormitory past curfew, but her mind was too occupied with anxiety about the upcoming NEWT exams. That was when she heard it—a soft whispering voice that seemed to call her name from behind the Whomping Willow...</p>",
      wordCount: 3500,
      sequence: 1,
      workId: "work-1",
      createdAt: new Date(),
    },
    {
      id: "ch-2",
      title: "Chapter 2: Mystery of the Willow Roots",
      content: "<p>Hermione approached the Whomping Willow, her wand raised cautiously. The faint 'Lumos' light from the tip of her wand revealed a hidden cavity among the tree's thick roots.</p><p>Inside the cavity lay a dusty, black leather-bound diary. As she touched it, a powerful jolt of magical energy surged up her arm, awakening memories that were not hers...</p>",
      wordCount: 5200,
      sequence: 2,
      workId: "work-1",
      createdAt: new Date(),
    },
    {
      id: "ch-3",
      title: "Chapter 3: Bond of Destiny",
      content: "<p>The diary apparently belonged to a legendary wizard from the 15th century. Through its pages, Hermione was guided to solve an ancient puzzle that could save Hogwarts from a hidden threat.</p><p>When the final piece of the puzzle fell into place, Hermione realized her presence here was no coincidence, but a destiny written centuries ago.</p>",
      wordCount: 5500,
      sequence: 3,
      workId: "work-1",
      createdAt: new Date(),
    }
  ],
  "work-2": [
    {
      id: "ch-4",
      title: "Chapter 1: Guitar and Rain",
      content: "<p>Shibuya was always busy, even in the heavy rain. Kento plucked his guitar strings with fingers stiff from the cold. His melody echoed amidst the roar of vehicles and the hurried steps of pedestrians.</p><p>Then, he saw her. A girl standing still near the traffic light, letting herself get drenched without an umbrella. She was staring blankly at the giant billboard screen...</p>",
      wordCount: 4000,
      sequence: 1,
      workId: "work-2",
      createdAt: new Date(),
    },
    {
      id: "ch-5",
      title: "Chapter 2: Hidden Melody",
      content: "<p>The girl, who finally introduced herself as Hana, began attending all of Kento's street performances. Hana rarely spoke, but the look in her eyes as she listened to Kento's songs spoke a million sorrows.</p><p>Kento knew there was a deep mystery behind Hana's elegant yet fragile appearance. A secret that slowly began to unravel when a group of men in black suits started searching for her in the crowded station...</p>",
      wordCount: 4500,
      sequence: 2,
      workId: "work-2",
      createdAt: new Date(),
    }
  ],
  "work-3": [
    {
      id: "ch-6",
      title: "Chapter 1: Call of Duty",
      content: "<p>A scarlet shadow darted swiftly across the rooftops of Konoha. Naruto, who now bore the heavy responsibility of Hokage, looked out at the village from his office window with a worried gaze.</p><p>The latest intelligence reports showed suspicious movements at the border. Something ancient and dangerous was rising...</p>",
      wordCount: 4400,
      sequence: 1,
      workId: "work-3",
      createdAt: new Date(),
    }
  ]
};

export const MOCK_COMMENTS: Record<string, any[]> = {
  "work-1": [
    {
      id: "c-1",
      content: "Wow, what an intriguing opening! The description of the atmosphere really made me feel like I was standing by the Hogwarts lake.",
      createdAt: new Date("2026-06-12T15:00:00.000Z"),
      author: { username: "Potterhead99", avatarUrl: null },
      replies: [
        {
          id: "cr-1",
          content: "Thank you so much! I'm glad you liked the background description. The next chapter will reveal more mysteries!",
          createdAt: new Date("2026-06-12T16:00:00.000Z"),
          author: { username: "LuminaraWriter", avatarUrl: null }
        }
      ]
    },
    {
      id: "c-2",
      content: "I really love Hermione's characterization here. It fits her naturally curious and clever personality perfectly.",
      createdAt: new Date("2026-06-13T10:00:00.000Z"),
      author: { username: "GrangerFan", avatarUrl: null },
      replies: []
    }
  ]
};

export function getMockWorks(search = "", includeTags: string[] = [], excludeTags: string[] = []) {
  let list = [...MOCK_WORKS];
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(w => w.title.toLowerCase().includes(q) || w.summary.toLowerCase().includes(q));
  }
  if (includeTags.length > 0) {
    list = list.filter(w => includeTags.every(t => w.tags.some(wt => wt.tag.name.toLowerCase() === t.toLowerCase())));
  }
  if (excludeTags.length > 0) {
    list = list.filter(w => !excludeTags.some(t => w.tags.some(wt => wt.tag.name.toLowerCase() === t.toLowerCase())));
  }
  return list;
}

export function getMockWorkById(id: string) {
  return MOCK_WORKS.find(w => w.id === id) || null;
}

export function getMockChaptersForWork(workId: string) {
  return MOCK_CHAPTERS[workId] || [];
}

export function getMockChapter(workId: string, chapterId: string) {
  const chs = getMockChaptersForWork(workId);
  return chs.find(c => c.id === chapterId) || null;
}

export function getMockCommentsForWork(workId: string) {
  return MOCK_COMMENTS[workId] || [];
}

export function getMockUser(username: string) {
  return {
    id: "user-mock",
    username,
    bio: "I am an amateur writer who loves adventure fiction and romance stories. Enjoy my works!",
    avatarUrl: null,
    createdAt: new Date(),
    _count: {
      works: 2,
      followers: 124,
      following: 58,
    }
  };
}
