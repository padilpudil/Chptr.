export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { workId: string } }
) {
  try {
    const { workId } = params;
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ bookmarked: false });
    }

    const bookmark = await db.bookmark.findUnique({
      where: {
        userId_workId: {
          userId: session.user.id,
          workId,
        },
      },
    });

    return NextResponse.json({
      bookmarked: !!bookmark,
      bookmarkDetails: bookmark,
    });
  } catch (error) {
    console.error("Fetch bookmark status error:", error);
    return NextResponse.json({ error: "Gagal memuat status bookmark" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { workId: string } }
) {
  try {
    const { workId } = params;
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const { notes, isPrivate, remove } = body;

    // Toggle: if remove is true, we delete the bookmark
    if (remove) {
      await db.bookmark.delete({
        where: {
          userId_workId: {
            userId,
            workId,
          },
        },
      });
      return NextResponse.json({ bookmarked: false, message: "Bookmark dihapus" });
    }

    // Upsert bookmark
    const bookmark = await db.bookmark.upsert({
      where: {
        userId_workId: {
          userId,
          workId,
        },
      },
      update: {
        notes,
        isPrivate: isPrivate !== undefined ? isPrivate : false,
      },
      create: {
        userId,
        workId,
        notes,
        isPrivate: isPrivate !== undefined ? isPrivate : false,
      },
    });

    return NextResponse.json({ bookmarked: true, bookmarkDetails: bookmark });
  } catch (error) {
    console.error("Manage bookmark error:", error);
    return NextResponse.json(
      { error: "Gagal memproses bookmark" },
      { status: 500 }
    );
  }
}
