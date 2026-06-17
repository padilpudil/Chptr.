import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const id = process.env.GOOGLE_CLIENT_ID;
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  
  const isConfigured = 
    id && 
    id !== "your-google-client-id" && 
    secret && 
    secret !== "your-google-client-secret";

  return NextResponse.json({ isConfigured: !!isConfigured });
}
