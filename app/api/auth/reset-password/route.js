import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 
import bcrypt from 'bcryptjs'; 
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export async function POST(request) {
  try {
    const { phoneNumber: rawPhoneNumber, newPassword } = await request.json();

    if (!rawPhoneNumber || !newPassword) {
      return NextResponse.json({ message: 'Nomor telepon dan password baru wajib diisi.' }, { status: 400 });
    }

    // Normalisasi nomor telepon
    const phoneNumberObj = parsePhoneNumberFromString(rawPhoneNumber, 'ID');
    if (!phoneNumberObj || !phoneNumberObj.isValid()) {
      return NextResponse.json({ message: 'Format nomor telepon tidak valid.' }, { status: 400 });
    }
    const normalizedPhoneNumber = phoneNumberObj.format('E.164');
    // Cek nomor ada di db
    const user = await prisma.user.findUnique({
      where: { phoneNumber: normalizedPhoneNumber },
    });

    if (!user) {
      return NextResponse.json({ message: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: 'Password berhasil direset.' }, { status: 200 });

  } catch (error) {
    console.error("Error saat mereset password:", error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server saat mereset password.' }, { status: 500 });
  }
}