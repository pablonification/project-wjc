import { NextResponse } from 'next/server';

const customerId = process.env.MC_CUSTOMER_ID;
const authToken = process.env.MC_AUTH_TOKEN;

export async function POST(request) {
  if (!customerId || !authToken) {
    console.error("Kesalahan Konfigurasi: Variabel lingkungan MessageCentral tidak diatur.");
    return NextResponse.json({ message: 'Konfigurasi server tidak lengkap.' }, { status: 500 });
  }

  try {
    const { otp, verificationId } = await request.json();
    if (!otp || !verificationId) {
      return NextResponse.json({ message: 'Data tidak lengkap. OTP dan ID verifikasi wajib diisi.' }, { status: 400 });
    }
    
    const mcUrl = `https://cpaas.messagecentral.com/verification/v3/validateOtp?verificationId=${verificationId}&customerId=${customerId}&code=${otp}`;

    const mcResponse = await fetch(mcUrl, {
      method: 'GET',
      headers: { 'authToken': authToken },
    });

    const responseData = await mcResponse.json();

    if (!mcResponse.ok || responseData.responseCode !== 200) {
        console.error("Gagal validasi OTP dari MessageCentral:", responseData);
        const errorMessage = responseData.message || 'Kode OTP salah atau sudah kedaluwarsa.';
        return NextResponse.json({ message: "Kode OTP Salah!" }, { status: 400 }); // Selalu kirim status 400 untuk error OTP
    }

    return NextResponse.json({ message: 'Verifikasi berhasil.' }, { status: 200 });

  } catch (error) {
    console.error("Error saat verifikasi OTP:", error);
    return NextResponse.json({ message: 'Gagal memverifikasi OTP.' }, { status: 500 });
  }
}