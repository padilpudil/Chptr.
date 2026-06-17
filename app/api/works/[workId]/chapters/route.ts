export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";

// Helper to count words by stripping HTML tags
function calculateWordCount(htmlContent: string): number {
  if (!htmlContent) return 0;
  const cleanText = htmlContent
    .replace(/<[^>]*>/g, " ") // Replace HTML tags with spaces
    .replace(/\s+/g, " ")     // Replace multiple spaces with a single space
    .trim();
  return cleanText ? cleanText.split(/\s+/).length : 0;
}

// Recalculate and update the total word count for a work
async function updateWorkWordCount(workId: string) {
  const chapters = await db.chapter.findMany({
    where: {
      workId,
      isDraft: false, // AO3 only counts words of published/public chapters
    },
    select: { wordCount: true },
  });

  const totalWords = chapters.reduce((sum, ch) => sum + ch.wordCount, 0);

  await db.work.update({
    where: { id: workId },
    data: { wordCount: totalWords },
  });
}

export async function GET(
  req: Request,
  { params }: { params: { workId: string } }
) {
  try {
    const { workId } = params;
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const includeDrafts = searchParams.get("drafts") === "true";

    // Validate ownership if drafts are requested
    const work = await db.work.findUnique({
      where: { id: workId },
      select: { authorId: true },
    });

    if (!work) {
      return NextResponse.json({ error: "Karya tidak ditemukan" }, { status: 404 });
    }

    const isAuthor = session?.user?.id === work.authorId;

    const chapters = await db.chapter.findMany({
      where: {
        workId,
        ...(includeDrafts && isAuthor ? {} : { isDraft: false }),
      },
      orderBy: { number: "asc" },
    });

    return NextResponse.json(chapters);
  } catch (error) {
    console.error("List chapters error:", error);
    return NextResponse.json({ error: "Gagal memuat bab" }, { status: 500 });
  }
}

export async function POST(
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
    const { title, content, number, isDraft } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Judul dan konten bab wajib diisi." },
        { status: 400 }
      );
    }

    const work = await db.work.findUnique({
      where: { id: workId },
    });

    if (!work) {
      return NextResponse.json({ error: "Karya tidak ditemukan" }, { status: 404 });
    }

    if (work.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Determine chapter number
    let chapterNumber = number;
    if (!chapterNumber) {
      const maxChapter = await db.chapter.findFirst({
        where: { workId },
        orderBy: { number: "desc" },
      });
      chapterNumber = maxChapter ? maxChapter.number + 1 : 1;
    }

    // Check if number already exists
    const existingChapter = await db.chapter.findUnique({
      where: {
        workId_number: {
          workId,
          number: chapterNumber,
        },
      },
    });

    if (existingChapter) {
      return NextResponse.json(
        { error: `Bab dengan nomor urut ${chapterNumber} sudah ada.` },
        { status: 409 }
      );
    }

    const wordCount = calculateWordCount(content);

    const newChapter = await db.chapter.create({
      data: {
        workId,
        title,
        content,
        number: chapterNumber,
        wordCount,
        isDraft: isDraft !== undefined ? isDraft : true,
        publishedAt: isDraft ? null : new Date(),
      },
    });

    await updateWorkWordCount(workId);

    return NextResponse.json(newChapter, { status: 201 });
  } catch (error) {
    console.error("Create chapter error:", error);
    return NextResponse.json(
      { error: "Gagal membuat bab baru" },
      { status: 500 }
    );
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
    const { chapterId, title, content, number, isDraft } = body;

    if (!chapterId || !title || !content) {
      return NextResponse.json(
        { error: "ID bab, judul, dan konten wajib diisi." },
        { status: 400 }
      );
    }

    const work = await db.work.findUnique({
      where: { id: workId },
    });

    if (!work) {
      return NextResponse.json({ error: "Karya tidak ditemukan" }, { status: 404 });
    }

    if (work.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const wordCount = calculateWordCount(content);
    const existingChapter = await db.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!existingChapter) {
      return NextResponse.json({ error: "Bab tidak ditemukan" }, { status: 404 });
    }

    const wasDraft = existingChapter.isDraft;

    const updatedChapter = await db.chapter.update({
      where: { id: chapterId },
      data: {
        title,
        content,
        number: number !== undefined ? number : existingChapter.number,
        wordCount,
        isDraft: isDraft !== undefined ? isDraft : existingChapter.isDraft,
        publishedAt: isDraft ? null : wasDraft ? new Date() : existingChapter.publishedAt,
      },
    });

    await updateWorkWordCount(workId);

    return NextResponse.json(updatedChapter);
  } catch (error) {
    console.error("Update chapter error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui bab" },
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
    const { searchParams } = new URL(req.url);
    const chapterId = searchParams.get("chapterId");

    if (!chapterId) {
      return NextResponse.json({ error: "ID bab wajib disertakan" }, { status: 400 });
    }

    const work = await db.work.findUnique({
      where: { id: workId },
    });

    if (!work) {
      return NextResponse.json({ error: "Karya tidak ditemukan" }, { status: 404 });
    }

    if (work.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.chapter.delete({
      where: { id: chapterId },
    });

    await updateWorkWordCount(workId);

    return NextResponse.json({ message: "Bab berhasil dihapus" });
  } catch (error) {
    console.error("Delete chapter error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus bab" },
      { status: 500 }
    );
  }
}
