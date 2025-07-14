import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

import { parsePhoneNumberFromString } from 'libphonenumber-js';

export async function POST(request) {
  try {
    const { phoneNumber: rawPhoneNumber, otp } = await request.json();
    if (!rawPhoneNumber || !otp) {
      return NextResponse.json({ message: 'Data tidak lengkap.' }, { status: 400 });
    }

    const phoneNumberObj = parsePhoneNumberFromString(rawPhoneNumber, 'ID');
    if (!phoneNumberObj || !phoneNumberObj.isValid()) {
        return NextResponse.json({ message: 'Format nomor telepon tidak valid.' }, { status: 400 });
    }
    const normalizedPhoneNumber = phoneNumberObj.format('E.164'); // Format: +62...

    // Cari OTP terakhir untuk nomor telp yg request
    const otpEntry = await prisma.otp.findFirst({
      where: { phoneNumber: normalizedPhoneNumber },
      orderBy: { createdAt: 'desc' },
    });

    // Cek  OTP ada dan belum kedaluwarsa
    if (!otpEntry || new Date() > otpEntry.expires) {
      return NextResponse.json({ message: 'Kode OTP salah atau sudah kedaluwarsa.' }, { status: 400 });
    }

    // Verifikasi hash OTP
    const [storedHash] = otpEntry.token.split('.');
    const secret = process.env.OTP_SECRET;
    const hash = crypto.createHmac('sha256', secret).update(otp).digest('hex');

    if (hash !== storedHash) {
      return NextResponse.json({ message: 'Kode OTP salah.' }, { status: 400 });
    }

    // Hapus otp setelah dipakai
    await prisma.otp.delete({ where: { id: otpEntry.id } });

    return NextResponse.json({ message: 'Verifikasi berhasil.' }, { status: 200 });

  } catch (error) {
    console.error("Error saat verifikasi OTP:", error);
    return NextResponse.json({ message: 'Gagal memverifikasi OTP.' }, { status: 500 });
  }
}
