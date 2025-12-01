'use server';

import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession } from "../../../../lib/session";
import { prisma } from "../../../../lib/prisma";

/**
 * GET /api/conversations/[id]
 * Fetch all messages for a specific discussion.
 * Verifies the current user is a participant in the discussion.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const currentUser = await getUserFromSession();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const discussionId = parseInt(id);
    if (isNaN(discussionId)) {
      return NextResponse.json({ error: "Invalid discussion ID" }, { status: 400 });
    }

    // Fetch discussion and verify user is a participant
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
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

    if (!discussion) {
      return NextResponse.json({ error: "Discussion not found" }, { status: 404 });
    }

    // Verify user is part of this discussion
    if (
      discussion.user1Id !== currentUser.id &&
      discussion.user2Id !== currentUser.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch all messages in the discussion
    const messages = await prisma.message.findMany({
      where: { discussionId },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({
      discussion: {
        id: discussion.id,
        user1: discussion.user1,
        user2: discussion.user2,
        createdAt: discussion.createdAt,
        updatedAt: discussion.updatedAt,
      },
      messages,
    });
  } catch (error) {
    console.error("Error fetching discussion messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations/[id]
 * Send a message in a discussion.
 * Expects JSON with { content?, mediaUrl?, mediaType? }.
 * Files should be uploaded to Vercel Blob separately via /api/uploads.
 * Verifies the current user is a participant.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const currentUser = await getUserFromSession();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const discussionId = parseInt(id);
    if (isNaN(discussionId)) {
      return NextResponse.json({ error: "Invalid discussion ID" }, { status: 400 });
    }

    // Parse JSON body (files are already uploaded to Vercel Blob)
    const body = await request.json();
    const { content, mediaUrl, mediaType } = body;

    if (!content && !mediaUrl) {
      return NextResponse.json(
        { error: "Either content or media is required" },
        { status: 400 }
      );
    }

    // Verify discussion exists and user is a participant
    const discussion = await prisma.discussion.findUnique({
      where: { id: discussionId },
    });

    if (!discussion) {
      return NextResponse.json({ error: "Discussion not found" }, { status: 404 });
    }

    if (
      discussion.user1Id !== currentUser.id &&
      discussion.user2Id !== currentUser.id
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Create the message with the provided mediaUrl (from Vercel Blob)
    const message = await prisma.message.create({
      data: {
        content: content || null,
        mediaType: mediaType || null,
        mediaUrl: mediaUrl || null,
        discussionId,
        senderId: currentUser.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            name: true,
            surname: true,
          },
        },
      },
    });

    // Update discussion's updatedAt timestamp
    await prisma.discussion.update({
      where: { id: discussionId },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
