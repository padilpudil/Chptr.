import { NextResponse } from "next/server";
import { auth } from "@/auth";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    // Double check that the logged-in user is actually in pending onboarding state
    const userInDb = await db.user.findUnique({
      where: { id: session.user.id },
      select: { username: true },
    });

    if (!userInDb) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (!userInDb.username.startsWith("pending_google_")) {
      return NextResponse.json(
        { error: "Username setup has already been completed." },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json({ error: "Username is required." }, { status: 400 });
    }

    const cleanUsername = username.trim();

    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters long." },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
      return NextResponse.json(
        { error: "Username can only contain alphanumeric characters and underscores." },
        { status: 400 }
      );
    }

    if (cleanUsername.startsWith("pending_google_")) {
      return NextResponse.json(
        { error: "This prefix is reserved." },
        { status: 400 }
      );
    }

    // Check if new username is already taken
    const existingUser = await db.user.findUnique({
      where: { username: cleanUsername },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username is already taken by another writer." },
        { status: 409 }
      );
    }

    // Update the username in the database
    await db.user.update({
      where: { id: session.user.id },
      data: { username: cleanUsername },
    });

    return NextResponse.json({
      success: true,
      message: "Username successfully set.",
      username: cleanUsername,
    });
  } catch (error) {
    console.error("Onboarding API error:", error);
    return NextResponse.json(
      { error: "An unexpected system error occurred." },
      { status: 500 }
    );
  }
}
