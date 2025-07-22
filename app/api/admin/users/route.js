import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import cloudinary from 'cloudinary';

const getJwtSecretKey = () => new TextEncoder().encode(process.env.JWT_SECRET);

// Handler untuk GET (melihat semua user)
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Gagal mengambil data pengguna.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Tidak terautentikasi.' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, await getJwtSecretKey());
    const { id: userIdToDelete } = await request.json();

    if (payload.userId === userIdToDelete) {
      return NextResponse.json({ message: 'Anda tidak dapat menghapus akun Anda sendiri.' }, { status: 403 });
    }

    // Ambil user beserta whitelistId dan ktpPublicId
    const userToDelete = await prisma.user.findUnique({
      where: { id: userIdToDelete },
      select: { whitelistId: true, ktpPublicId: true }
    });

    if (!userToDelete) {
      return NextResponse.json({ message: 'User tidak ditemukan.' }, { status: 404 });
    }

    // Hapus file Cloudinary jika ada ktpPublicId
    if (userToDelete.ktpPublicId) {
      cloudinary.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      try {
        await cloudinary.v2.uploader.destroy(userToDelete.ktpPublicId);
      } catch (err) {
        console.error('Gagal hapus file Cloudinary:', err);
      }
    }

    // Hapus user dari database
    await prisma.user.delete({
      where: { id: userIdToDelete }
    });

    return NextResponse.json({ message: 'User berhasil dihapus.' }, { status: 200 });
    
  } catch (error) {
    console.error("Error saat menghapus user:", error);
    return NextResponse.json({ message: 'Gagal menghapus user.' }, { status: 500 });
  }
}
