import { NextResponse } from "next/server";

const backendApiUrl = process.env.BACKEND_API_URL ?? "http://localhost:8000";

export async function POST(request: Request) {
  try {
    const authorization = request.headers.get("authorization");
    const response = await fetch(`${backendApiUrl}/api/v1/payments/paypal/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: await request.text(),
      cache: "no-store",
    });
    const body = await response.json();

    return NextResponse.json(body, { status: response.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "PayPal order service is unavailable." },
      { status: 503 },
    );
  }
}
