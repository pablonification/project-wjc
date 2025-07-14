import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; 
import crypto from 'crypto';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const otpSecret = process.env.OTP_SECRET;

export async function POST(request) {
  if (!otpSecret) {
    return NextResponse.json({ message: 'Konfigurasi server tidak lengkap: OTP_SECRET tidak ditemukan.' }, { status: 500 });
  }

  try {
    const { phoneNumber: rawPhoneNumber, otp } = await request.json();

    if (!rawPhoneNumber || !otp) {
      return NextResponse.json({ message: 'Nomor telepon dan OTP wajib diisi.' }, { status: 400 });
    }

    // Normalisasi nomor telepon
    const phoneNumberObj = parsePhoneNumberFromString(rawPhoneNumber, 'ID');
    if (!phoneNumberObj || !phoneNumberObj.isValid()) {
      return NextResponse.json({ message: 'Format nomor telepon tidak valid.' }, { status: 400 });
    }
    const normalizedPhoneNumber = phoneNumberObj.format('E.164');

    // Ambil OTP dari database
    const storedOtpRecord = await prisma.otp.findFirst({
      where: { phoneNumber: normalizedPhoneNumber },
      orderBy: { createdAt: 'desc' },
    });

    if (!storedOtpRecord) {
      return NextResponse.json({ message: 'Kode OTP tidak ditemukan atau sudah kedaluwarsa.' }, { status: 400 });
    }

    // Pisahkan hash dan waktu kedaluwarsa dari token yang tersimpan
    const [storedHash, expiryTime] = storedOtpRecord.token.split('.');
    const expires = new Date(parseInt(expiryTime, 10));

    // Cek apakah OTP sudah kedaluwarsa
    if (expires < new Date()) {
      // Hapus OTP yang sudah kedaluwarsa dari database
      await prisma.otp.delete({ where: { id: storedOtpRecord.id } });
      return NextResponse.json({ message: 'Kode OTP sudah kedaluwarsa. Mohon kirim ulang.' }, { status: 400 });
    }

    // Hash dari OTP yang dimasukkan pengguna
    const providedHash = crypto.createHmac('sha256', otpSecret).update(otp).digest('hex');

    // Membandingkan hash
    if (providedHash !== storedHash) {
      return NextResponse.json({ message: 'Kode OTP salah.' }, { status: 400 });
    }

    // Hapus otp setelah dipakai
    await prisma.otp.delete({ where: { id: storedOtpRecord.id } });

    return NextResponse.json({ message: 'OTP berhasil diverifikasi.' }, { status: 200 });

  } catch (error) {
    console.error("Error verifying OTP for reset:", error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server saat verifikasi OTP.' }, { status: 500 });
  }
}