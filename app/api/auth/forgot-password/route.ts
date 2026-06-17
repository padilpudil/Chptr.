import { NextResponse } from "next/server";
import db from "@/lib/db";
import crypto from "crypto";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

const resendApiKey = process.env.RESEND_API_KEY;
const isResendConfigured = resendApiKey && resendApiKey !== "re_your-resend-api-key";
const resend = isResendConfigured ? new Resend(resendApiKey) : null;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account with that email address exists." },
        { status: 404 }
      );
    }

    // Generate random secure token
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 3600000); // 1 hour expiration

    // Delete any existing tokens for this email
    try {
      await db.passwordResetToken.deleteMany({
        where: { email: trimmedEmail },
      });
    } catch (e) {
      // Ignore if none exist
    }

    // Create the token in DB
    await db.passwordResetToken.create({
      data: {
        email: trimmedEmail,
        token,
        expires,
      },
    });

    // Determine host and protocol dynamically from request headers
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const origin = `${protocol}://${host}`;

    const devLink = `/reset-password?token=${token}`;
    const resetLink = `${origin}${devLink}`;

    console.log(`[DEV] Password reset link for ${trimmedEmail}: ${resetLink}`);

    let emailSent = false;
    let emailError = "";

    if (resend) {
      try {
        await resend.emails.send({
          from: "Chptr. Auth <onboarding@chptr.space>",
          to: trimmedEmail,
          subject: "Reset Your Password - Chptr.",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #c5a059;">
              <h2 style="color: #4d0b0f; font-family: serif; text-transform: uppercase; margin-top: 0;">Reset Your Password</h2>
              <p>You requested a password reset for your Chptr. account. Click the button below to set a new password:</p>
              <div style="margin: 35px 0; text-align: center;">
                <a href="${resetLink}" style="background-color: #4d0b0f; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border: 1px solid #c5a059; display: inline-block;">Reset Password</a>
              </div>
              <p style="font-size: 11px; color: #666; font-style: italic; margin-bottom: 0; border-top: 1px solid #c5a059; padding-top: 15px;">
                This link will expire in 1 hour. If you did not request this password reset, please ignore this email.
              </p>
            </div>
          `,
        });
        emailSent = true;
      } catch (err: any) {
        console.error("Resend delivery failed:", err);
        emailError = err?.message || "Failed to send email via Resend.";
      }
    }

    return NextResponse.json({
      success: true,
      message: emailSent 
        ? "Reset link has been sent to your email." 
        : "Reset link generated (local bypass fallback).",
      devLink: !emailSent ? devLink : undefined,
      emailSent,
      emailError: emailError || undefined,
    });
  } catch (error) {
    console.error("Forgot password API error:", error);
    return NextResponse.json(
      { error: "An unexpected system error occurred." },
      { status: 500 }
    );
  }
}
