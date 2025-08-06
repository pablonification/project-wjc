import HeroSection from './home-sections/HeroSection';
import BeritaSection from './home-sections/BeritaSection';
import KegiatanSection from './home-sections/KegiatanSection';
import TentangSection from './home-sections/TentangSection';

import{Navbar, Footer} from './components'
import { performRequest } from '../lib/datocms';

const HERO_SECTION_QUERY = `
  query HeroSectionQuery {
    landingPage {
      title
      description
      heroImage {
        url
      }
    }
  }
`;

const page = async () => {
  const heroData = await performRequest(HERO_SECTION_QUERY);
  if (!heroData) {
    return <div>Konten tidak tersedia.</div>;
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <div className="flex-1">
        <HeroSection data={heroData.landingPage}/>
        <KegiatanSection/>
        <TentangSection/>
        <BeritaSection/>
      </div>
      <Footer />
    </div>
  );
};

export default page;
