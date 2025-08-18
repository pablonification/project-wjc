"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Footer } from "@/app/components";
import Image from "next/image";
import Link from "next/link";

const MerchandiseDetailSkeleton = () => (
  <main className="flex-grow bg-black text-white animate-pulse">
    <div className="container mx-auto mt-20 px-4 sm:px-6 lg:px-28 py-16">
      <div className="h-6 w-32 bg-gray-700 rounded mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image Gallery Skeleton */}
        <div className="flex flex-col gap-4">
          <div className="w-full h-[500px] bg-gray-700 rounded" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-32 w-full bg-gray-700 rounded" />
            <div className="h-32 w-full bg-gray-700 rounded" />
            <div className="h-32 w-full bg-gray-700 rounded" />
          </div>
        </div>

        {/* Product Details Skeleton */}
        <div className="flex flex-col pt-8">
          <div className="h-5 w-1/4 bg-gray-700 rounded mb-2" />
          <div className="h-8 w-3/4 bg-gray-700 rounded mb-4" />
          <div className="h-7 w-1/2 bg-gray-700 rounded mb-6" />
          <div className="space-y-3 mb-8">
            <div className="h-4 w-full bg-gray-700 rounded" />
            <div className="h-4 w-full bg-gray-700 rounded" />
            <div className="h-4 w-5/6 bg-gray-700 rounded" />
          </div>
          <div className="h-12 w-full bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  </main>
);

const DetailMerchandise = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showFullDesc, setShowFullDesc] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { slug } = params;

  useEffect(() => {
    if (slug) {
      const fetchProduct = async () => {
        setLoading(true);
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
  
  const handleBuyNow = () => {
    const checkoutData = {
      product: product,
      quantity: quantity,
      subtotal: product.price * quantity,
    };
    localStorage.setItem("checkoutData", JSON.stringify(checkoutData));
    router.push("/checkout");
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
        <MerchandiseDetailSkeleton />
        <Footer />
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
      <main className="flex-grow bg-black text-white">
        <div className="container mx-auto mt-20 px-4 sm:px-6 lg:px-28 py-16">
          <Link href="/merchandise">
            <div className="flex items-center gap-2 text-sh1 text-gray-200 hover:text-white transition-colors mb-8 cursor-pointer group font-manrope">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
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

            <div className="flex flex-col pt-8">
              <p className="text-gray-400 text-b1 mb-2">{product.category}</p>
              <h2 className="text-h2 mb-4">{product.name}</h2>
              <p className="text-sh1 font-bold mb-6">
                Rp{new Intl.NumberFormat("id-ID").format(product.price)}
              </p>
              <div className="text-gray-300 text-b1 space-y-4 mb-8">
                <div className={!showFullDesc ? 'line-clamp-6' : ''}>
                  {product.description || "Tidak ada deskripsi untuk produk ini."}
                </div>
                {product.description && product.description.split('\n').length > 5 && !showFullDesc && (
                  <button
                    className="underline mt-2 block text-b1 cursor-pointer transition-colors hover:text-gray-200"
                    onClick={() => setShowFullDesc(true)}
                  >
                    Read more
                  </button>
                )}
                {showFullDesc && product.description && product.description.split('\n').length > 5 && (
                  <button
                    className="underline mt-2 block text-b1 cursor-pointer transition-colors hover:text-gray-200"
                    onClick={() => setShowFullDesc(false)}
                  >
                    Tampilkan lebih sedikit
                  </button>
                )}
              </div>

              <div>
                <div className="mb-8">
                  <label className="block text-gray-300 text-b1 mb-2">
                    Jumlah:
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleQuantityChange(quantity - 1)}
                      className="w-10 h-10 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center cursor-pointer"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="text-h3 font-semibold w-12 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(quantity + 1)}
                      className="w-10 h-10 bg-gray-700 hover:bg-gray-600 text-white rounded-lg flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-gray-300 text-b1 mb-2">Total:</p>
                  <p className="text-h2 font-bold text-red-500">
                    Rp
                    {new Intl.NumberFormat("id-ID").format(
                      product.price * quantity
                    )}
                  </p>
                </div>

                <button
                  onClick={handleBuyNow}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 text-lg transition-colors duration-300 cursor-pointer"
                >
                  Beli Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DetailMerchandise;