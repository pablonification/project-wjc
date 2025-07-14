"use client";
import Image from "next/image";
import Link from "next/link";

const HomeBeritaCard = ({href, img, alt, category, date, title, description}) => {
  return (
    <Link href={href} className="flex flex-col gap-6">
        <div className="relative min-h-[200px] lg:min-h-[240px]">
          <Image
          src={img}
          alt={alt}
          fill
          className="object-cover"
          />
        </div>
        <div className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
                <p className="text-[#F67C73] text-[14px]">{category}</p>
                <p className="text-gray-200 text-[14px]">|</p>
                <p className="text-gray-200 text-[14px]">{date}</p>
            </div>
            <h1 className="text-white text-b1 lg:text-[20px]">{title}</h1>
            <p className="text-gray-200">{description}</p>
        </div>
    </Link>
  )
}

export default HomeBeritaCard