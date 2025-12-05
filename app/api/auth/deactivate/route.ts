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

    // Get the action from query params (deactivate or reactivate)
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "deactivate";

    if (action === "deactivate") {
      // Check if account is already marked as deleted
      const user = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: { deletedAt: true },
      });

      if (user?.deletedAt) {
        return NextResponse.json(
          { error: "Cannot deactivate a deleted account" },
          { status: 400 }
        );
      }

      // Deactivate account and clear sessions
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          isDeactivated: true,
          deactivatedAt: new Date(),
        },
      });

      // Clear all sessions
      await prisma.session.deleteMany({
        where: { userId: currentUser.id },
      });

      return NextResponse.json({
        success: true,
        message: "Account deactivated. You can reactivate it within 30 days by logging in again.",
      });
    } else if (action === "reactivate") {
      // Check if account is deactivated and still within 30-day window
      const user = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: { isDeactivated: true, deactivatedAt: true },
      });

      if (!user?.isDeactivated) {
        return NextResponse.json(
          { error: "Account is not deactivated" },
          { status: 400 }
        );
      }

      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      if (user.deactivatedAt && user.deactivatedAt < thirtyDaysAgo) {
        return NextResponse.json(
          {
            error:
              "Deactivation period has expired (30 days). Account is scheduled for permanent deletion.",
          },
          { status: 400 }
        );
      }

      // Reactivate account
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          isDeactivated: false,
          deactivatedAt: null,
        },
      });

      return NextResponse.json({
        success: true,
        message: "Account reactivated successfully!",
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error deactivating/reactivating account:", error);
    return NextResponse.json(
      { error: "Failed to process account status" },
      { status: 500 }
    );
  }
}
