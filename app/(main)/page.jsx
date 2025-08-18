import { HeroSection, TentangSection, KegiatanSection, BeritaSection } from './home-sections';
import { Footer } from '../components';

export const dynamic = 'force-dynamic'

async function getLandingPageContent() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
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
      heroTitle: "Selamat datang teman-teman MedDocs WJC!",
      heroDescription: "Lorem ipsum dolor sit amet consectetur. Aliquam aliquam in faucibus pretium sit habitant vitae sollicitudin. Lobortis nisl tristique suscipit urna nullam.",
      heroButton: "Bergabung Dengan Kami",
      heroImageUrl: null,
      tentangTitle: "Kami adalah MedDocs WJC Dago",
      tentangDescription: "Lorem ipsum dolor sit amet consectetur. Rhoncus fringilla ipsum tellus semper a eget malesuada. Pulvinar pellentesque urna nunc quis in facilisi est fermentum. Arcu sed quis consectetur risus risus neque vestibulum massa cras. Malesuada ullamcorper non ac gravida aliquam enim nam morbi neque.",
      tentangButton: "Call to Action",
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