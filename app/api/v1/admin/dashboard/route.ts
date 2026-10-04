import { NextResponse } from "next/server";

const backendApiUrl = process.env.BACKEND_API_URL ?? "http://localhost:8000";

export async function GET(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    const response = await fetch(`${backendApiUrl}/api/v1/admin/dashboard`, {
      headers: authorization ? { Authorization: authorization } : {},
      cache: "no-store",
    });
    const body = await response.json();

    return NextResponse.json(body, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Admin API is unavailable." },
      { status: 503 },
    );
  }
}
