import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export async function POST(request) {
  try {
    const { name, nickname, chapter, password, phoneNumber: rawPhoneNumber, ktpUrl, ktpPublicId } = await request.json();

    // Validasi input dasar
    if (!name || !nickname || !chapter || !password || !rawPhoneNumber || !ktpUrl) {
      return NextResponse.json({ message: 'Semua field wajib diisi.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: 'Password minimal harus 6 karakter.' }, { status: 400 });
    }

    // Normalisasi nomor telepon (ubah ke format yg sesuai)
    const phoneNumberObj = parsePhoneNumberFromString(rawPhoneNumber, 'ID');
    if (!phoneNumberObj || !phoneNumberObj.isValid()) {
      return NextResponse.json({ message: 'Format nomor telepon tidak valid.' }, { status: 400 });
    }
    const normalizedPhoneNumber = phoneNumberObj.format('E.164');

    // Cek apakah user dengan nomor ini sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber: normalizedPhoneNumber },
    });
    if (existingUser) {
      return NextResponse.json({ message: 'User dengan nomor ini sudah terdaftar.' }, { status: 409 });
    }

    // Cari ID dari whitelist untuk relasi
    const whitelistEntry = await prisma.whitelist.findUnique({
      where: { phoneNumber: normalizedPhoneNumber },
    });
    if (!whitelistEntry) {
      return NextResponse.json({ message: 'Nomor telepon tidak diizinkan.' }, { status: 403 });
    }

    // Hashing password sebelum disimpan
    const hashedPassword = await bcrypt.hash(password, 10);

    // Membuat user baru di database
    const user = await prisma.user.create({
      data: {
        name,
        nickname,
        chapter,
        phoneNumber: normalizedPhoneNumber,
        password: hashedPassword,
        ktpUrl,
        ktpPublicId,
        whitelist: {
          connect: { id: whitelistEntry.id },
        },
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    console.error("Error saat registrasi:", error);
    return NextResponse.json({ message: 'Gagal melakukan registrasi.' }, { status: 500 });
  }
}