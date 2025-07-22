import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import cloudinary from 'cloudinary';

const getJwtSecretKey = () => new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request) {
  try {
    // Autentikasi user
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ message: 'Tidak terautentikasi.' }, { status: 401 });
    }
    await jwtVerify(token, await getJwtSecretKey());

    // Ambil publicId dari body
    const { publicId } = await request.json();
    if (!publicId) {
      return NextResponse.json({ message: 'publicId wajib diisi.' }, { status: 400 });
    }

    // Konfigurasi Cloudinary (pakai env server)
    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Hapus file di Cloudinary
    await cloudinary.v2.uploader.destroy(publicId);

    return NextResponse.json({ message: 'KTP berhasil dihapus dari Cloudinary.' }, { status: 200 });
  } catch (error) {
    console.error('Gagal hapus KTP Cloudinary:', error);
    return NextResponse.json({ message: 'Gagal menghapus KTP di Cloudinary.' }, { status: 500 });
  }
}