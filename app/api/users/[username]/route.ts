export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";

export async function GET(
  req: Request,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = params;
    const session = await auth();

    const user = await db.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            works: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    let isFollowing = false;
    if (session?.user?.id) {
      const followRecord = await db.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: user.id,
          },
        },
      });
      isFollowing = !!followRecord;
    }

    return NextResponse.json({
      user,
      isFollowing,
    });
  } catch (error) {
    console.warn("Fetch user profile DB error.", error);
    return NextResponse.json({ error: "Database error." }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { username: string } }
) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username } = params;
    
    // Check if session user matches the requested username
    if (session.user.username !== username) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { bio, avatarUrl } = body;

    const updatedUser = await db.user.update({
      where: { username },
      data: {
        bio: bio !== undefined ? bio.trim() : undefined,
        avatarUrl: avatarUrl !== undefined ? avatarUrl.trim() : undefined,
      },
    });

    return NextResponse.json({
      id: updatedUser.id,
      username: updatedUser.username,
      avatarUrl: updatedUser.avatarUrl,
      bio: updatedUser.bio,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile." }, { status: 500 });
  }
}
