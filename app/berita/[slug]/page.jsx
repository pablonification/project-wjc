"use client";
import { Navbar, Footer } from "@/app/components";
import Link from "next/link";
import Image from "next/image";

export default function BeritaDetail({ params }) {
  const dummyText =
    "Lorem ipsum dolor sit amet consectetur. Interdum lectus porttitor adipiscing gravida. Malesuada pellentesque feugiat quis tempus donec. Nec in dignissim a pharetra id. Tortor lacus diam in adipiscing. Risus ullamcorper aliquam augue faucibus eu nulla. Mauris neque sed enim auctor egestas. Magna praesent cursus sagittis pharetra. Tristique purus pellentesque lectus in eu diam quis. Blandit aliquam amet cras nunc magna. Vel aliquam aliquam ultrices a morbi vestibulum pharetra. Morbi commodo egestas sed enim auctor elit imperdiet sed aliquam adipiscing dictum. Ut varius nec sit sed vitae laoreet rhoncus. Praesent ultrices molestie velit enim. Quis dictum eu sollicitudin eu. Aenean gravida lorem a quis amet.";

  return (
    <div className="bg-black min-h-screen flex flex-col font-manrope text-white">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-28 py-16 font-manrope translate-y-28 mb-60">
        {/* Main Content Area */}
        <div>
          <Link href="/berita">
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
          <p className="text-b2 text-gray-200 mb-16 font-manrope">
            <span className="font-bold text-red-400 mr-1">Kategori</span> | 6
            Juli 2025
          </p>

          <div className="space-y-6 text-b2 lg:text-b1 text-gray-100 leading-relaxed text-justify clear-both font-manrope">
            <p>{dummyText}</p>
            <p>{dummyText}</p>
            <p>{dummyText}</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
