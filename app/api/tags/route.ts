export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import db from "@/lib/db";
import { TagType } from "@prisma/client";

// Helper list of default tags to seed on first query if DB is empty
const DEFAULT_TAGS: { name: string; type: TagType }[] = [
  { name: "harry potter", type: "FANDOM" },
  { name: "bts", type: "FANDOM" },
  { name: "original work", type: "FANDOM" },
  { name: "naruto", type: "FANDOM" },
  { name: "hermione granger", type: "CHARACTER" },
  { name: "harry potter", type: "CHARACTER" },
  { name: "sasuke uchiha", type: "CHARACTER" },
  { name: "harry/ginny", type: "RELATIONSHIP" },
  { name: "naruto/sasuke", type: "RELATIONSHIP" },
  { name: "romance", type: "GENRE" },
  { name: "angst", type: "GENRE" },
  { name: "fluff", type: "GENRE" },
  { name: "mystery", type: "GENRE" },
  { name: "major character death", type: "WARNING" },
  { name: "violence", type: "WARNING" },
  { name: "happy ending", type: "ADDITIONAL" },
  { name: "hurt/comfort", type: "ADDITIONAL" },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.toLowerCase().trim() || "";

    // Count tags. If empty, seed default tags.
    const count = await db.tag.count();
    if (count === 0) {
      await db.tag.createMany({
        data: DEFAULT_TAGS,
        skipDuplicates: true,
      });
    }

    if (!query) {
      // Return top 15 tags by default if no query
      const tags = await db.tag.findMany({
        take: 15,
        orderBy: { name: "asc" },
      });
      return NextResponse.json(tags);
    }

    const tags = await db.tag.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      take: 10,
      orderBy: { name: "asc" },
    });

    return NextResponse.json(tags);
  } catch (error) {
    console.warn("Tag fetch DB error.", error);
    return NextResponse.json([]);
  }
}
