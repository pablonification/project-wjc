// app/home-sections/BeritaSection.jsx

import Image from 'next/image';
import { ArrowOutward, Placeholder } from '../../../public/assets/image';
import { HomeBeritaCard } from "../../components";

// Helper function untuk mengambil data berita terbaru dari API
async function getLatestNews() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const res = await fetch(`${baseUrl}/api/berita`, { cache: 'no-store' });

    if (!res.ok) {
      console.error("Gagal mengambil data berita untuk homepage");
      return [];
    }
    const allNews = await res.json();
    // Ambil 3 berita teratas.
    return allNews.slice(0, 3);
  } catch (error) {
    console.error("Error di getLatestNews:", error);
    return [];
  }
}

const BeritaSection = async () => {
  const latestNews = await getLatestNews();

  return (
    <div className='flex flex-col gap-6 mx-6 lg:mx-18 my-10'>
      <div className='text-white flex items-center justify-between '>
        <h1 className='text-h2 lg:text-h1'>Berita Terkini</h1>
        <div>
          <a href="/berita" className='flex gap-2 items-center'>
            <p className='text-b1 lg:text-[20px]'>Lihat Semua</p>
            <Image
              src={ArrowOutward}
              alt='arrow'
            />
          </a>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestNews.map((berita) => (
            <HomeBeritaCard
              key={berita.id}
              href={`/berita/${berita.slug}`}
              img={berita.imageUrl || Placeholder.src}
              alt={berita.title}
              category={berita.category}
              title={berita.title}
              date={new Date(berita.createdAt).toLocaleDateString("id-ID", {
                day: "numeric", month: "long", year: "numeric"
              })}
              description={berita.content} 
            />
          ))}
      </div>
    </div>
  );
}

export default BeritaSection;