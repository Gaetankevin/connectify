import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Get current user from session
    const currentUser = await getUserFromSession();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if account is already scheduled for deletion
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        isDeactivated: true,
        deletedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // If not deactivated, deactivate first and set deletion date to 30 days from now
    if (!user.isDeactivated) {
      const deletionDate = new Date();
      deletionDate.setDate(deletionDate.getDate() + 30);

      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          isDeactivated: true,
          deactivatedAt: new Date(),
          deletedAt: deletionDate, // Scheduled for permanent deletion in 30 days
        },
      });

      // Clear all sessions
      await prisma.session.deleteMany({
        where: { userId: currentUser.id },
      });

      return NextResponse.json({
        success: true,
        message:
          "Your account has been marked for deletion and will be permanently deleted in 30 days. You can cancel this action by logging in within 30 days.",
        deletionDate: deletionDate.toISOString(),
      });
    }

    // If already deactivated but not yet marked for deletion, mark it now
    if (!user.deletedAt) {
      const deletionDate = new Date();
      deletionDate.setDate(deletionDate.getDate() + 30);

      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          deletedAt: deletionDate,
        },
      });

      // Clear all sessions
      await prisma.session.deleteMany({
        where: { userId: currentUser.id },
      });

      return NextResponse.json({
        success: true,
        message: "Your account is now scheduled for permanent deletion in 30 days.",
        deletionDate: deletionDate.toISOString(),
      });
    }

    // Already marked for deletion
    return NextResponse.json({
      success: false,
      message: "Your account is already scheduled for deletion.",
      deletionDate: user.deletedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error marking account for deletion:", error);
    return NextResponse.json(
      { error: "Failed to process account deletion" },
      { status: 500 }
    );
  }
}

// Cleanup route - for administrative use or scheduled job
export async function DELETE(request: NextRequest) {
  try {
    // Get current user from session (must be authenticated)
    const currentUser = await getUserFromSession();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user's deletion period has expired
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: {
        id: true,
        deletedAt: true,
      },
    });

    if (!user || !user.deletedAt) {
      return NextResponse.json(
        { error: "Account not scheduled for deletion" },
        { status: 400 }
      );
    }

    const now = new Date();
    if (user.deletedAt > now) {
      return NextResponse.json(
        {
          error: "Deletion period has not expired yet",
          remainingDays: Math.ceil(
            (user.deletedAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
          ),
        },
        { status: 400 }
      );
    }

    // Permanently delete user data (soft delete is already done, this is final cleanup)
    // In a real app, you might want to keep data for compliance/audit reasons
    // For now, we'll just note that this is the final deletion point

    // Delete all sessions
    await prisma.session.deleteMany({
      where: { userId: currentUser.id },
    });

    // Delete all messages
    await prisma.message.deleteMany({
      where: { senderId: currentUser.id },
    });

    // Delete all discussions where user is a participant
    await prisma.discussion.deleteMany({
      where: {
        OR: [{ user1Id: currentUser.id }, { user2Id: currentUser.id }],
      },
    });

    // Finally delete the user
    await prisma.user.delete({
      where: { id: currentUser.id },
    });

    return NextResponse.json({
      success: true,
      message: "Account permanently deleted",
    });
  } catch (error) {
    console.error("Error permanently deleting account:", error);
    return NextResponse.json(
      { error: "Failed to permanently delete account" },
      { status: 500 }
    );
  }
}
