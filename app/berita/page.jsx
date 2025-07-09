"use client";
import { Navbar, Footer } from "../components";
import Image from "next/image";
import Link from "next/link";

const NewsCard = ({ category, date, title, description }) => {
  return (
    <div className="flex flex-col font-manrope">
      {/* Image placeholder */}
      <div className="w-full h-56 bg-[#D9D9D9]" />

      {/* Content */}
      <div className="mt-4">
        <p className="text-b2 text-gray-400 mb-1">
          <span className="text-red-400 mr-1">{category}</span> | {date}
        </p>
        <h3 className="text-sh1 text-white font-semibold mb-1">{title}</h3>
        <p className="text-b2 text-gray-400 line-clamp-2">{description}</p>
      </div>
    </div>
  );
};

export default function Berita() {
  const news = Array.from({ length: 6 }).map((_, idx) => ({
    category: "Kategori",
    date: "6 Juli 2025",
    title: "Lorem Ipsum Dolor Sit Amet",
    description:
      "Lorem ipsum dolor sit amet consectetur. Aliquam aliquam in faucibus pretium sit habitant vitae.",
  }));

  return (
    <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-[#1F1F1F]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-28 py-24">
          <h1 className="text-display font-manrope font-bold text-white translate-y-16">
            Berita
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-black flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-28 mt-3 py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16 font-manrope">
            {news.map((item, index) => (
              <NewsCard key={index} {...item} />
            ))}
          </div>

          <div className="text-center mt-20 flex justify-center">
            <Link href="/berita">
              <button className="py-2 px-48 bg-[#403E3D] flex items-center gap-2 cursor-pointer font-manrope">
                <p className="text-white font-manrope text-lg">Show More</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={20}
                  height={20}
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M10 5v10M5 10h10"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
