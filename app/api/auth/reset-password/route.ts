import { NextResponse } from "next/server";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Verify token
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid reset token." },
        { status: 400 }
      );
    }

    if (resetToken.expires < new Date()) {
      // Clean up expired token
      try {
        await db.passwordResetToken.delete({ where: { token } });
      } catch (e) {}

      return NextResponse.json(
        { error: "Reset token has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user's password
    await db.user.update({
      where: { email: resetToken.email },
      data: { passwordHash },
    });

    // Delete used token
    await db.passwordResetToken.delete({
      where: { token },
    });

    return NextResponse.json({
      success: true,
      message: "Password has been successfully updated.",
    });
  } catch (error) {
    console.error("Reset password API error:", error);
    return NextResponse.json(
      { error: "An unexpected system error occurred." },
      { status: 500 }
    );
  }
}
