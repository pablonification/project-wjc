import { NextResponse } from "next/server";

const BITESHIP_API_KEY = process.env.BITESHIP_API_KEY;
const BITESHIP_BASE_URL = 'https://api.biteship.com/v1';

export async function GET(request) {
  if (!BITESHIP_API_KEY) {
    return NextResponse.json({ message: 'Biteship API key not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');

  if (!search) {
    return NextResponse.json({ message: 'Search query is required' }, { status: 400 });
  }

  try {
    // Cari berdasarkan kode pos (lebih akurat menurut dokumentasi)
    const response = await fetch(
      `${BITESHIP_BASE_URL}/maps/areas?countries=ID&input=${encodeURIComponent(search)}`,
      {
        headers: {
          'Authorization': BITESHIP_API_KEY,
        },
        cache: 'no-store'
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error('Biteship search error:', data);
      return NextResponse.json(
        { message: data.error || 'Failed to search for areas' },
        { status: response.status || 500 }
      );
    }
    
    return NextResponse.json(data.areas, { status: 200 });

  } catch (error) {
    console.error('Error searching Biteship areas:', error);
    return NextResponse.json({ message: 'Failed to search for areas' }, { status: 500 });
  }
} 