import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();

    // 1. Authorize Admin
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // 2. Fetch stats
    const [userCount, workCount, commentCount, chapterCount] = await Promise.all([
      db.user.count(),
      db.work.count(),
      db.comment.count(),
      db.chapter.count(),
    ]);

    // 3. Fetch recent users (last 5)
    const recentUsers = await db.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    // 4. Fetch recent works (last 5)
    const recentWorks = await db.work.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { username: true },
        },
      },
    });

    return NextResponse.json({
      counts: {
        users: userCount,
        works: workCount,
        comments: commentCount,
        chapters: chapterCount,
      },
      recentUsers,
      recentWorks,
    });
  } catch (error: any) {
    console.error("Fetch admin stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
