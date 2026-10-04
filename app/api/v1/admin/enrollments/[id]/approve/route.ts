import { NextResponse } from "next/server";

const backendApiUrl = process.env.BACKEND_API_URL ?? "http://localhost:8000";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const authorization = request.headers.get("authorization");
    const response = await fetch(
      `${backendApiUrl}/api/v1/admin/enrollments/${encodeURIComponent(id)}/approve`,
      {
        method: "POST",
        headers: authorization ? { Authorization: authorization } : {},
        cache: "no-store",
      },
    );
    const body = await response.json();

    return NextResponse.json(body, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Enrollment approval API is unavailable." },
      { status: 503 },
    );
  }
}
