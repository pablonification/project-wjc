import { NextResponse } from 'next/server';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;

const client = twilio(accountSid, authToken);

export async function POST(request) {
  if (!accountSid || !authToken || !verifySid) {
    console.error("Konfigurasi Twilio Verify tidak lengkap.");
    return NextResponse.json({ message: 'Konfigurasi server tidak lengkap.' }, { status: 500 });
  }

  try {
    // mengirim phoneNumber dan otp
    const { phoneNumber: rawPhoneNumber, otp } = await request.json();
    if (!rawPhoneNumber || !otp) {
      return NextResponse.json({ message: 'Nomor telepon dan OTP wajib diisi.' }, { status: 400 });
    }

    const phoneNumberObj = parsePhoneNumberFromString(rawPhoneNumber, 'ID');
    if (!phoneNumberObj || !phoneNumberObj.isValid()) {
      return NextResponse.json({ message: 'Format nomor telepon tidak valid.' }, { status: 400 });
    }
    const normalizedPhoneNumber = phoneNumberObj.format('E.164');

    // Memvalidasi OTP menggunakan Twilio Verify
    const verificationCheck = await client.verify.v2.services(verifySid)
      .verificationChecks
      .create({ to: normalizedPhoneNumber, code: otp });

    // Cek apakah statusnya "approved"
    if (verificationCheck.status === 'approved') {
      return NextResponse.json({ message: 'Verifikasi berhasil.' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Kode OTP salah atau sudah kedaluwarsa.' }, { status: 400 });
    }

  } catch (error) {
    console.error("Error saat verifikasi OTP via Twilio Verify:", error);
    // Error 20404 berarti OTP tidak ditemukan/salah
    if (error.code === 20404) {
        return NextResponse.json({ message: 'Kode OTP salah atau sudah kedaluwarsa.' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Gagal memverifikasi OTP.' }, { status: 500 });
  }
}