import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

const client = twilio(accountSid, authToken);
const OTP_COOLDOWN_SECONDS = 60;

export async function POST(request) {
  if (!accountSid || !authToken || !verifySid) {
    console.error("Konfigurasi Twilio Verify tidak lengkap.");
    return NextResponse.json({ message: 'Konfigurasi server tidak lengkap.' }, { status: 500 });
  }

  try {
    const { phoneNumber: rawPhoneNumber } = await request.json();
    if (!rawPhoneNumber) {
      return NextResponse.json({ message: 'Nomor telepon wajib diisi.' }, { status: 400 });
    }

    const phoneNumberObj = parsePhoneNumberFromString(rawPhoneNumber, 'ID');
    if (!phoneNumberObj || !phoneNumberObj.isValid()) {
      return NextResponse.json({ message: 'Format nomor telepon tidak valid.' }, { status: 400 });
    }
    const normalizedPhoneNumber = phoneNumberObj.format('E.164');
    
    const whitelistedNumber = await prisma.whitelist.findUnique({ where: { phoneNumber: normalizedPhoneNumber } });
    if (!whitelistedNumber) {
      return NextResponse.json({ message: 'Nomor tidak terdaftar di whitelist.' }, { status: 404 });
    }
    
    if (whitelistedNumber.lastOtpRequestAt) {
      const now = new Date();
      const lastRequestTime = new Date(whitelistedNumber.lastOtpRequestAt);
      const secondsSinceLastRequest = (now.getTime() - lastRequestTime.getTime()) / 1000;
      if (secondsSinceLastRequest < OTP_COOLDOWN_SECONDS) {
        const secondsToWait = Math.ceil(OTP_COOLDOWN_SECONDS - secondsSinceLastRequest);
        return NextResponse.json({ message: `Anda baru saja meminta kode. Mohon tunggu ${secondsToWait} detik lagi.` }, { status: 429 });
      }
    }

    const existingUser = await prisma.user.findUnique({ where: { phoneNumber: normalizedPhoneNumber } });
    if (existingUser) {
      return NextResponse.json({ message: 'Nomor ini sudah terdaftar. Silakan login.' }, { status: 409 });
    }

    // Mengirim verifikasi menggunakan Twilio Verify
    await client.verify.v2.services(verifySid)
      .verifications
      .create({ to: normalizedPhoneNumber, channel: 'whatsapp' });

    // Update timestamp cooldown
    await prisma.whitelist.update({
      where: { id: whitelistedNumber.id },
      data: { lastOtpRequestAt: new Date() },
    });

    // Tidak perlu mengirim verificationId ke frontend
    return NextResponse.json({ message: 'OTP telah dikirim.' }, { status: 200 });

  } catch (error) {
    console.error("Error saat mengirim OTP via Twilio Verify:", error);
    return NextResponse.json({ message: 'Gagal mengirim OTP.' }, { status: 500 });
  }
}