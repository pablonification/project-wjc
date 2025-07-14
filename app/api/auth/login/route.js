import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { phoneNumber: rawPhoneNumber, password } = await request.json();

    if (!rawPhoneNumber || !password) {
      return NextResponse.json({ message: 'Nomor telepon dan password wajib diisi.' }, { status: 400 });
    }

    const phoneNumberObj = parsePhoneNumberFromString(rawPhoneNumber, 'ID');
    if (!phoneNumberObj || !phoneNumberObj.isValid()) {
      return NextResponse.json({ message: 'No. telpon tidak ditemukan.' }, { status: 400 });
    }
    const normalizedPhoneNumber = phoneNumberObj.format('E.164');

    const user = await prisma.user.findUnique({
      where: { phoneNumber: normalizedPhoneNumber },
    });

    if (!user) {
      return NextResponse.json({ message: 'Kredensial tidak valid.' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Password salah.' }, { status: 401 });
    }

    const token = jwt.sign(
      { userId: user.id, name: user.name, phoneNumber: user.phoneNumber, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return NextResponse.json({ message: 'Login berhasil!' }, { status: 200 });

  } catch (error) {
    console.error("Error saat login:", error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
