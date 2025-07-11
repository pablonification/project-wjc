'use client'
import { HomeKegiatanCard } from "../components"
import Image from 'next/image';
import {ArrowOutward, Placeholder} from '../../public/assets/image'

const kegiatanData = [
  {
    id: 1,
    title: "Webinar 'Memulai Karier di Dunia Tech'",
    description: "Belajar dari para profesional tentang langkah pertama di industri teknologi, membahas tren, tips, dan peluang. Sesi interaktif dengan Q&A.",
    imageUrl: Placeholder,
    date: "10 Juli 2025",
    location: "Online via Zoom",
    href: "/kegiatan"
  },
  {
    id: 2,
    title: "Workshop Desain UI/UX Fundamental",
    description: "Pelajari dasar-dasar desain antarmuka pengguna dan pengalaman pengguna dengan studi kasus praktis dan proyek mini yang menarik.",
    imageUrl: Placeholder,
    date: "20 Agustus 2025",
    location: "Gedung Serbaguna Kota Bandung",
    href: "/kegiatan"
  },
];

const KegiatanSection = () => {
  return (
    <div className='text-white mx-18 my-20 flex flex-col gap-10'>
      <div className="flex justify-between">
        <h1 className="text-h2 lg:text-h1">Kegiatan Terkini</h1>
        <div>
          <a href="/kegiatan" className="flex gap-2">
            <p className="text-b1 lg:text-[20px]">Lihat Semua</p>
            <Image src={ArrowOutward} alt="arrow"/>
          </a>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {kegiatanData.map((kegiatan) => (
          <HomeKegiatanCard
            key={kegiatan.id}
            href={kegiatan.href}
            img={kegiatan.imageUrl}
            alt={kegiatan.title}
            date={kegiatan.date}
            description={kegiatan.description} 
            lokasi={kegiatan.location}
          />
        ))}
      </div>
    </div>
  )
}

export default KegiatanSection