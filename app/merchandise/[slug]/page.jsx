"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar, Footer } from "@/app/components";
import Image from "next/image";

const DetailMerchandise = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const params = useParams();
  const { slug } = params;

  useEffect(() => {
    if (slug) {
      const fetchProduct = async () => {
        try {
          const res = await fetch(`/api/merchandise/${slug}`);
          if (!res.ok) {
            throw new Error("Produk tidak ditemukan atau terjadi kesalahan");
          }
          const data = await res.json();
          setProduct(data);
          if (data.imageUrls && data.imageUrls.length > 0) {
            setActiveImage(data.imageUrls[0]);
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        Memuat...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        Error: {error}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        Produk tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
      <Navbar />
      <main className="flex-grow bg-black text-white">
        <div className="container mx-auto mt-20 px-4 sm:px-6 lg:px-28 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="flex flex-col gap-4">
              <div className="relative w-full h-[500px] bg-[#D9D9D9]">
                {activeImage && (
                  <Image
                    src={activeImage}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {product.imageUrls?.map((url, index) => (
                  <div
                    key={index}
                    className={`relative h-32 w-full bg-[#D9D9D9] cursor-pointer border-2 ${
                      activeImage === url
                        ? "border-red-500"
                        : "border-transparent"
                    }`}
                    onClick={() => setActiveImage(url)}
                  >
                    <Image
                      src={url}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Details */}
            <div className="flex flex-col pt-8">
              <p className="text-gray-400 text-b1 mb-2">{product.category}</p>
              <h1 className="text-h1 font-bold mb-4">{product.name}</h1>
              <p className="text-display font-semibold text-red-500 mb-6">
                Rp{new Intl.NumberFormat("id-ID").format(product.price)}
              </p>
              <div className="text-gray-300 text-b1 space-y-4 mb-8">
                <p>
                  {product.description ||
                    "Tidak ada deskripsi untuk produk ini."}
                </p>
              </div>

              <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-sh1 transition-colors duration-300">
                Beli Sekarang
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DetailMerchandise;
