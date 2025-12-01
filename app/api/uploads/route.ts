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
  const body = (await request.json()) as HandleUploadBody;

  try {
    // Verify user is authenticated before allowing uploads
    const currentUser = await getUserFromSession();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
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
        console.log("Blob upload completed:", blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Error in handleUpload:", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
