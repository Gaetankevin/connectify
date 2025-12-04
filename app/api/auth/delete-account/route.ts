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

    // Delete all user data in cascade
    // First delete sessions
    await prisma.session.deleteMany({
      where: {
        userId: currentUser.id,
      },
    });

    // Delete messages
    await prisma.message.deleteMany({
      where: {
        senderId: currentUser.id,
      },
    });

    // Delete discussions where user is participant
    await prisma.discussion.deleteMany({
      where: {
        OR: [
          { user1Id: currentUser.id },
          { user2Id: currentUser.id },
        ],
      },
    });

    // Delete user
    await prisma.user.delete({
      where: {
        id: currentUser.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
