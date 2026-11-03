import { NextResponse } from "next/server";

const backendApiUrl = process.env.BACKEND_API_URL ?? "http://localhost:8000";

/** Lists PDF filenames available in backend/storage/pdfs/ (admin only). */
export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    const response = await fetch(`${backendApiUrl}/api/v1/admin/pdfs`, {
      headers: authorization ? { Authorization: authorization } : {},
      cache: "no-store",
    });
    const body = await response.json();
    return NextResponse.json(body, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "PDF list is unavailable." },
      { status: 503 },
    );
  }
}
