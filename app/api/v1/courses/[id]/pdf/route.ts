import { NextResponse } from "next/server";

const backendApiUrl = process.env.BACKEND_API_URL ?? "http://localhost:8000";

/**
 * Streams the bound course PDF for an enrolled student.
 * The browser never sees the real file URL — bytes come through this
 * authenticated proxy only, so the PDF cannot be hot-linked or shared.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authorization = request.headers.get("authorization");
    if (!authorization) {
      return NextResponse.json(
        { success: false, message: "Authentication required." },
        { status: 401 },
      );
    }

    const response = await fetch(
      `${backendApiUrl}/api/v1/courses/${encodeURIComponent(id)}/pdf`,
      {
        headers: { Authorization: authorization },
        cache: "no-store",
      },
    );

    if (!response.ok || !response.body) {
      const body = await response
        .json()
        .catch(() => ({ success: false, message: "PDF is unavailable." }));
      return NextResponse.json(body, { status: response.status });
    }

    const headers = new Headers();
    headers.set("Content-Type", "application/pdf");
    headers.set(
      "Content-Disposition",
      response.headers.get("content-disposition") ?? "inline",
    );
    headers.set("Cache-Control", "private, no-store, max-age=0");
    headers.set("X-Content-Type-Options", "nosniff");

    return new NextResponse(response.body, { status: 200, headers });
  } catch {
    return NextResponse.json(
      { success: false, message: "PDF service is unavailable." },
      { status: 503 },
    );
  }
}
