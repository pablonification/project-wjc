import HeroSection from './home-sections/HeroSection';
import BeritaSection from './home-sections/BeritaSection';
import KegiatanSection from './home-sections/KegiatanSection';
import TentangSection from './home-sections/TentangSection';

import{Navbar, Footer} from './components'

const page = () => {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />
      <div className="flex-1">
        <HeroSection/>
        <KegiatanSection/>
        <TentangSection/>
        <BeritaSection/>
      </div>
      <Footer />
    </div>
  );
};

export default page;
