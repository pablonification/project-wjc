"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Footer } from "../../../components";
import Image from "next/image";
import Link from "next/link";

function BeritaDetailSkeleton() {
  return (
    <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-28 py-16 font-manrope translate-y-28 mb-60 text-white animate-pulse">
        {/* Back link skeleton */}
        <div className="w-32 h-6 bg-gray-700 rounded mb-4" />

        {/* Top section: title/meta left, image right */}
        <div className="flex flex-col lg:flex-row">
          <div className="flex-1 pr-0 lg:pr-8">
            <div className="h-12 w-2/3 bg-gray-700 rounded mb-4" /> {/* Title */}
            <div className="h-6 w-1/3 bg-gray-700 rounded mb-6" /> {/* Meta */}
          </div>
          <div className="w-full lg:w-1/3 h-60 bg-gray-700 rounded mb-6 lg:mb-0" />
        </div>

        {/* Content skeleton */}
        <div className="mt-12 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 w-full bg-gray-700 rounded" />
          ))}
          <div className="h-4 w-5/6 bg-gray-700 rounded" />
          <div className="h-4 w-2/3 bg-gray-700 rounded" />
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function BeritaDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/berita/${slug}`);
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
      setTimeout(() => setLoading(false), 2000); // 2s delay for simulated loading
    };
    if (slug) fetchData();
  }, [slug]);

  if (loading) return <BeritaDetailSkeleton />;
  if (!data)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Tidak ditemukan
      </div>
    );

  return (
    <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-28 py-16 font-manrope translate-y-28 mb-60 text-white">
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
        <div className="w-full lg:w-1/3 bg-[#D9D9D9] lg:float-right lg:ml-8 lg:-translate-y-10 mb-6 relative h-60">
          {data.imageUrl && (
            <Image
              src={data.imageUrl}
              alt={data.title}
              fill
              className="object-cover"
            />
          )}
        </div>

        <h1 className="text-h2 lg:text-h1 leading-tight mb-4 font-manrope">
          {data.title}
        </h1>
        <p className="text-b2 text-gray-200 mb-16 font-manrope">
          {data.category && (
            <>
              <span className="font-bold text-red-400 mr-1">
                {data.category}
              </span>{" "}
              |
            </>
          )}
          {new Date(data.createdAt).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        <div className="space-y-6 text-b2 lg:text-b1 text-gray-100 leading-relaxed text-justify clear-both font-manrope">
          {data.content.split("\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
