import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

/**
 * Handler untuk GET request
 * Mengambil semua nomor telepon dari whitelist
 */
export async function GET() {
  try {
    // Menggunakan prisma untuk mencari semua data di model Whitelist
    const whitelist = await prisma.whitelist.findMany({
      orderBy: {
        createdAt: 'desc', // Mengurutkan dari yang terbaru
      },
    });
    // Mengirim kembali data sebagai JSON dengan status 200 (OK)
    return NextResponse.json(whitelist, { status: 200 });
  } catch (error) {
    console.error("Gagal mengambil data whitelist:", error);
    // Jika terjadi error di server, kirim respons error
    return NextResponse.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

/**
 * Handler untuk POST request
 * Menambahkan nomor telepon baru dengan validasi dan normalisasi format.
 */
export async function POST(request) {
  try {
    const { phoneNumber: rawPhoneNumber } = await request.json();

    if (!rawPhoneNumber || rawPhoneNumber.trim() === '') {
      return NextResponse.json({ message: 'Nomor telepon tidak boleh kosong' }, { status: 400 });
    }

    // Validasi dan Normalisasi menggunakan library
    // Kita asumsikan default negara adalah Indonesia ('ID')
    const phoneNumber = parsePhoneNumberFromString(rawPhoneNumber, 'ID');

    if (!phoneNumber || !phoneNumber.isValid()) {
      return NextResponse.json({ message: 'Format nomor telepon tidak valid.' }, { status: 400 });
    }

    // Normalisasi ke format E.164 (+62...) untuk disimpan di DB
    const normalizedPhoneNumber = phoneNumber.format('E.164');

    // Cek duplikasi menggunakan nomor yang sudah dinormalisasi
    const existingNumber = await prisma.whitelist.findUnique({
      where: { phoneNumber: normalizedPhoneNumber },
    });

    if (existingNumber) {
      return NextResponse.json({ message: 'Nomor telepon sudah ada di dalam whitelist' }, { status: 409 });
    }

    // Simpan nomor yang sudah dinormalisasi ke database
    const newWhitelistEntry = await prisma.whitelist.create({
      data: {
        phoneNumber: normalizedPhoneNumber,
      },
    });

    return NextResponse.json(newWhitelistEntry, { status: 201 });
  } catch (error) {
    console.error("Gagal menambahkan nomor ke whitelist:", error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}

/**
 * Handler untuk DELETE request
 * Menghapus nomor telepon dari whitelist berdasarkan ID
 */
const getJwtSecretKey = () => new TextEncoder().encode(process.env.JWT_SECRET);

export async function DELETE(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Tidak terautentikasi.' }, { status: 401 });
    }
    const { payload } = await jwtVerify(token, await getJwtSecretKey());

    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ message: 'ID tidak boleh kosong' }, { status: 400 });
    }

    // Cari whitelist yang akan dihapus
    const whitelist = await prisma.whitelist.findUnique({ where: { id } });
    if (!whitelist) {
      return NextResponse.json({ message: 'Whitelist tidak ditemukan' }, { status: 404 });
    }

    // Cari user yang sedang login
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { phoneNumber: true }
    });

    // Cek apakah nomor whitelist ini milik user yang sedang login
    if (user && user.phoneNumber === whitelist.phoneNumber) {
      return NextResponse.json({ message: 'Anda tidak dapat menghapus whitelist milik sendiri.' }, { status: 403 });
    }

    // Lanjut hapus jika bukan milik sendiri
    await prisma.whitelist.delete({ where: { id } });
    return NextResponse.json({ message: 'Nomor berhasil dihapus' }, { status: 200 });
  } catch (error) {
    console.error("Gagal menghapus nomor dari whitelist:", error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server' }, { status: 500 });
  }
}