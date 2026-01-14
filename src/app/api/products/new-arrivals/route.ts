import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // In development, proxy to the actual backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    
    const response = await fetch(`${backendUrl}/products/new-arrivals`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API error:', response.status, errorText);
      return NextResponse.json(
        { 
          status: false, 
          message: `Backend API error: ${response.status}`,
          data: [] 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { 
        status: false, 
        message: 'Internal server error',
        data: [] 
      },
      { status: 500 }
    );
  }
}
