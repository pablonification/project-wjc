import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const customerId = process.env.MC_CUSTOMER_ID;
const authToken = process.env.MC_AUTH_TOKEN;

const OTP_COOLDOWN_SECONDS = 60;

export async function POST(request) {
  if (!customerId || !authToken) {
    console.error("Kesalahan Konfigurasi: Variabel lingkungan MessageCentral tidak diatur.");
    return NextResponse.json({ message: 'Konfigurasi server tidak lengkap.' }, { status: 500 });
  }

  try {
    const { phoneNumber: rawPhoneNumber } = await request.json();
    if (!rawPhoneNumber) {
      return NextResponse.json({ message: 'Nomor telepon wajib diisi.' }, { status: 400 });
    }

    // Normalisasi nomor telepon
    const phoneNumberObj = parsePhoneNumberFromString(rawPhoneNumber, 'ID');
    if (!phoneNumberObj || !phoneNumberObj.isValid()) {
      return NextResponse.json({ message: 'Format nomor telepon tidak valid.' }, { status: 400 });
    }
    const normalizedPhoneNumber = phoneNumberObj.format('E.164');
    
    // cek user di db
    const existingUser = await prisma.user.findUnique({ 
        where: { phoneNumber: normalizedPhoneNumber } 
    });

    // Jika pengguna TIDAK ditemukan, kirim error
    if (!existingUser) {
      return NextResponse.json({ message: 'Nomor telepon ini tidak terdaftar.' }, { status: 404 });
    }

    // rate limiting
    if (existingUser.lastOtpRequestAt) {
      const now = new Date();
      const lastRequestTime = new Date(existingUser.lastOtpRequestAt);
      const secondsSinceLastRequest = (now.getTime() - lastRequestTime.getTime()) / 1000;

      if (secondsSinceLastRequest < OTP_COOLDOWN_SECONDS) {
        const secondsToWait = Math.ceil(OTP_COOLDOWN_SECONDS - secondsSinceLastRequest);
        return NextResponse.json(
          { message: `Anda baru saja meminta kode. Mohon tunggu ${secondsToWait} detik lagi.` }, 
          { status: 429 }
        );
      }
    }

    const countryCode = phoneNumberObj.countryCallingCode;
    const mobileNumber = phoneNumberObj.nationalNumber;
    
    const mcUrl = `https://cpaas.messagecentral.com/verification/v3/send?countryCode=${countryCode}&customerId=${customerId}&flowType=WHATSAPP&mobileNumber=${mobileNumber}`;
    
    const mcResponse = await fetch(mcUrl, {
      method: 'POST',
      headers: { 'authToken': authToken },
    });

    const responseData = await mcResponse.json();

    if (!mcResponse.ok) {
      console.error("Gagal mengirim OTP dari MessageCentral:", responseData);
      const errorMessage = responseData.message || 'Gagal mengirim OTP.';
      return NextResponse.json({ message: errorMessage }, { status: mcResponse.status });
    }

    await prisma.user.update({
      where: { id: existingUser.id },
      data: { lastOtpRequestAt: new Date() },
    });

    return NextResponse.json({ 
        message: 'OTP telah dikirim.',
        verificationId: responseData.data?.verificationId 
    }, { status: 200 });

  } catch (error) {
    console.error("Error internal saat proses OTP Lupa Password:", error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}