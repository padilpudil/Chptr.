import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

// GET: List all users
export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    const users = await db.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        bio: true,
        _count: {
          select: { works: true, comments: true },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error("Fetch admin users error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update user role
export async function PUT(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role || !["USER", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    // Prevent admin from demoting themselves
    if (userId === session.user?.id) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 }
      );
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, username: true, role: true },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("Update user role error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: Edit user details or reset password
export async function PATCH(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, username, email, bio, resetPassword } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const updateData: any = {};
    if (username !== undefined) updateData.username = username.trim();
    if (email !== undefined) updateData.email = email.trim();
    if (bio !== undefined) updateData.bio = bio.trim();

    if (resetPassword) {
      const hashedPassword = await bcrypt.hash("123456", 10);
      updateData.passwordHash = hashedPassword;
    }

    // Validate uniqueness if username or email is being updated
    if (username || email) {
      const orConditions = [];
      if (username) orConditions.push({ username: updateData.username });
      if (email) orConditions.push({ email: updateData.email });

      const existingUser = await db.user.findFirst({
        where: {
          id: { not: userId },
          OR: orConditions,
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Username or Email is already in use by another account" },
          { status: 400 }
        );
      }
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        role: true,
      },
    });

    return NextResponse.json({
      message: resetPassword ? "Profile updated and password reset to 123456" : "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Patch user admin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Cascading delete user account
export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (userId === session.user?.id) {
      return NextResponse.json(
        { error: "You cannot delete your own admin account" },
        { status: 400 }
      );
    }

    // Cascading delete transaction
    await db.$transaction(async (tx) => {
      // 1. Delete follows where user is follower or following
      await tx.follow.deleteMany({
        where: {
          OR: [
            { followerId: userId },
            { followingId: userId },
          ],
        },
      });

      // 2. Delete kudos given by this user
      await tx.kudos.deleteMany({
        where: { userId },
      });

      // 3. Delete bookmarks by this user
      await tx.bookmark.deleteMany({
        where: { userId },
      });

      // 4. Detach parent comments from this user's comments, then delete user's comments
      const userComments = await tx.comment.findMany({
        where: { authorId: userId },
        select: { id: true },
      });
      const userCommentIds = userComments.map((c) => c.id);

      await tx.comment.updateMany({
        where: { parentId: { in: userCommentIds } },
        data: { parentId: null },
      });

      await tx.comment.deleteMany({
        where: { authorId: userId },
      });

      // 5. Delete all works authored by this user
      const userWorks = await tx.work.findMany({
        where: { authorId: userId },
        select: { id: true },
      });
      const userWorkIds = userWorks.map((w) => w.id);

      // Clean up bookmarks on those works
      await tx.bookmark.deleteMany({
        where: { workId: { in: userWorkIds } },
      });

      // Clean up kudos on those works
      await tx.kudos.deleteMany({
        where: { workId: { in: userWorkIds } },
      });

      // Detach comments parentIds on those works
      await tx.comment.updateMany({
        where: { workId: { in: userWorkIds } },
        data: { parentId: null },
      });

      // Delete comments on those works
      await tx.comment.deleteMany({
        where: { workId: { in: userWorkIds } },
      });

      // Delete chapters on those works
      await tx.chapter.deleteMany({
        where: { workId: { in: userWorkIds } },
      });

      // Delete series works connection
      await tx.seriesWork.deleteMany({
        where: { workId: { in: userWorkIds } },
      });

      // Delete works themselves
      await tx.work.deleteMany({
        where: { authorId: userId },
      });

      // 6. Delete NextAuth credentials and sessions
      await tx.account.deleteMany({
        where: { userId },
      });

      await tx.session.deleteMany({
        where: { userId },
      });

      // 7. Delete the user itself
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return NextResponse.json({ message: "User and all associated data permanently deleted" });
  } catch (error: any) {
    console.error("Delete user admin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
