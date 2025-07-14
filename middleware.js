
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose'; // Library yang lebih modern dan aman untuk JWT di Edge

// Fungsi untuk mendapatkan secret key
const getJwtSecretKey = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT Secret key is not set in environment variables!');
  }
  return new TextEncoder().encode(secret);
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const cookie = request.cookies.get('token');

  // --- Membatasi Halaman Login & Register ---
  // Jika pengguna sudah login, maka tidak boleh mengakses halaman login/register lagi.
  const authPages = ['/login', '/register'];
  if (authPages.includes(pathname)) {
    if (cookie) {
      // Jika ada cookie, arahkan ke halaman utama
      return NextResponse.redirect(new URL('/', request.url));
    }
    // Jika tidak ada cookie, bisa akses halaman login/register
    return NextResponse.next();
  }

  // --- Membatasai Halaman yang Membutuhkan Login ---
  // Semua halaman di bawah ini memerlukan pengguna untuk login.
  const protectedPages = ['/dashboard', '/profile'];
  if (protectedPages.some(path => pathname.startsWith(path))) {
    // Jika tidak ada cookie, langsung redirect ke halaman login
    if (!cookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Jika ada cookie, verifikasi tokennya
    try {
      const { payload } = await jwtVerify(cookie.value, await getJwtSecretKey());
      
      // --- Proteksi Dashboard Khusus Admin ---
      if (pathname.startsWith('/dashboard') && payload.role !== 'ADMIN') {
        // Jika bukan admin mencoba akses dashboard, redirect ke halaman utama
        return NextResponse.redirect(new URL('/', request.url));
      }

      // Jika token valid dan role sesuai, biarkan pengguna melanjutkan
      return NextResponse.next();

    } catch (err) {
      // Jika token tidak valid (kedaluwarsa, dll), redirect ke login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Untuk semua halaman lain yang tidak diproteksi, biarkan saja
  return NextResponse.next();
}

// Matcher untuk menentukan di halaman mana saja middleware ini akan berjalan.
export const config = {
  matcher: [
    '/login',
    '/register',
    '/dashboard/:path*', // Melindungi dashboard dan semua sub-pathnya
    '/profile/:path*',   // Melindungi profile dan semua sub-pathnya
  ],
};
