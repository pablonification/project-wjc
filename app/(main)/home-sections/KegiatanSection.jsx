import { HomeKegiatanCard } from "../../components";
import Image from 'next/image';
import { ArrowOutward, Placeholder } from '../../../public/assets/image';

async function getLatestActivities() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/kegiatan`, { cache: 'no-store' });

    if (!res.ok) {
      console.error("Gagal mengambil data kegiatan untuk homepage");
      return [];
    }

    const allActivities = await res.json();
    return allActivities.slice(0, 2);
  } catch (error) {
    console.error("Error di getLatestActivities:", error);
    return [];
  }
}

const KegiatanSection = async () => {
  const latestActivities = await getLatestActivities();

  return (
    <div className='text-white mx-6 lg:mx-18 my-10 flex flex-col gap-10'>
      <div className="flex justify-between items-center">
        <h1 className="text-h2 lg:text-h1">Kegiatan Terkini</h1>
        <div>
          <a href="/kegiatan" className="flex gap-2 items-center">
            <p className="text-b1 lg:text-[20px]">Lihat Semua</p>
            <Image src={ArrowOutward} alt="arrow"/>
          </a>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {latestActivities.map((kegiatan) => (
          <HomeKegiatanCard
            key={kegiatan.id}
            slug={kegiatan.slug}
            img={kegiatan.imageUrl || Placeholder}
            alt={kegiatan.title}
            date={new Date(kegiatan.dateStart).toLocaleDateString("id-ID", {
                day: 'numeric', month: 'long', year: 'numeric'
            })}
            description={kegiatan.description} 
            lokasi={kegiatan.location}
            title={kegiatan.title} 
          />
        ))}
      </div>
    </div>
  );
}

export default KegiatanSection;