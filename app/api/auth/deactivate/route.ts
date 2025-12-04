import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession } from "../../../../lib/session";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Get current user from session
    const currentUser = await getUserFromSession();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Deactivate account by clearing all sessions
    await prisma.session.deleteMany({
      where: {
        userId: currentUser.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deactivating account:", error);
    return NextResponse.json(
      { error: "Failed to deactivate account" },
      { status: 500 }
    );
  }
}
