import { NextRequest, NextResponse } from "next/server";

const CUSTOMER_API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { status: false, message: "Verification token is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${CUSTOMER_API_URL}/auth/verify-email/${token}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    
    // If verification successful, store in localStorage and show success page
    if (data.status && data.data?.email) {
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Email Verified</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f5f5f5; }
            .container { background: white; padding: 40px; border-radius: 10px; max-width: 500px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .success { color: #10b981; font-size: 48px; margin-bottom: 20px; }
            h1 { color: #333; margin-bottom: 20px; }
            p { color: #666; margin-bottom: 30px; }
            .btn { background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">✓</div>
            <h1>Email Verified Successfully!</h1>
            <p>Your email address has been verified. You can now return to the registration page to complete your account creation.</p>
            <a href="http://localhost:3007/login?tab=register" class="btn">Return to Registration</a>
          </div>
          <script>
            // Store verification in localStorage
            localStorage.setItem('verified_email', '${data.data.email}');
            localStorage.setItem('email_verified_at', Date.now().toString());
          </script>
        </body>
        </html>
      `;
      
      return new Response(html, {
        headers: { 'Content-Type': 'text/html' },
      });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error.message || "Failed to verify email" },
      { status: 500 }
    );
  }
}
