"use client";
import { Navbar, Footer } from "../components";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

// Skeleton loader for the news list
function BeritaListSkeleton() {
  // Show 6 skeleton cards as placeholders
  return (
    <>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex flex-col animate-pulse font-manrope">
          <div className="w-full h-56 bg-gray-700 rounded mb-4" />
          <div className="h-4 w-1/3 bg-gray-700 rounded mb-2" />
          <div className="h-6 w-2/3 bg-gray-700 rounded mb-2" />
          <div className="h-4 w-full bg-gray-700 rounded" />
        </div>
      ))}
    </>
  );
}

const NewsCard = ({ category, date, title, description, slug, imageUrl }) => {
  return (
    <Link href={`/berita/${slug}`} className="flex flex-col font-manrope">
      {/* Image placeholder */}
      <div className="w-full h-56 bg-[#D9D9D9] relative overflow-hidden">
        {imageUrl && (
          <Image src={imageUrl} alt={title} fill className="object-cover" />
        )}
      </div>

      {/* Content */}
      <div className="mt-4">
        <p className="text-b2 text-gray-400 mb-1">
          <span className="text-red-400 mr-1">{category}</span> | {date}
        </p>
        <h3 className="text-sh1 text-white font-semibold mb-1">{title}</h3>
        <p className="text-b2 text-gray-400 line-clamp-2">{description}</p>
      </div>
    </Link>
  );
};

export default function Berita() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch("/api/berita");
        if (!res.ok) throw new Error("Gagal mengambil data berita");
        const data = await res.json();
        setNews(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

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
            {loading ? (
              <BeritaListSkeleton />
            ) : news.length ? (
              news.map((item, index) => (
                <NewsCard
                  key={index}
                  category={item.category}
                  date={new Date(item.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                  title={item.title}
                  description={item.content}
                  slug={item.slug}
                  imageUrl={item.imageUrl}
                />
              ))
            ) : (
              <p className="text-white">Belum ada berita.</p>
            )}
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
