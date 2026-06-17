import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";

export async function POST(
  req: Request,
  { params }: { params: { username: string } }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = params;
    const followerId = session.user.id;

    // Find the user to follow
    const targetUser = await db.user.findUnique({
      where: { username },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    const followingId = targetUser.id;

    if (followerId === followingId) {
      return NextResponse.json(
        { error: "Anda tidak dapat mengikuti diri sendiri." },
        { status: 400 }
      );
    }

    // Check if already following
    const existingFollow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    let isFollowing = false;

    if (existingFollow) {
      // Unfollow
      await db.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });
      isFollowing = false;
    } else {
      // Follow
      await db.follow.create({
        data: {
          followerId,
          followingId,
        },
      });
      isFollowing = true;
    }

    // Get updated followers count
    const followersCount = await db.follow.count({
      where: { followingId },
    });

    return NextResponse.json({ isFollowing, followersCount });
  } catch (error) {
    console.error("Toggle follow error:", error);
    return NextResponse.json({ error: "Gagal memproses permintaan follow" }, { status: 500 });
  }
}
