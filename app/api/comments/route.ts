export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const workId = searchParams.get("workId");
    const chapterId = searchParams.get("chapterId") || null;
    const limit = parseInt(searchParams.get("limit") || "20");
    const cursor = searchParams.get("cursor") || undefined;

    if (!workId) {
      return NextResponse.json({ error: "workId wajib disertakan" }, { status: 400 });
    }

    // We fetch parent comments (where parentId is null) with pagination,
    // and include their replies (1 level of nesting is sufficient)
    const parentComments = await db.comment.findMany({
      where: {
        workId,
        chapterId: chapterId || undefined,
        parentId: null, // only top-level comments
      },
      take: limit,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        author: {
          select: { username: true, avatarUrl: true },
        },
        replies: {
          include: {
            author: {
              select: { username: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const nextCursor =
      parentComments.length === limit ? parentComments[parentComments.length - 1].id : null;

    return NextResponse.json({ comments: parentComments, nextCursor });
  } catch (error) {
    console.error("Fetch comments error:", error);
    return NextResponse.json({ error: "Gagal memuat komentar" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { workId, chapterId, content, parentId } = body;

    if (!workId || !content || !content.trim()) {
      return NextResponse.json(
        { error: "workId dan isi komentar wajib diisi." },
        { status: 400 }
      );
    }

    const authorId = session.user.id;

    // Create Comment
    const comment = await db.comment.create({
      data: {
        workId,
        chapterId: chapterId || null,
        authorId,
        content: content.trim(),
        parentId: parentId || null,
      },
      include: {
        author: {
          select: { username: true, avatarUrl: true },
        },
      },
    });

    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json({ error: "Gagal mengirim komentar" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get("commentId");

    if (!commentId) {
      return NextResponse.json({ error: "ID komentar wajib disertakan" }, { status: 400 });
    }

    // Check comment exists
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      include: {
        work: {
          select: { authorId: true },
        },
      },
    });

    if (!comment) {
      return NextResponse.json({ error: "Komentar tidak ditemukan" }, { status: 404 });
    }

    // Permission check: Comment Author OR Work Author can delete
    const isCommentAuthor = comment.authorId === session.user.id;
    const isWorkAuthor = comment.work.authorId === session.user.id;

    if (!isCommentAuthor && !isWorkAuthor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ message: "Komentar berhasil dihapus" });
  } catch (error) {
    console.error("Delete comment error:", error);
    return NextResponse.json({ error: "Gagal menghapus komentar" }, { status: 500 });
  }
}
