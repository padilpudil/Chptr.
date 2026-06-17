export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import { Rating, WorkStatus, TagType } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: { workId: string } }
) {
  try {
    const { workId } = params;

    const work = await db.work.findUnique({
      where: { id: workId },
      include: {
        author: {
          select: { id: true, username: true, avatarUrl: true, bio: true },
        },
        tags: {
          include: { tag: true },
        },
        chapters: {
          where: { isDraft: false },
          orderBy: { number: "asc" },
          select: {
            id: true,
            title: true,
            number: true,
            wordCount: true,
            publishedAt: true,
          },
        },
        _count: {
          select: { kudos: true, comments: true, bookmarks: true },
        },
      },
    });

    if (!work) {
      return NextResponse.json({ error: "Story not found." }, { status: 404 });
    }

    return NextResponse.json(work);
  } catch (error) {
    console.error("Fetch work error:", error);
    return NextResponse.json({ error: "Failed to load story details." }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { workId: string } }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workId } = params;
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
      format
    } = body;

    // Check ownership
    const existingWork = await db.work.findUnique({
      where: { id: workId },
    });

    if (!existingWork) {
      return NextResponse.json({ error: "Story not found." }, { status: 404 });
    }

    if (existingWork.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Process new tags
    const workTagsData: { tagId: string }[] = [];
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

    // Update work transaction
    const updatedWork = await db.$transaction(async (tx) => {
      // Delete old tags
      await tx.workTag.deleteMany({
        where: { workId },
      });

      // Update work details and create new tags
      return tx.work.update({
        where: { id: workId },
        data: {
          title,
          summary,
          rating: rating as Rating,
          status: status as WorkStatus,
          language,
          coverUrl,
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
    });

    // Update full-text search vector
    try {
      await db.$executeRawUnsafe(
        `UPDATE works SET "searchVector" = to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, '')) WHERE id = '${workId}';`
      );
    } catch (vectorErr) {
      console.warn("Full-text search vector update skipped or failed:", vectorErr);
    }

    return NextResponse.json(updatedWork);
  } catch (error) {
    console.error("Update work error:", error);
    return NextResponse.json(
      { error: "Failed to update story." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { workId: string } }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workId } = params;

    const existingWork = await db.work.findUnique({
      where: { id: workId },
    });

    if (!existingWork) {
      return NextResponse.json({ error: "Story not found." }, { status: 404 });
    }

    if (existingWork.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.work.delete({
      where: { id: workId },
    });

    return NextResponse.json({ message: "Story successfully deleted." });
  } catch (error) {
    console.error("Delete work error:", error);
    return NextResponse.json(
      { error: "Failed to delete story." },
      { status: 500 }
    );
  }
}
