import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import twilio from 'twilio';
import crypto from 'crypto';

import { parsePhoneNumberFromString } from 'libphonenumber-js';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
const otpSecret = process.env.OTP_SECRET;


if (!accountSid || !authToken || !twilioWhatsappNumber || !otpSecret) {
  console.error("Kesalahan Konfigurasi: Variabel lingkungan Twilio atau OTP_SECRET tidak diatur.");
}

const twilioClient = twilio(accountSid, authToken);

export async function POST(request) {
  if (!accountSid || !authToken || !twilioWhatsappNumber || !otpSecret) {
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

    //Cek nomor ada di whitelist
    const whitelistedNumber = await prisma.whitelist.findUnique({
      where: { phoneNumber: normalizedPhoneNumber },
    });

    if (!whitelistedNumber) {
      return NextResponse.json({ message: 'Nomor tidak terdaftar di whitelist.' }, { status: 404 });
    }

    // Cek user dengan nomor ini sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { phoneNumber: normalizedPhoneNumber },
    });

    // Jika user sudah ada, kembalikan error dan tidak kirim OTP
    if (existingUser) {
      return NextResponse.json({ message: 'Nomor ini sudah terdaftar. Silakan login.' }, { status: 409 }); // 409 Conflict
    }

    // Pengiriman OTP
    await prisma.otp.deleteMany({
      where: { phoneNumber: normalizedPhoneNumber },
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000);
    const hash = crypto.createHmac('sha256', otpSecret).update(otp).digest('hex');
    const dataToStore = `${hash}.${expires.getTime()}`;

    await prisma.otp.create({
        data: {
            phoneNumber: normalizedPhoneNumber,
            token: dataToStore,
            expires
        }
    });

    await twilioClient.messages.create({
      from: twilioWhatsappNumber,
      to: `whatsapp:${whitelistedNumber.phoneNumber}`,
      contentSid: 'HX229f5a04fd0510ce1b071852155d3e75', // GANTI DENGAN CONTENT SID ANDA
      contentVariables: JSON.stringify({ '1': otp }),
    });

    return NextResponse.json({ message: 'OTP telah dikirim.' }, { status: 200 });

  } catch (error) {
    console.error("Error saat mengirim OTP:", error);
    return NextResponse.json({ message: 'Gagal mengirim OTP.' }, { status: 500 });
  }
}
