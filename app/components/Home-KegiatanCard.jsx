"use client";
import Image from "next/image";
import Link from "next/link";
import { Location } from "../../public/assets/image";

const HomeKegiatanCard = ({href, img, alt, date, description, lokasi}) => {
  return (
    <Link href={href} className="flex gap-4">
      <div className="relative w-[200px] h-[200px] md:w-[160px] md:h-[160px] flex-shrink-0">
        <Image
          src={img}
          alt={alt}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex flex-col justify-center gap-3 text-white">
        <p className="text-sh1 text-white lg:text-[24px]">{date}</p>
        <p className="text-b2 lg:text-b1">{description}</p>
        <div className="flex gap-1">
          <Image src={Location} alt="location" width={20} height={20} />
          <p className="text-gray-200">{lokasi}</p>
        </div>
      </div>
    </Link>
  );
};

export default HomeKegiatanCard;
