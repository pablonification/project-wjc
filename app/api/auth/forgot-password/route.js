import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import twilio from 'twilio';
import crypto from 'crypto';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;
const otpSecret = process.env.OTP_SECRET;

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

    // Normalisasi nomor telepon (jadi format twilio)
    const phoneNumberObj = parsePhoneNumberFromString(rawPhoneNumber, 'ID');
    if (!phoneNumberObj || !phoneNumberObj.isValid()) {
      return NextResponse.json({ message: 'Format nomor telepon tidak valid.' }, { status: 400 });
    }
    const normalizedPhoneNumber = phoneNumberObj.format('E.164');

    // Cek apakah user dengan nomor ini ada di database
    const user = await prisma.user.findUnique({
      where: { phoneNumber: normalizedPhoneNumber },
    });

    // Jika user tidak ditemukan, kirim pesan error 404
    if (!user) {
      return NextResponse.json({ message: 'Nomor telepon ini tidak terdaftar.' }, { status: 404 });
    }

    // Lanjutkan dengan logika pengiriman OTP yang sama seperti registrasi
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

    // Twilio API
    const message = await twilioClient.messages.create({
      from: twilioWhatsappNumber,
      contentSid: 'HX229f5a04fd0510ce1b071852155d3e75', 
      contentVariables: JSON.stringify({ '1': otp }),
      to: `whatsapp:${user.phoneNumber}`, 
    });

    console.log('Pesan berhasil dikirim dengan SID:', message.sid);

    return NextResponse.json({ message: 'OTP telah dikirim.' }, { status: 200 });

  } catch (error) {
    console.error("Error saat meminta reset password:", error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
