import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/conversations
 * Fetch all discussions for the current user with related users and recent messages.
 * Returns discussions sorted by most recent message first.
 */
export async function GET(request: NextRequest) {
  try {
    // Get current user from session
    const currentUser = await getUserFromSession();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all discussions where the user is either user1 or user2
    // Include the other user's details and the latest messages
    const discussions = await prisma.discussion.findMany({
      where: {
        OR: [{ user1Id: currentUser.id }, { user2Id: currentUser.id }],
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            email: true,
            profileImage: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
            email: true,
            profileImage: true,
          },
        },
        messages: {
          select: {
            id: true,
            content: true,
            mediaType: true,
            mediaUrl: true,
            createdAt: true,
            senderId: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1, // Get only the latest message
        },
      },
      orderBy: {
        updatedAt: "desc", // Sort by most recently updated discussion
      },
    });

    // Transform discussions to include the other user (not current user)
    const conversations = discussions.map((discussion) => {
      const otherUser =
        discussion.user1Id === currentUser.id ? discussion.user2 : discussion.user1;
      const latestMessage = discussion.messages[0] || null;

      return {
        id: discussion.id,
        otherUser,
        createdAt: discussion.createdAt,
        updatedAt: discussion.updatedAt,
        lastMessage: latestMessage
          ? {
              id: latestMessage.id,
              content: latestMessage.content,
              mediaType: latestMessage.mediaType,
              mediaUrl: latestMessage.mediaUrl,
              createdAt: latestMessage.createdAt,
              senderId: latestMessage.senderId,
            }
          : null,
      };
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations
 * Create a new discussion (conversation) between the current user and another user.
 * Request body: { otherUserId: number }
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUserFromSession();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { otherUserId } = body;

    if (!otherUserId || typeof otherUserId !== "number") {
      return NextResponse.json(
        { error: "otherUserId is required and must be a number" },
        { status: 400 }
      );
    }

    if (otherUserId === currentUser.id) {
      return NextResponse.json(
        { error: "Cannot create a discussion with yourself" },
        { status: 400 }
      );
    }

    // Verify other user exists
    const otherUser = await prisma.user.findUnique({
      where: { id: otherUserId },
    });

    if (!otherUser) {
      return NextResponse.json(
        { error: "Other user not found" },
        { status: 404 }
      );
    }

    // Check if discussion already exists between these two users
    const existingDiscussion = await prisma.discussion.findFirst({
      where: {
        OR: [
          { user1Id: currentUser.id, user2Id: otherUserId },
          { user1Id: otherUserId, user2Id: currentUser.id },
        ],
      },
    });

    if (existingDiscussion) {
      return NextResponse.json(existingDiscussion, { status: 200 });
    }

    // Create new discussion
    const discussion = await prisma.discussion.create({
      data: {
        user1Id: currentUser.id,
        user2Id: otherUserId,
      },
      include: {
        user1: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
          },
        },
        user2: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
          },
        },
      },
    });

    return NextResponse.json(discussion, { status: 201 });
  } catch (error) {
    console.error("Error creating discussion:", error);
    return NextResponse.json(
      { error: "Failed to create discussion" },
      { status: 500 }
    );
  }
}
