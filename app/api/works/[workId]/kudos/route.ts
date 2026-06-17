export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import { createHash } from "crypto";

export async function GET(
  req: Request,
  { params }: { params: { workId: string } }
) {
  try {
    const { workId } = params;
    const session = await auth();

    const kudosCount = await db.kudos.count({
      where: { workId },
    });

    let hasKudosed = false;

    if (session?.user?.id) {
      const existing = await db.kudos.findUnique({
        where: {
          workId_userId: {
            workId,
            userId: session.user.id,
          },
        },
      });
      hasKudosed = !!existing;
    } else {
      // Check IP hash
      const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
      const ipHash = createHash("sha256").update(ip).digest("hex");

      const existing = await db.kudos.findUnique({
        where: {
          workId_ipHash: {
            workId,
            ipHash,
          },
        },
      });
      hasKudosed = !!existing;
    }

    return NextResponse.json({ count: kudosCount, hasKudosed });
  } catch (error) {
    console.error("Fetch kudos error:", error);
    return NextResponse.json({ error: "Gagal memuat data kudos" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { workId: string } }
) {
  try {
    const { workId } = params;
    const session = await auth();

    // Check if work exists
    const work = await db.work.findUnique({
      where: { id: workId },
      select: { authorId: true },
    });

    if (!work) {
      return NextResponse.json({ error: "Karya tidak ditemukan" }, { status: 404 });
    }

    // Optional constraint: authors cannot kudos their own work
    if (session?.user?.id && session.user.id === work.authorId) {
      return NextResponse.json(
        { error: "Anda tidak bisa memberikan kudos pada karya Anda sendiri." },
        { status: 400 }
      );
    }

    if (session?.user?.id) {
      // Authenticated User
      const userId = session.user.id;

      const existing = await db.kudos.findUnique({
        where: {
          workId_userId: {
            workId,
            userId,
          },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Anda sudah memberikan kudos pada cerita ini." },
          { status: 409 }
        );
      }

      await db.kudos.create({
        data: {
          workId,
          userId,
        },
      });
    } else {
      // Guest User
      const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
      const ipHash = createHash("sha256").update(ip).digest("hex");

      const existing = await db.kudos.findUnique({
        where: {
          workId_ipHash: {
            workId,
            ipHash,
          },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: "Kudos dari IP ini sudah terekam." },
          { status: 409 }
        );
      }

      await db.kudos.create({
        data: {
          workId,
          ipHash,
        },
      });
    }

    const newCount = await db.kudos.count({
      where: { workId },
    });

    return NextResponse.json({ count: newCount, hasKudosed: true });
  } catch (error) {
    console.error("Create kudos error:", error);
    return NextResponse.json(
      { error: "Gagal memberikan kudos" },
      { status: 500 }
    );
  }
}
