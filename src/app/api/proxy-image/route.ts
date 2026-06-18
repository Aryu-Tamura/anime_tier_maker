import { NextRequest, NextResponse } from "next/server";

// This is a security measure to ensure our proxy is not used to access any random URL.
const ALLOWED_DOMAIN = "cdn.myanimelist.net";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("URL parameter is required", { status: 400 });
  }

  const url = new URL(imageUrl);
  if (url.hostname !== ALLOWED_DOMAIN) {
    return new NextResponse(`Hostname not allowed. Only ${ALLOWED_DOMAIN} is permitted.`, {
      status: 403,
    });
  }

  try {
    const response = await fetch(url.toString());

    if (!response.ok) {
      return new NextResponse("Failed to fetch image", { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType =
      response.headers.get("Content-Type") || "application/octet-stream";

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable", // Cache for 1 year
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
