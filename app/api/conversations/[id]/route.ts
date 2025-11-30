'use server';

import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession } from "../../../../lib/session";
import { prisma } from "../../../../lib/prisma";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

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

    // Support both JSON and multipart/form-data uploads
    let content: string | null = null;
    let mediaType: string | null = null;
    let mediaUrl: string | null = null;

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file") as File | null;
      const text = form.get("content");
      content = text ? String(text) : null;

      if (file && (file as any).stream) {
        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        await fs.promises.mkdir(uploadsDir, { recursive: true });

        const originalName = (file as any).name || "upload";
        const ext = path.extname(originalName) || "";
        const id = Date.now() + "-" + Math.random().toString(36).slice(2, 9);
        const fileName = `${id}${ext}`;
        const filePath = path.join(uploadsDir, fileName);

        // Convert web ReadableStream to Node Readable and pipe to fs
        const webStream = (file as any).stream();
        const nodeStream = Readable.fromWeb(webStream as any);
        const writeStream = fs.createWriteStream(filePath);
        await pipeline(nodeStream, writeStream);

        mediaType = (file as any).type || null;
        mediaUrl = `/uploads/${fileName}`;
      }
    } else {
      const body = await request.json();
      content = body.content || null;
      mediaType = body.mediaType || null;
      mediaUrl = body.mediaUrl || null;
    }

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

    // Create the message
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
