import { NextResponse } from "next/server";

const backendApiUrl = process.env.BACKEND_API_URL ?? "http://localhost:8000";

function authHeaders(request: Request): HeadersInit {
  const authorization = request.headers.get("authorization");
  return authorization ? { Authorization: authorization } : {};
}

export async function GET(request: Request) {
  try {
    const response = await fetch(`${backendApiUrl}/api/v1/admin/courses`, {
      headers: authHeaders(request),
      cache: "no-store",
    });
    const body = await response.json();
    return NextResponse.json(body, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Admin courses API is unavailable." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const response = await fetch(`${backendApiUrl}/api/v1/admin/courses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(request),
      },
      body: await request.text(),
      cache: "no-store",
    });
    const body = await response.json();
    return NextResponse.json(body, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Admin courses API is unavailable." },
      { status: 503 },
    );
  }
}
