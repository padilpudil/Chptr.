export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import { Rating, WorkStatus, TagType, Prisma } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { 
      title, 
      summary, 
      rating, 
      status, 
      language, 
      coverUrl, 
      tags,
      preface,
      afterword,
      license,
      isRestricted,
      allowComments,
      customCss,
      coAuthorsText,
      firstChapter,
      format
    } = body;

    if (!title || !summary) {
      return NextResponse.json(
        { error: "Title and summary are required." },
        { status: 400 }
      );
    }

    const authorId = session.user.id;
    const workTagsData = [];

    if (tags && Array.isArray(tags)) {
      for (const tag of tags) {
        const nameNormalized = tag.name.trim().toLowerCase();
        if (!nameNormalized) continue;

        const dbTag = await db.tag.upsert({
          where: { name: nameNormalized },
          update: {},
          create: {
            name: nameNormalized,
            type: tag.type || TagType.ADDITIONAL,
          },
        });

        workTagsData.push({
          tagId: dbTag.id,
        });
      }
    }

    const work = await db.work.create({
      data: {
        title,
        summary,
        rating: rating || Rating.GENERAL,
        status: status || WorkStatus.IN_PROGRESS,
        language: language || "en",
        coverUrl: coverUrl || null,
        authorId,
        preface: preface || null,
        afterword: afterword || null,
        license: license || "ALL_RIGHTS_RESERVED",
        isRestricted: !!isRestricted,
        allowComments: allowComments !== false,
        customCss: customCss || null,
        coAuthorsText: coAuthorsText || null,
        format: format || "NOVEL",
        tags: {
          create: workTagsData,
        },
      },
    });

    // Handle optional first chapter creation
    if (firstChapter && firstChapter.title?.trim() && firstChapter.content?.trim()) {
      const wordCount = firstChapter.content.replace(/<[^>]*>/g, " ").trim().split(/\s+/).filter(Boolean).length;
      await db.chapter.create({
        data: {
          workId: work.id,
          title: firstChapter.title.trim(),
          content: firstChapter.content,
          number: 1,
          wordCount,
          isDraft: false,
          publishedAt: new Date(),
        },
      });
      
      // Sync wordCount to Work
      await db.work.update({
        where: { id: work.id },
        data: { wordCount },
      });
    }

    // Optional: Trigger full-text search update vector if postgres supports it
    try {
      await db.$executeRawUnsafe(
        `UPDATE "Work" SET "searchVector" = to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '')) WHERE id = '${work.id}';`
      );
    } catch (vectorErr) {
      try {
        await db.$executeRawUnsafe(
          `UPDATE works SET "searchVector" = to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '')) WHERE id = '${work.id}';`
        );
      } catch (e) {
        console.warn("Full-text search vector update skipped:", e);
      }
    }

    return NextResponse.json({ id: work.id }, { status: 201 });
  } catch (error: any) {
    console.error("Create work error:", error);
    return NextResponse.json(
      { error: "Failed to create new story." },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const cursor = searchParams.get("cursor") || undefined;

    // Filters
    const search = searchParams.get("search") || "";
    const languages = searchParams.get("languages") ? searchParams.get("languages")!.split(",") : [];
    const ratings = searchParams.get("ratings") ? (searchParams.get("ratings")!.split(",") as Rating[]) : [];
    const statuses = searchParams.get("statuses") ? (searchParams.get("statuses")!.split(",") as WorkStatus[]) : [];
    const minWords = parseInt(searchParams.get("minWords") || "0");
    
    // Tag Filters (comma-separated strings)
    const includedTags = searchParams.get("includeTags") ? searchParams.get("includeTags")!.split(",") : [];
    const excludedTags = searchParams.get("excludeTags") ? searchParams.get("excludeTags")!.split(",") : [];
    const formats = searchParams.get("formats") ? searchParams.get("formats")!.split(",") : 
                    (searchParams.get("format") ? searchParams.get("format")!.split(",") : []);

    // Sorting
    const sortBy = searchParams.get("sortBy") || "updatedAt"; // updatedAt, kudos, comments, wordCountDesc, wordCountAsc, publishedAt

    // Build Prisma where filter
    const where: Prisma.WorkWhereInput = {};

    // 1. Language Filter
    if (languages.length > 0) {
      where.language = { in: languages };
    }

    // 2. Rating Filter
    if (ratings.length > 0) {
      where.rating = { in: ratings };
    }

    // 3. Status Filter
    if (statuses.length > 0) {
      where.status = { in: statuses };
    }

    // 4. Word Count Filter
    if (minWords > 0) {
      where.wordCount = { gte: minWords };
    }

    // 5. Title / Summary Search Filter
    if (search.trim()) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { summary: { contains: search, mode: "insensitive" } },
        {
          author: {
            username: { contains: search, mode: "insensitive" }
          }
        }
      ];
    }

    // 6. Included Tags Filter (Work must have ALL included tags)
    if (includedTags.length > 0) {
      where.AND = includedTags.map((tagName) => ({
        tags: {
          some: {
            tag: {
              name: tagName.toLowerCase().trim(),
            },
          },
        },
      }));
    }

    // 7. Excluded Tags Filter (Work must not have ANY of the excluded tags)
    if (excludedTags.length > 0) {
      where.tags = {
        none: {
          tag: {
            name: {
              in: excludedTags.map((t) => t.toLowerCase().trim()),
            },
          },
        },
      };
    }

    // 8. Format Filter
    if (formats.length > 0) {
      where.format = { in: formats as any[] };
    }

    // Build Order By
    let orderBy: Prisma.WorkOrderByWithRelationInput = { updatedAt: "desc" };
    if (sortBy === "kudos") {
      orderBy = { kudos: { _count: "desc" } };
    } else if (sortBy === "comments") {
      orderBy = { comments: { _count: "desc" } };
    } else if (sortBy === "wordCountDesc") {
      orderBy = { wordCount: "desc" };
    } else if (sortBy === "wordCountAsc") {
      orderBy = { wordCount: "asc" };
    } else if (sortBy === "publishedAt") {
      orderBy = { createdAt: "desc" }; // fallback if publishedAt is nullable
    } else if (sortBy === "updatedAt") {
      orderBy = { updatedAt: "desc" };
    }

    // Fetch Works
    const works = await db.work.findMany({
      where,
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        author: {
          select: { username: true, avatarUrl: true },
        },
        tags: {
          include: { tag: true },
        },
        ratings: {
          select: { value: true },
        },
        _count: {
          select: { chapters: true, kudos: true, comments: true, bookmarks: true },
        },
      },
      orderBy,
    });

    const nextCursor = works.length === limit ? works[works.length - 1].id : null;

    // Fetch matching authors if search query is active
    let matchingAuthors: any[] = [];
    if (search.trim()) {
      try {
        matchingAuthors = await db.user.findMany({
          where: {
            username: { contains: search, mode: "insensitive" }
          },
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            bio: true,
            _count: {
              select: { followers: true }
            }
          },
          take: 6
        });
      } catch (err) {
        console.warn("Failed to fetch matching authors:", err);
      }
    }

    return NextResponse.json({ works, nextCursor, authors: matchingAuthors });
  } catch (error) {
    console.warn("List works DB error.", error);
    return NextResponse.json({ works: [], nextCursor: null, authors: [] });
  }
}
