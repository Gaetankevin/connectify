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

    // Support delta fetch: ?after=<lastMessageId>
    const url = new URL(request.url);
    const afterParam = url.searchParams.get("after");
    const afterId = afterParam ? Number(afterParam) : 0;

    // Build base query for messages
    const whereClause: any = { discussionId };
    if (afterId && !isNaN(afterId) && afterId > 0) {
      whereClause.id = { gt: afterId };
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
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
      take: 200,
    });

    // If client requested a delta (afterId > 0) we only return messages to keep payload small.
    if (afterId && afterId > 0) {
      return NextResponse.json({ messages });
    }

    // Default: return full discussion + messages
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
    // Block accidental multipart/form-data posts to this JSON endpoint.
    // Serverless filesystem is read-only on Vercel; multipart handlers that
    // attempt to write into `public/uploads` will fail with EROFS. Force
    // clients to upload files via the Vercel Blob flow (/api/uploads).
    const contentType = request.headers.get("content-type") || "";
    if (contentType.startsWith("multipart/")) {
      console.error(
        "Rejected multipart request to /api/conversations/[id] - instruct client to use /api/uploads"
      );
      return NextResponse.json(
        { error: "Multipart uploads are not supported. Upload files via /api/uploads (Vercel Blob)." },
        { status: 400 }
      );
    }
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

    // Trigger an async backup of the database to Vercel Blob to keep a data-only dump
    try {
      const { backupDatabase } = await import("@/lib/db-backup");
      // fire-and-forget: do not block response on backup/upload
      backupDatabase({ filenamePrefix: `messages-discussion-${discussionId}`, asyncUpload: true, directory: 'database' }).catch((e) => {
        console.error("Background backup failed:", e);
      });
    } catch (e) {
      console.error("Could not start background backup:", e);
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    // Log the error and stack (if available) to help diagnose EROFS or other issues
    if (error instanceof Error) {
      console.error("Error creating message:", error.message, error.stack);
    } else {
      console.error("Error creating message:", error);
    }
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
