import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  // Jika tidak ada token, berarti tidak ada yang login
  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  try {
    // Verifikasi token menggunakan secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Kirim semua data penting dari token
    return NextResponse.json({
      user: {
        id: decoded.userId,
        name: decoded.name,
        role: decoded.role,
        phoneNumber: decoded.phoneNumber,
        nickname: decoded.nickname,  
        chapter: decoded.chapter,
        ktpUrl: decoded.ktpUrl,
        ktpPublicId: decoded.ktpPublicId,
      }
    }, { status: 200 });
  } catch (error) {
    // Jika token tidak valid (misal: kedaluwarsa atau salah), dianggap tidak ada sesi
    return NextResponse.json({ user: null }, { status: 200 });
  }
}