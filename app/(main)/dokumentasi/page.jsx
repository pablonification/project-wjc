"use client";
import { Navbar, Footer } from "../../components";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import BannerAd from "../../components/BannerAd";

const DocLink = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center justify-between py-4 text-h2 text-white group font-manrope"
  >
    <span className="group-hover:text-gray-300 transition-colors font-manrope">
      {children}
    </span>
    <Image
      src="/assets/image/ArrowOutward.png"
      alt="arrow"
      width={28}
      height={28}
      className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
    />
  </a>
);

const DocLinkSkeleton = () => (
  <div className="flex items-center justify-between py-4">
    <div className="h-8 bg-gray-700 rounded w-3/4 animate-pulse"></div>
    <div className="w-7 h-7 bg-gray-700 rounded-full animate-pulse"></div>
  </div>
);

const DokumentasiSkeleton = () => (
  <div>
    <div>
      <div className="h-12 bg-gray-700 rounded w-1/4 mb-6 animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24">
        <DocLinkSkeleton />
        <DocLinkSkeleton />
        <DocLinkSkeleton />
        <DocLinkSkeleton />
        <DocLinkSkeleton />
        <DocLinkSkeleton />
      </div>
    </div>
  </div>
);

export default function Dokumentasi() {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await fetch("/api/dokumentasi");
        if (!res.ok) {
          throw new Error("Gagal mengambil data");
        }
        const data = await res.json();
        setDocs(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    // Simulate loading
    setTimeout(() => {
      fetchDocs();
    }, 1500);
  }, []);

  // Group by year
  const grouped = docs.reduce((acc, doc) => {
    const year = new Date(doc.createdAt).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(doc);
    return acc;
  }, {});

  const years = Object.keys(grouped).sort((a, b) => b - a);

  return (
    <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
      <Navbar />
      <section className="bg-[#1F1F1F]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-28 py-24">
          <h1 className="text-display font-manrope font-bold text-white translate-y-16">
            Dokumentasi
          </h1>
        </div>
      </section>
      {/* Banner Ad after Hero */}
      <BannerAd page="dokumentasi" />
      {/* Main Content */}
      <section className="bg-black flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-28 py-24">
          {loading ? (
            <DokumentasiSkeleton />
          ) : years.length ? (
            years.map((year, idx) => (
              <div key={year} className={idx > 0 ? "mt-16" : ""}>
                <h2 className="text-h1 font-semibold text-gray-400 mb-6 font-manrope">
                  {year}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24">
                  {grouped[year].map((d) => (
                    <DocLink key={d.id} href={d.url}>
                      {d.name}
                    </DocLink>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-white">Belum ada dokumentasi.</p>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
