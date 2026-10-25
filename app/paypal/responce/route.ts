import { NextResponse } from "next/server";

const backendApiUrl = process.env.BACKEND_API_URL ?? "http://localhost:8000";
const paypalWebhookHeaders = [
  "paypal-auth-algo",
  "paypal-cert-url",
  "paypal-transmission-id",
  "paypal-transmission-sig",
  "paypal-transmission-time",
] as const;

export async function POST(request: Request) {
  try {
    const headers = new Headers({ "Content-Type": "application/json" });
    for (const name of paypalWebhookHeaders) {
      const value = request.headers.get(name);
      if (value) {
        headers.set(name, value);
      }
    }

    const response = await fetch(`${backendApiUrl}/paypal/responce`, {
      method: "POST",
      headers,
      body: await request.text(),
      cache: "no-store",
    });

    return new Response(await response.text(), {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") ?? "application/json",
      },
    });
  } catch (error) {
    console.error("PayPal webhook forwarding failed:", error);
    return NextResponse.json(
      { success: false, message: "PayPal webhook service is unavailable." },
      { status: 503 },
    );
  }
}
