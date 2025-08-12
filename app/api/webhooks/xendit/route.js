// app/api/webhooks/xendit/route.js

import { NextResponse } from 'next/server';

// Webhook dinonaktifkan karena pembayaran beralih ke transfer manual.
export async function POST() {
  return NextResponse.json({ message: 'Webhook Xendit dinonaktifkan' }, { status: 410 });
}