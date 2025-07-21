"use client";
import { Navbar, Footer } from "../components";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const ProductCard = ({ name, price, imageUrls, slug }) => {
  const displayUrl = imageUrls && imageUrls.length > 0 ? imageUrls[0] : null;
  return (
    <Link href={`/merchandise/${slug}`} className="flex flex-col font-manrope group">
      <div className="w-full h-72 bg-[#D9D9D9] relative overflow-hidden">
        {displayUrl && (
          <Image
            src={displayUrl}
            alt={name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
      </div>
      <div className="mt-4 text-white">
        <h3 className="text-sh1 font-medium">{name}</h3>
        <p className="text-b1 font-semibold">
          Rp{new Intl.NumberFormat("id-ID").format(price)}
        </p>
      </div>
    </Link>
  );
};

const ProductCardSkeleton = () => (
  <div className="flex flex-col font-manrope animate-pulse">
    <div className="w-full h-72 bg-gray-700 rounded" />
    <div className="mt-4">
      <div className="h-6 w-3/4 bg-gray-700 rounded mb-2" />
      <div className="h-5 w-1/2 bg-gray-700 rounded" />
    </div>
  </div>
);

const MerchandiseListSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
        {[...Array(4)].map((_, i) => (
            <ProductCardSkeleton key={i} />
        ))}
    </div>
);


export default function Merchandise() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/merchandise');
        if (!res.ok) throw new Error("Gagal mengambil data produk");
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleShowMore = () => {
    setVisibleCount(prevCount => prevCount + 8);
  };

  return (
    <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
      <Navbar />
      <section className="bg-[#1F1F1F]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-28 py-24">
          <h1 className="text-display font-manrope font-bold text-white translate-y-16">
            Merchandise
          </h1>
        </div>
      </section>

      <section className="bg-black flex-grow text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-28 py-24">
          {loading ? (
            <MerchandiseListSkeleton />
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {products.slice(0, visibleCount).map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="text-center">Tidak ada produk.</div>
          )}
          {products.length > visibleCount && (
            <div className="text-center mt-12 flex justify-center">
              <button onClick={handleShowMore} className="py-2 px-8 sm:px-24 md:px-36 lg:px-48 bg-[#403E3D] flex items-center gap-2 cursor-pointer font-manrope w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl justify-center">
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
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}