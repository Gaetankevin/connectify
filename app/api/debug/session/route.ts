import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";

export async function GET() {
  try {
    const user = await getUserFromSession();
    // Return the server-side view of the session (null if not authenticated)
    return NextResponse.json({ authenticated: !!user, user: user ?? null });
  } catch (err) {
    console.error("Debug session endpoint error:", err);
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
