import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import prisma from '@/lib/prisma';

const getJwtSecretKey = () => new TextEncoder().encode(process.env.JWT_SECRET);

// Fungsi untuk generate JWT baru
async function generateToken(user) {
  return await new SignJWT({
    userId: user.id,
    name: user.name,
    phoneNumber: user.phoneNumber,
    role: user.role,
    nickname: user.nickname,
    chapter: user.chapter,
    ktpUrl: user.ktpUrl,
    ktpPublicId: user.ktpPublicId,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getJwtSecretKey());
}

// Handler untuk GET (mengambil data profil)
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Tidak terautentikasi.' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, await getJwtSecretKey());
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        role: true,
        nickname: true,
        chapter: true,
        ktpUrl: true,
        ktpPublicId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'User tidak ditemukan.' }, { status: 404 });
    }
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Sesi tidak valid.' }, { status: 401 });
  }
}

// Handler untuk PUT (memperbarui data profil)
export async function PUT(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Tidak terautentikasi.' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, await getJwtSecretKey());
    const { name, nickname, chapter, ktpUrl, ktpPublicId } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ message: 'Nama tidak boleh kosong.' }, { status: 400 });
    }
    if (!nickname || !chapter || !ktpUrl || !ktpPublicId) {
      return NextResponse.json({ message: 'Semua field wajib diisi.' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: { name, nickname, chapter, ktpUrl, ktpPublicId },
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        role: true,
        nickname: true,
        chapter: true,
        ktpUrl: true,
        ktpPublicId: true,
      },
    });

    // Generate JWT baru dan set cookie
    const newToken = await generateToken(updatedUser);

    const response = NextResponse.json({ user: updatedUser }, { status: 200 });
    response.cookies.set('token', newToken, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ message: 'Sesi tidak valid atau gagal memperbarui.' }, { status: 401 });
  }
}