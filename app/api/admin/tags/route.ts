import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";
import { TagType } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET: List all tags
export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const tags = await db.tag.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { works: true },
        },
      },
    });

    return NextResponse.json(tags);
  } catch (error: any) {
    console.error("Fetch admin tags error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create a new tag
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { name, type } = body;

    if (!name || !type || !Object.values(TagType).includes(type)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const trimmedName = name.trim().toLowerCase();

    // Check if tag already exists
    const existingTag = await db.tag.findUnique({
      where: { name: trimmedName },
    });

    if (existingTag) {
      return NextResponse.json({ error: "Tag already exists" }, { status: 400 });
    }

    const newTag = await db.tag.create({
      data: {
        name: trimmedName,
        type,
      },
    });

    return NextResponse.json(newTag);
  } catch (error: any) {
    console.error("Create tag error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a tag
export async function DELETE(request: Request) {
  try {
    const session = await auth();

    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get("tagId");

    if (!tagId) {
      return NextResponse.json({ error: "Missing tagId" }, { status: 400 });
    }

    // Delete relation records from WorkTag first
    await db.workTag.deleteMany({
      where: { tagId },
    });

    await db.tag.delete({
      where: { id: tagId },
    });

    return NextResponse.json({ message: "Tag successfully deleted" });
  } catch (error: any) {
    console.error("Delete tag error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
