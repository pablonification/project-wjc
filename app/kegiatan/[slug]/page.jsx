"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar, Footer } from "../../components";
import Image from "next/image";
import Link from "next/link";

export default function KegiatanDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/kegiatan/${slug}`);
      if (res.ok) setData(await res.json());
      setLoading(false);
    };
    if (slug) fetchData();
  }, [slug]);

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Memuat...
      </div>
    );
  if (!data)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Tidak ditemukan
      </div>
    );

  const statusMap = {
    UPCOMING: "Mendatang",
    ONGOING: "Sedang Berlangsung",
    COMPLETED: "Selesai",
  };

  return (
    <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-28 py-16 font-manrope translate-y-28 mb-60 text-white">
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
        <p className="text-b2 text-gray-200 mb-6 font-manrope flex items-center gap-6">
          <span className="flex items-center gap-2">
            <Image
              src="/assets/image/Location.png"
              alt="loc"
              width={16}
              height={16}
            />
            {data.location}
          </span>
          <span className="flex items-center gap-2">
            {statusMap[data.status]}
          </span>
        </p>
        <p className="text-b2 text-gray-200 mb-16 font-manrope">
          {new Date(data.dateStart).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
          {data.dateEnd &&
            ` - ${new Date(data.dateEnd).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}`}
        </p>

        <div className="space-y-6 text-b2 lg:text-b1 text-gray-100 leading-relaxed text-justify clear-both font-manrope">
          {data.description.split("\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
