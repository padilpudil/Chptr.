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

    // 1. Calculate average rating and count
    const aggregate = await db.workRating.aggregate({
      _avg: {
        value: true,
      },
      _count: {
        id: true,
      },
      where: { workId },
    });

    const averageRating = aggregate._avg.value ? parseFloat(aggregate._avg.value.toFixed(1)) : 0;
    const count = aggregate._count.id;

    // 2. Fetch current user/guest rating
    let userRating = null;

    if (session?.user?.id) {
      const existing = await db.workRating.findUnique({
        where: {
          workId_userId: {
            workId,
            userId: session.user.id,
          },
        },
      });
      userRating = existing ? existing.value : null;
    } else {
      const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
      const ipHash = createHash("sha256").update(ip).digest("hex");

      const existing = await db.workRating.findUnique({
        where: {
          workId_ipHash: {
            workId,
            ipHash,
          },
        },
      });
      userRating = existing ? existing.value : null;
    }

    return NextResponse.json({ averageRating, count, userRating });
  } catch (error) {
    console.error("Fetch rating error:", error);
    return NextResponse.json({ error: "Failed to load rating data." }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { workId: string } }
) {
  try {
    const { workId } = params;
    const session = await auth();

    // Parse request body
    const body = await req.json();
    const value = parseInt(body.value);

    if (isNaN(value) || value < 1 || value > 5) {
      return NextResponse.json({ error: "Rating must be a number between 1 and 5." }, { status: 400 });
    }

    // Check if work exists
    const work = await db.work.findUnique({
      where: { id: workId },
      select: { authorId: true },
    });

    if (!work) {
      return NextResponse.json({ error: "Story not found." }, { status: 404 });
    }

    // Optional constraint: authors cannot rate their own work
    if (session?.user?.id && session.user.id === work.authorId) {
      return NextResponse.json(
        { error: "You cannot rate your own story." },
        { status: 400 }
      );
    }

    if (session?.user?.id) {
      // Authenticated User rating
      const userId = session.user.id;

      await db.workRating.upsert({
        where: {
          workId_userId: {
            workId,
            userId,
          },
        },
        update: {
          value,
        },
        create: {
          workId,
          userId,
          value,
        },
      });
    } else {
      // Guest User rating based on IP hash
      const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
      const ipHash = createHash("sha256").update(ip).digest("hex");

      await db.workRating.upsert({
        where: {
          workId_ipHash: {
            workId,
            ipHash,
          },
        },
        update: {
          value,
        },
        create: {
          workId,
          ipHash,
          value,
        },
      });
    }

    // Recalculate and return new aggregate info
    const aggregate = await db.workRating.aggregate({
      _avg: {
        value: true,
      },
      _count: {
        id: true,
      },
      where: { workId },
    });

    const averageRating = aggregate._avg.value ? parseFloat(aggregate._avg.value.toFixed(1)) : 0;
    const count = aggregate._count.id;

    return NextResponse.json({ averageRating, count, userRating: value });
  } catch (error) {
    console.error("Submit rating error:", error);
    return NextResponse.json(
      { error: "Failed to submit rating." },
      { status: 500 }
    );
  }
}
