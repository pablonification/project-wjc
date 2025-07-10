"use client";
import { useState } from "react";
import { Navbar, Footer } from "@/app/components";
import Link from "next/link";
import Image from "next/image";
import RegistrationPopup from "@/app/components/RegistrationPopup";

const CalendarIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

export default function KegiatanDetail({ params }) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const description =
    "Lorem ipsum dolor sit amet consectetur. Interdum lectus porttitor adipiscing gravida. Malesuada pellentesque feugiat quis tempus donec. Nec in dignissim a pharetra id. Tortor lacus diam in adipiscing. Risus ullamcorper aliquam augue faucibus eu nulla. Mauris neque sed enim auctor egestas. Magna praesent cursus sagittis pharetra.";

  return (
    <div className="bg-black min-h-screen flex flex-col font-manrope text-white">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-28 py-16 font-manrope translate-y-28 mb-60">
        <div>
          <Link href="/kegiatan">
            <div className="flex items-center gap-2 text-sh1 text-gray-200 hover:text-white transition-colors mb-4 cursor-pointer group font-manrope">
              <Image
                src={"/arrow_back.svg"}
                alt="Kembali"
                width={24}
                height={24}
                className="transition-transform duration-200 group-hover:-translate-x-1"
              />
              Kembali
            </div>
          </Link>

          {/* Floated Image */}
          <div className="w-full lg:w-1/3 bg-[#D9D9D9] lg:float-right lg:ml-8 lg:-translate-y-10 mb-6 h-60" />

          <h1 className="text-h2 lg:text-h1 leading-tight mb-4 font-manrope">
            Lorem Ipsum Dolor Sit Amet
          </h1>

          <div className="flex items-center gap-6 text-b2 text-gray-200 mb-8">
            <span className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              12-15 Jul 2025
            </span>
            <span className="flex items-center gap-2">
              <Image
                src="/assets/image/Location.png"
                alt="location"
                width={20}
                height={20}
              />
              Alamat lokasi
            </span>
          </div>

          <button
            onClick={() => setIsPopupOpen(true)}
            className="w-full justify-center md:w-auto py-2 px-4 bg-red-600 flex items-center cursor-pointer font-manrope text-white text-b2 lg:text-b1"
          >
            Daftar Kegiatan
          </button>

          <div className="mt-16 clear-both">
            <h2 className="text-lg lg:text-sh1 font-bold mb-4">
              Deskripsi Kegiatan
            </h2>
            <p className="text-b2 lg:text-b1 text-gray-100 leading-relaxed text-justify">
              {description}
            </p>
          </div>

          <div className="mt-12">
            <h2 className="text-lg lg:text-sh1 font-bold mb-4">Attachment</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-square bg-[#D9D9D9]  flex items-center justify-center"
                >
                  {index === 3 && (
                    <span className="text-h1 font-bold text-gray-700">+1</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <RegistrationPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </div>
  );
}
