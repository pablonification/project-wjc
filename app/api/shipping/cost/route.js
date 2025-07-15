import { NextResponse } from "next/server";

const BITESHIP_API_KEY = process.env.BITESHIP_API_KEY;
const BITESHIP_BASE_URL = 'https://api.biteship.com/v1';

export async function POST(request) {
  if (!BITESHIP_API_KEY) {
    return NextResponse.json({ message: 'Biteship API key not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { origin_postal_code, destination_postal_code, items } = body;

    if (!origin_postal_code || !destination_postal_code || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { message: 'origin_postal_code, destination_postal_code, and items are required' },
        { status: 400 }
      );
    }
    
    // List of available couriers. Can be adjusted as needed.
    const couriers = "jne,jnt,sicepat,anteraja";

    const payload = {
      origin_postal_code,
      destination_postal_code,
      couriers,
      items
    };

    const response = await fetch(`${BITESHIP_BASE_URL}/rates/couriers`, {
      method: 'POST',
      headers: {
        'Authorization': BITESHIP_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error('Biteship rates error:', data);
      return NextResponse.json(
        { message: data.error || 'Failed to calculate shipping cost' },
        { status: response.status || 500 }
      );
    }

    return NextResponse.json(data.pricing, { status: 200 });

  } catch (error) {
    console.error('Error calculating Biteship shipping cost:', error);
    return NextResponse.json(
      { message: 'Failed to calculate shipping cost' },
      { status: 500 }
    );
  }
} 