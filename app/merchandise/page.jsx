"use client";
import { Navbar, Footer } from "../components";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";

const ProductCard = ({ name, price, imageUrl, slug }) => {
  return (
    <Link href={`/merchandise/${slug}`} className="flex flex-col font-manrope group">
      <div className="w-full h-72 bg-[#D9D9D9] relative overflow-hidden">
        {imageUrl && (
          <Image
            src={imageUrl}
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

export default function Merchandise() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(8); // Initially show 8 products

  useEffect(() => {
    const fetchProducts = async () => {
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

  // Logic to group products by category
  const productsByCategory = products.reduce((acc, product) => {
    const category = product.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(product);
    return acc;
  }, {});

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
            <div className="text-center">Memuat produk...</div>
          ) : Object.keys(productsByCategory).length > 0 ? (
            <div className="space-y-16">
              {Object.entries(productsByCategory).map(([category, items]) => (
                <div key={category}>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-h2 font-bold">{category}</h2>
                    {/* Filter Dropdown Placeholder */}
                    <div className="relative">
                      <select className="bg-transparent border border-gray-600 rounded-md py-2 px-4 appearance-none focus:outline-none focus:ring-2 focus:ring-white">
                        <option>Filter Berdasarkan</option>
                        <option>Terbaru</option>
                        <option>Harga Terendah</option>
                        <option>Harga Tertinggi</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
                    {items.slice(0, visibleCount).map((product) => (
                      <ProductCard key={product.id} {...product} />
                    ))}
                  </div>
                </div>
              ))}
              {products.length > visibleCount && (
                <div className="text-center mt-20 flex justify-center">
                   <button onClick={handleShowMore} className="py-2 px-48 bg-[#403E3D] flex items-center gap-2 cursor-pointer font-manrope">
                     <p className="text-white font-manrope text-lg">Show More</p>
                     <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} fill="none" viewBox="0 0 20 20">
                       <path d="M10 5v10M5 10h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                     </svg>
                   </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">Belum ada produk untuk ditampilkan.</div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
