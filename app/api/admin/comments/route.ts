import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

// GET: List all comments for moderation
export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const comments = await db.comment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { username: true, email: true },
        },
        work: {
          select: { title: true, id: true },
        },
      },
    });

    return NextResponse.json(comments);
  } catch (error: any) {
    console.error("Fetch admin comments error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update comment content (moderation edit)
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { commentId, content } = body;

    if (!commentId || content === undefined) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const updatedComment = await db.comment.update({
      where: { id: commentId },
      data: { content: content.trim() },
      include: {
        author: {
          select: { username: true },
        },
        work: {
          select: { title: true },
        },
      },
    });

    return NextResponse.json(updatedComment);
  } catch (error: any) {
    console.error("Update comment admin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a comment
export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json({ error: "Missing commentId" }, { status: 400 });
    }

    // Detach parent comments before deleting
    await db.comment.updateMany({
      where: { parentId: commentId },
      data: { parentId: null },
    });

    await db.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: "Comment successfully deleted" });
  } catch (error: any) {
    console.error("Delete comment admin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
