import { NextResponse } from "next/server";

const backendApiUrl = process.env.BACKEND_API_URL ?? "http://localhost:8000";

function authHeaders(request: Request): HeadersInit {
  const authorization = request.headers.get("authorization");
  return authorization ? { Authorization: authorization } : {};
}

async function proxy(request: Request, id: string, method: "PUT" | "DELETE") {
  const response = await fetch(
    `${backendApiUrl}/api/v1/admin/courses/${encodeURIComponent(id)}`,
    {
      method,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(request),
      },
      body: method === "PUT" ? await request.text() : undefined,
      cache: "no-store",
    },
  );
  const body = await response.json();
  return NextResponse.json(body, { status: response.status });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    return await proxy(request, id, "PUT");
  } catch {
    return NextResponse.json(
      { success: false, message: "Admin courses API is unavailable." },
      { status: 503 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    return await proxy(request, id, "DELETE");
  } catch {
    return NextResponse.json(
      { success: false, message: "Admin courses API is unavailable." },
      { status: 503 },
    );
  }
}
