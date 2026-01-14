import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const { productId } = params;
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    console.log('Remove Wishlist API - Auth Header:', authHeader ? 'Present' : 'Missing');
    console.log('Remove Wishlist API - ProductId:', productId);
    console.log('Remove Wishlist API - Backend URL:', `${backendUrl}/wishlist/remove/${productId}`);
    
    const response = await fetch(`${backendUrl}/wishlist/remove/${productId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Forward auth token to backend
        ...(authHeader && { 'Authorization': authHeader }),
      },
      cache: 'no-store',
    });

    console.log('Remove Wishlist API - Backend Response Status:', response.status);
    console.log('Remove Wishlist API - Backend Response OK:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend API error:', response.status, errorText);
      return NextResponse.json(
        { 
          statusCode: response.status,
          status: false, 
          message: `Backend API error: ${response.status}`,
          heading: 'Wishlist',
          data: {}
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Remove Wishlist API - Success Response:', data);
    return NextResponse.json(data);

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { 
        statusCode: 500,
        status: false, 
        message: 'Internal server error',
        heading: 'Wishlist',
        data: {}
      },
      { status: 500 }
    );
  }
}
