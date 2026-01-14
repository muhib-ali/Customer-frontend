import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    const response = await fetch(`${backendUrl}/wishlist`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Forward auth token to backend
        ...(authHeader && { 'Authorization': authHeader }),
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API error:', response.status, errorText);
      return NextResponse.json(
        { 
          statusCode: response.status,
          status: false, 
          message: `Backend API error: ${response.status}`,
          heading: 'Wishlist',
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
        statusCode: 500,
        status: false, 
        message: 'Internal server error',
        heading: 'Wishlist',
        data: []
      },
      { status: 500 }
    );
  }
}
