"use client";
import Image from "next/image";
import Link from "next/link";
import { Location } from "../../public/assets/image";

const HomeKegiatanCard = ({slug, img, alt, date, description, lokasi, title}) => {
  return (
    <Link href={`/kegiatan/${slug}`} className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full min-h-[200px] sm:w-[200px] md:min-h-[200px] flex-shrink-0">
          <Image
          src={img}
          alt={alt}
          fill
          className="object-cover"
          />
        </div>
      <div className="flex flex-col justify-center gap-2 text-white">
        <h1 className="text-h1 text-white font-semibold">{title}</h1>
        <p className="text-sh1 text-white lg:text-[24px]">{date}</p>
        <p className="text-b2 lg:text-b1">{description}</p>
        <div className="flex gap-2 items-center ">
          <Image src={Location} alt="location"  className="flex w-[24px] h-[24px] flex-shrink-0 "/>
          <p className="text-gray-200">{lokasi}</p>
        </div>
      </div>
    </Link>
  );
};

export default HomeKegiatanCard;
