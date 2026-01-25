import { NextRequest, NextResponse } from "next/server";

const CUSTOMER_API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    const response = await fetch(`${CUSTOMER_API_URL}/auth/send-email-verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error.message || "Failed to send verification email" },
      { status: 500 }
    );
  }
}
