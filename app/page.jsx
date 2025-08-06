import { HeroSection, TentangSection, KegiatanSection, BeritaSection } from './home-sections';
import { Navbar, Footer } from './components';

async function getLandingPageContent() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/landing-page`, { 
      next: { tags: ['landing-page'] } 
    });
    
    if (!res.ok) throw new Error('Gagal mengambil data landing page');
    
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Error di getLandingPageContent:", error);
    // fallback
    return {
      heroTitle: "Selamat Datang di Toko Buku Dago",
      heroDescription: "Temukan berbagai macam buku dan kegiatan literasi menarik.",
      heroButton: "Jelajahi Sekarang",
      heroImageUrl: null,
      tentangTitle: "Tentang Toko Buku Dago",
      tentangDescription: "Kami adalah pusat literasi yang menyediakan buku berkualitas dan menyelenggarakan berbagai kegiatan komunitas.",
      tentangButton: "Selengkapnya",
      tentangImageUrl: null,
    };
  }
}


export default async function Page() {
  const landingPageContent = await getLandingPageContent();

  return (
    <div className="flex flex-col min-h-screen bg-black">
        <div className="flex-1">
            <HeroSection content={landingPageContent} />
            <KegiatanSection />
            <TentangSection content={landingPageContent} />
            <BeritaSection />
        </div>
        <Footer />
    </div>
  );
};