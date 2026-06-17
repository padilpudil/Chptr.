import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import { Rating, WorkStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET: List all works for moderation
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    const works = await db.work.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { summary: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { username: true, email: true },
        },
        _count: {
          select: { chapters: true, comments: true, kudos: true },
        },
      },
    });

    return NextResponse.json(works);
  } catch (error: any) {
    console.error("Fetch admin works error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update work details (metadata editing)
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { workId, title, summary, rating, status, language } = body;

    if (!workId) {
      return NextResponse.json({ error: "Missing workId" }, { status: 400 });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title.trim();
    if (summary !== undefined) updateData.summary = summary.trim();
    if (rating !== undefined && Object.values(Rating).includes(rating)) {
      updateData.rating = rating;
    }
    if (status !== undefined && Object.values(WorkStatus).includes(status)) {
      updateData.status = status;
    }
    if (language !== undefined) updateData.language = language.trim();

    const updatedWork = await db.work.update({
      where: { id: workId },
      data: updateData,
      include: {
        author: {
          select: { username: true },
        },
      },
    });

    return NextResponse.json(updatedWork);
  } catch (error: any) {
    console.error("Update work admin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a work
export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const workId = searchParams.get("workId");

    if (!workId) {
      return NextResponse.json({ error: "Missing workId" }, { status: 400 });
    }

    // Explicitly clean up all related items in transaction to prevent FK violations
    await db.$transaction(async (tx) => {
      await tx.bookmark.deleteMany({ where: { workId } });
      await tx.kudos.deleteMany({ where: { workId } });
      
      // Detach comment hierarchies
      await tx.comment.updateMany({
        where: { workId },
        data: { parentId: null }
      });
      await tx.comment.deleteMany({ where: { workId } });
      await tx.chapter.deleteMany({ where: { workId } });
      await tx.seriesWork.deleteMany({ where: { workId } });
      await tx.workTag.deleteMany({ where: { workId } });
      
      await tx.work.delete({
        where: { id: workId },
      });
    });

    return NextResponse.json({ message: "Work successfully deleted" });
  } catch (error: any) {
    console.error("Delete work admin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
