import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  // Menghapus cookie
  cookieStore.set('token', '', { httpOnly: true, maxAge: -1, path: '/' });
  return NextResponse.json({ message: 'Logout berhasil' }, { status: 200 });
}