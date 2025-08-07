// app/profile/page.jsx

import { Navbar, Footer } from "../../components";
import ProfileClient from "./ProfileClient"; // Kita akan buat file ini selanjutnya
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Fungsi ini berjalan di server untuk mengambil data profil awal
async function getProfileData() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
    
    const sessionCookies = await cookies();

    const res = await fetch(`${baseUrl}/api/user/profile`, {
      headers: {
        Cookie: sessionCookies.toString(),
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }
    
    const data = await res.json();
    return data.user;
  } catch (error) {
    console.error("Gagal mengambil data profil di server:", error);
    return null;
  }
}

export default async function ProfilePage() {
  const user = await getProfileData();
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
      <ProfileClient initialUser={user} />
      <Footer />
    </div>
  );
}