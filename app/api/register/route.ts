import { NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email, and password are required" },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedUsername.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters long" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { email: trimmedEmail },
          { username: trimmedUsername }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === trimmedEmail) {
        return NextResponse.json(
          { error: "Email is already registered" },
          { status: 409 }
        );
      }
      if (existingUser.username === trimmedUsername) {
        return NextResponse.json(
          { error: "Username is already taken" },
          { status: 409 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await db.user.create({
      data: {
        username: trimmedUsername,
        email: trimmedEmail,
        passwordHash,
      }
    });

    return NextResponse.json(
      { message: "User registered successfully", user: { id: newUser.id, username: newUser.username } },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
