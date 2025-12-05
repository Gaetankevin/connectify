import { NextRequest, NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    // Get current user from session
    const currentUser = await getUserFromSession();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Vercel Blob
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error("[profile-picture] BLOB_READ_WRITE_TOKEN not set");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const filename = `profile-pictures/user-${currentUser.id}-${Date.now()}.${file.type.split("/")[1]}`;

    console.log(`[profile-picture] Uploading: ${filename}`);

    const blob = await put(filename, buffer, {
      access: "public",
      token,
    });

    console.log(`[profile-picture] Upload successful: ${blob.url}`);

    // Update user profile image URL in database
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        profileImage: blob.url,
      },
      select: {
        id: true,
        profileImage: true,
      },
    });

    return NextResponse.json({
      success: true,
      profileImage: updatedUser.profileImage,
      message: "Profile picture updated successfully",
    });
  } catch (error) {
    console.error("[profile-picture] Error:", error);
    return NextResponse.json(
      { error: "Failed to upload profile picture" },
      { status: 500 }
    );
  }
}

// Delete profile picture
export async function DELETE(request: NextRequest) {
  try {
    // Get current user from session
    const currentUser = await getUserFromSession();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update user to remove profile image
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        profileImage: null,
      },
      select: {
        id: true,
        profileImage: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile picture deleted successfully",
    });
  } catch (error) {
    console.error("[profile-picture] Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete profile picture" },
      { status: 500 }
    );
  }
}
