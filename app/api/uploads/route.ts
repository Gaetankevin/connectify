import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/session";

/**
 * POST /api/uploads
 * Vercel Blob client upload handler (follows official docs).
 * Generates secure tokens for the client to upload files directly to Blob.
 * Called by @vercel/blob/client's upload() function.
 */
export async function POST(request: Request): Promise<NextResponse> {
  console.log("[uploads] POST /api/uploads called");

  try {
    // Verify BLOB_READ_WRITE_TOKEN is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("[uploads] BLOB_READ_WRITE_TOKEN is not set in environment");
      return NextResponse.json(
        { error: "Blob storage not configured" },
        { status: 500 }
      );
    }

    const body = (await request.json()) as HandleUploadBody;
    console.log("[uploads] Parsed request body, type:", body.type);

    // Verify user is authenticated before allowing uploads
    const currentUser = await getUserFromSession();
    if (!currentUser) {
      console.log("[uploads] User not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[uploads] User authenticated, userId:", currentUser.id);

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        console.log("[uploads] onBeforeGenerateToken called for pathname:", pathname);
        // Authenticate & authorize before generating a token.
        // We already verified auth above, so generate a secure token.
        return {
          // Allow common image and document types for messages
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "video/mp4",
            "video/webm",
          ],
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Vercel Blob calls this webhook after the client finishes uploading.
        // Log for debugging; you could also update DB if needed.
        console.log("[uploads] onUploadCompleted called, blob.url:", blob.url);
      },
    });

    console.log("[uploads] handleUpload succeeded, returning response");
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("[uploads] Error in handleUpload:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
