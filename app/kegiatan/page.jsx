import { Navbar, Footer, BannerAd } from "../components";
import { performRequest } from '../../lib/datocms';
import { ALL_KEGIATAN_QUERY } from '../../lib/queries';
import { KegiatanListClient } from './KegiatanListClient';

export default async function KegiatanPage() {
  console.log("ALL_KEGIATAN_QUERY:", ALL_KEGIATAN_QUERY);

  try {
    const { allKegiatans } = await performRequest(ALL_KEGIATAN_QUERY);

    if (!allKegiatans || allKegiatans.length === 0) {
      return (
        <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
          <Navbar />
          <section className="bg-[#1F1F1F] font-manrope">
            <div className="container mx-auto px-4 sm:px-6 lg:px-28 py-24">
              <h1 className="text-display font-manrope font-bold text-white translate-y-16">Kegiatan</h1>
            </div>
          </section>
          <div className="flex-grow container mx-auto px-4 sm:px-6 lg:px-28 py-24 text-white text-center">
            Tidak ada kegiatan yang tersedia saat ini.
          </div>
          <Footer />
        </div>
      );
    }

    return (
      <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
        <section className="bg-[#1F1F1F] font-manrope">
          <div className="container mx-auto px-4 sm:px-6 lg:px-28 py-24">
            <h1 className="text-display font-manrope font-bold text-white translate-y-16">
              Kegiatan
            </h1>
          </div>
        </section>
        {/* <BannerAd page="kegiatan" />  harusnya nanti ini di client*/}
        <KegiatanListClient activities={allKegiatans} />
        <Footer />
      </div>
    );
  } catch (error) {
    console.error("Gagal mengambil data dari DatoCMS:", error);
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Terjadi kesalahan. Silakan coba lagi.
      </div>
    );
  }
}