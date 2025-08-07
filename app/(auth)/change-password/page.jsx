// app/(auth)/change-password/page.jsx

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ChangePasswordClient from './ChangePasswordClient';
import { Navbar, Footer } from '../../components';

async function getUserData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    
    const cookieStore = await cookies(); 
    const tokenCookie = cookieStore.get('token');

    if (!tokenCookie?.value) {
      console.error("Cookie token tidak ditemukan.");
      return null;
    }

    const res = await fetch(`${baseUrl}/api/user/profile`, {
      headers: {
        Cookie: `token=${tokenCookie.value}`,
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error("Gagal mendapatkan data dari API profil.");
      return null;
    }
    
    const data = await res.json();
    return data.user;

  } catch (error) {
    console.error("Gagal mengambil data user di server:", error);
    return null;
  }
}


export default async function ChangePasswordServerPage() {
  const user = await getUserData();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="bg-[#181818] min-h-screen flex flex-col">
        <div className="flex-grow">
            <ChangePasswordClient userPhoneNumber={user.phoneNumber} />
        </div>
        <Footer />
    </div>
  );
};
