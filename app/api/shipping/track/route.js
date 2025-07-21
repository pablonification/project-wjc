import { NextResponse } from "next/server";

const BITESHIP_API_KEY = process.env.BITESHIP_API_KEY;
const BITESHIP_BASE_URL = 'https://api.biteship.com/v1';

export async function GET(request) {
  if (!BITESHIP_API_KEY) {
    return NextResponse.json({ message: 'Biteship API key not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const trackingId = searchParams.get('id');
  const courierCode = searchParams.get('courier');

  if (!trackingId || !courierCode) {
    return NextResponse.json({ message: 'Tracking ID dan kode kurir wajib diisi' }, { status: 400 });
  }

  try {
    const response = await fetch(
      `${BITESHIP_BASE_URL}/trackings/${trackingId}?courier_code=${courierCode}`,
      {
        headers: {
          'Authorization': BITESHIP_API_KEY,
        },
        cache: 'no-store'
      }
    );

    const data = await response.json();

    // Teruskan pesan error dari Biteship ke client
    if (!response.ok || !data.success) {
      console.error('Biteship tracking error:', data);
      const errorMessage = data.error || 'Gagal melacak pengiriman. Periksa kembali nomor resi dan kurir Anda.';
      return NextResponse.json(
        { message: errorMessage },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Error tracking shipment with Biteship:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan internal pada server' }, { status: 500 });
  }
}