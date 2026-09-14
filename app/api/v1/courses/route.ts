import { NextResponse } from "next/server";

const backendApiUrl = process.env.BACKEND_API_URL ?? "http://localhost:8000";

export async function GET() {
  try {
    const response = await fetch(`${backendApiUrl}/api/v1/courses`, {
      cache: "no-store",
    });
    const body = await response.json();

    return NextResponse.json(body, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Course API is unavailable." },
      { status: 503 },
    );
  }
}
