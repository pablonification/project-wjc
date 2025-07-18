import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET WhatsApp number for kegiatan
export async function GET() {
  const setting = await prisma.settings.findUnique({ where: { key: 'wa_kegiatan' } });
  return NextResponse.json({ number: setting?.value || '' });
}

// POST to update WhatsApp number for kegiatan
export async function POST(req) {
  const { number } = await req.json();
  if (!number) return NextResponse.json({ error: 'Nomor WA wajib diisi' }, { status: 400 });
  const setting = await prisma.settings.upsert({
    where: { key: 'wa_kegiatan' },
    update: { value: number },
    create: { key: 'wa_kegiatan', value: number },
  });
  return NextResponse.json({ number: setting.value });
} 