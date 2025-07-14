import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

export async function POST(request) {
  try {
    const { name, password, phoneNumber: rawPhoneNumber } = await request.json();

    // Validasi input dasar
    if (!name || !password || !rawPhoneNumber) {
      return NextResponse.json({ message: 'Semua field wajib diisi.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: 'Password minimal harus 6 karakter.' }, { status: 400 });
    }

    // Normalisasi nomor telepon
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
      // Seharusnya tidak terjadi jika alur OTP benar, tapi ini sebagai pengaman
      return NextResponse.json({ message: 'Nomor telepon tidak diizinkan.' }, { status: 403 });
    }

    // Hashing password sebelum disimpan (SANGAT PENTING!)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Membuat user baru di database
    const user = await prisma.user.create({
      data: {
        name,
        phoneNumber: normalizedPhoneNumber,
        password: hashedPassword,
        // Menghubungkan user ke whitelist
        whitelist: {
          connect: { id: whitelistEntry.id },
        },
      },
    });

    // Menghapus password dari objek yang dikirim kembali ke client
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    console.error("Error saat registrasi:", error);
    return NextResponse.json({ message: 'Gagal melakukan registrasi.' }, { status: 500 });
  }
}