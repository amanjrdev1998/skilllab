import { NextResponse } from "next/server";

const backendApiUrl = process.env.BACKEND_API_URL ?? "http://localhost:8000";

/**
 * Uploads a PDF (multipart field "pdf") and binds it to the course (admin only).
 * Forwards the multipart body untouched so the boundary stays valid.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authorization = request.headers.get("authorization");
    const contentType = request.headers.get("content-type");
    const response = await fetch(
      `${backendApiUrl}/api/v1/admin/courses/${encodeURIComponent(id)}/pdf`,
      {
        method: "POST",
        headers: {
          ...(authorization ? { Authorization: authorization } : {}),
          ...(contentType ? { "Content-Type": contentType } : {}),
        },
        body: await request.arrayBuffer(),
        cache: "no-store",
      },
    );
    const body = await response.json();
    return NextResponse.json(body, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "PDF upload is unavailable." },
      { status: 503 },
    );
  }
}
