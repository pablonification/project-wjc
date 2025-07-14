import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

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

// Handler untuk DELETE (menghapus user)
export async function DELETE(request) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ message: 'Tidak terautentikasi.' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, await getJwtSecretKey());
    const { id: userIdToDelete } = await request.json();

    // Best Practice: Mencegah admin menghapus akunnya sendiri
    if (payload.userId === userIdToDelete) {
      return NextResponse.json({ message: 'Anda tidak dapat menghapus akun Anda sendiri.' }, { status: 403 });
    }

    // Cari user yang akan dihapus untuk mendapatkan whitelistId-nya
    const userToDelete = await prisma.user.findUnique({
      where: { id: userIdToDelete },
      select: { whitelistId: true }
    });

    if (!userToDelete) {
        return NextResponse.json({ message: 'User tidak ditemukan.' }, { status: 404 });
    }

    // Karena relasi kita `onDelete: Cascade`, menghapus Whitelist akan menghapus User.
    // Ini adalah cara yang aman untuk menghapus keduanya.
    await prisma.whitelist.delete({
        where: { id: userToDelete.whitelistId }
    });

    return NextResponse.json({ message: 'User berhasil dihapus.' }, { status: 200 });
  } catch (error) {
    console.error("Error saat menghapus user:", error);
    return NextResponse.json({ message: 'Gagal menghapus user.' }, { status: 500 });
  }
}
