import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';

const getJwtSecretKey = () => new TextEncoder().encode(process.env.JWT_SECRET);

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
      select: { id: true, name: true, phoneNumber: true, role: true }, // Hanya pilih data yang aman
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
    const { name } = await request.json();

    if (!name || name.trim() === '') {
      return NextResponse.json({ message: 'Nama tidak boleh kosong.' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: payload.userId },
      data: { name },
      select: { id: true, name: true, phoneNumber: true, role: true },
    });

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Sesi tidak valid atau gagal memperbarui.' }, { status: 401 });
  }
}
