import Image from 'next/image';
import {ArrowOutward, Placeholder} from '../../public/assets/image'
import { HomeBeritaCard } from "../components"

const BeritaSection = () => {
  const beritaData = [
    {
      id: 1,
      href: "/",
      imageUrl: Placeholder,
      alt: "placeholder",
      category:"Kategori",
      date:"12 Juli 2025",
      title: "Lorem Ipsum Dolor Sit Amet",
      description: "Lorem ipsum dolor sit amet consectetur. In facilisis dolor ut at non. Ultrices pharetra consectetur tempus iaculis consequat amet phasellus ac.",
    },
    {
      id: 2,
      href: "/",
      imageUrl: Placeholder,
      alt: "placeholder",
      category:"Kategori",
      date:"14 Juli 2025",
      title: "Lorem Ipsum Dolor Sit Amet",
      description: "Lorem ipsum dolor sit amet consectetur. In facilisis dolor ut at non. Ultrices pharetra consectetur tempus iaculis consequat amet phasellus ac.",
    },
    {
      id: 3,
      href: "/",
      imageUrl: Placeholder,
      alt: "placeholder",
      category:"Kategori",
      date:"16 Juli 2025",
      title: "Lorem Ipsum Dolor Sit Amet",
      description: "Lorem ipsum dolor sit amet consectetur. In facilisis dolor ut at non. Ultrices pharetra consectetur tempus iaculis consequat amet phasellus ac.",
    }
  ]
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
          {beritaData.map((berita) => (
            <HomeBeritaCard
              key={berita.id}
              href={berita.href}
              img={berita.imageUrl}
              alt={berita.alt}
              category={berita.category}
              title={berita.title}
              date={berita.date}
              description={berita.description} 
            />
          ))}
      </div>
    </div>
  )
}

export default BeritaSection