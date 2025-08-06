'use client';

import Image from "next/image";
import Link from "next/link";

const CalendarIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
    className={`font-manrope ${props.className || ""}`}
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);


const KegiatanCard = ({
  title,
  description,
  date,
  location,
  status,
  slug,
  imageUrl,
}) => {
  const statusStyles = {
    Mendatang: "bg-blue-200 text-blue-800",
    "Sedang Berlangsung": "bg-[#F5CB58] text-black",
    Selesai: "bg-[#97D077] text-black",
  };

  return (
    <div className="flex flex-col md:flex-row font-manrope overflow-hidden">
      <div className="w-full md:w-1/3 flex-shrink-0 bg-[#D9D9D9] relative h-48 md:h-auto">
        {imageUrl && (
          <Image src={imageUrl} alt={title} fill className="object-cover" />
        )}
      </div>
      <div className="p-4 md:p-6 flex flex-col flex-grow font-manrope">
        <div>
          {status && (
            <div className="mb-2">
              <span className={`inline-block px-3 py-1 text-xs font-semibold font-manrope ${statusStyles[status]}`}>
                {status}
              </span>
            </div>
          )}
          <h3 className="text-xl lg:text-2xl font-bold text-white mb-2 font-manrope">
            {title}
          </h3>
          <p className="text-gray-400 leading-relaxed text-sm lg:text-b1 line-clamp-2 font-manrope">
            {description}
          </p>
        </div>

        <div className="mt-6 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center text-gray-400 text-b2 gap-x-4 gap-y-2 font-manrope">
            <span className="flex items-center font-manrope">
              <CalendarIcon className="mr-2 flex-shrink-0" />
              {date}
            </span>
            <span className="flex items-center font-manrope">
              <Image
                src="/assets/image/Location.png"
                alt="location"
                width={16}
                height={16}
                className="mr-2 flex-shrink-0"
              />
              {location}
            </span>
          </div>
          <Link
            href={`/kegiatan/${slug}`}
            className="text-white font-semibold flex items-center group text-base lg:text-sh1 font-manrope flex-shrink-0"
          >
            {status === "Mendatang" ? "Daftar Sekarang" : "Lihat Detail"}
            <Image
              src="/assets/image/ArrowOutward.png"
              alt="arrow"
              width={20}
              height={20}
              className="ml-2 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default KegiatanCard;