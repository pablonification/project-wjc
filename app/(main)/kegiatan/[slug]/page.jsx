"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Navbar, Footer } from "../../../components";
import Image from "next/image";
import Link from "next/link";

// Skeleton loader for the main content
function KegiatanDetailSkeleton() {
  return (
    <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-28 py-16 font-manrope translate-y-28 mb-60 text-white animate-pulse">
      {/* Back link skeleton */}
      <div className="w-32 h-6 bg-gray-700 rounded mb-4" />

      {/* Top section: left info, right image */}
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 pr-0 lg:pr-8">
          <div className="h-12 w-2/3 bg-gray-700 rounded mb-4" /> {/* Title */}
          <div className="flex gap-6 mb-4">
            <div className="h-6 w-24 bg-gray-700 rounded" /> {/* Location */}
            <div className="h-6 w-32 bg-gray-700 rounded" /> {/* Status */}
          </div>
          <div className="h-6 w-1/3 bg-gray-700 rounded mb-4" /> {/* Date */}
          <div className="h-10 w-40 bg-gray-700 rounded mb-8" /> {/* Button */}
        </div>
        <div className="w-full lg:w-1/3 h-60 bg-gray-700 rounded mb-6 lg:mb-0" />
      </div>

      {/* Description section */}
      <div className="mt-12">
        <div className="h-8 w-48 bg-gray-700 rounded mb-6" /> {/* Section title */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 w-full bg-gray-700 rounded" />
          ))}
          <div className="h-4 w-5/6 bg-gray-700 rounded" />
          <div className="h-4 w-2/3 bg-gray-700 rounded" />
        </div>
      </div>

      {/* Attachments section */}
      <div className="mt-16">
        <div className="h-8 w-40 bg-gray-700 rounded mb-6" /> {/* Section title */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function KegiatanDetail() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Registration popup state
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    tshirtSize: "M",
    needAccommodation: false,
    roomType: "sharing",
  });

  // Pricing calculations
  const [pricing, setPricing] = useState({
    baseFee: 0,
    tshirtPrice: 0,
    accommodationPrice: 0,
    totalPrice: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/kegiatan/${slug}`);
      if (res.ok) setData(await res.json());
      setLoading(false);
    };
    if (slug) fetchData();
  }, [slug]);

  // Calculate pricing whenever form data or activity changes
  useEffect(() => {
    if (!data) return;

    const tshirtPrices = {
      S: data.tshirtPriceS || 0,
      M: data.tshirtPriceM || 0,
      L: data.tshirtPriceL || 0,
      XL: data.tshirtPriceXL || 0,
      XXL: data.tshirtPriceXXL || 0,
      XXXL: data.tshirtPriceXXXL || 0,
    };

    const baseFee = data.registrationFee || 0;

    const tshirtPrice = tshirtPrices[formData.tshirtSize] || 0;

    let accommodationPrice = 0;
    if (formData.needAccommodation) {
      accommodationPrice =
        formData.roomType === "single"
          ? data.accommodationPriceSingle || 0
          : data.accommodationPriceSharing || 0;
    }

    const totalPrice = baseFee + tshirtPrice + accommodationPrice;

    setPricing({
      baseFee,
      tshirtPrice,
      accommodationPrice,
      totalPrice,
    });
  }, [formData, data]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRegistration = async () => {
    // Check authentication first
    try {
      const resProfile = await fetch("/api/user/profile");
      if (!resProfile.ok) {
        alert("Silakan login terlebih dahulu");
        window.location.href = "/login";
        return;
      }
      const dataProfile = await resProfile.json();
      setUser(dataProfile.user);
    } catch (error) {
      console.error("Error checking authentication:", error);
      alert("Silakan login terlebih dahulu");
      window.location.href = "/login";
      return;
    }

    setShowRegistrationModal(true);
  };

  const handleSubmitRegistration = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const registrationData = {
        userId: user.id,
        activityId: data.id,
        tshirtSize: formData.tshirtSize,
        needAccommodation: formData.needAccommodation,
        roomType: formData.needAccommodation ? formData.roomType : null,
        tshirtPrice: pricing.tshirtPrice,
        accommodationPrice: pricing.accommodationPrice,
        totalPrice: pricing.totalPrice,
      };

      const response = await fetch(`/api/kegiatan/${slug}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      });

      if (response.ok) {
        const responseData = await response.json();

        // Close modal and redirect to payment
        setShowRegistrationModal(false);
        window.location.href = responseData.paymentUrl;
      } else {
        const errorData = await response.json();
        alert(
          errorData.message || "Terjadi kesalahan saat memproses pendaftaran"
        );
      }
    } catch (error) {
      console.error("Error processing registration:", error);
      alert("Terjadi kesalahan saat memproses pendaftaran. Silakan coba lagi.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading)
    return (
      <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
        <Navbar />
        <KegiatanDetailSkeleton />
        <Footer />
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
        <p className="text-b2 text-gray-200 font-manrope">
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
        {/* Registration Button */}
        {data.status === "UPCOMING" && (
          <div className="mt-8">
            <button
              onClick={handleRegistration}
              className="inline-flex items-center justify-center w-full md:w-fit bg-red-600 hover:bg-red-700 text-white py-3 px-4 transition-colors group cursor-pointer"
            >
              Daftar Sekarang
            </button>
          </div>
        )}
        <div className="text-sh1 text-white font-manrope mt-12">
          Deskripsi Kegiatan
          <div className="space-y-6 mt-4 text-b2 lg:text-b1 text-gray-100 leading-relaxed text-justify clear-both font-manrope">
            {data.description.split("\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>

        {/* Attachments */}
        {data.attachmentUrls && data.attachmentUrls.length > 0 && (
          <div className="mt-16">
            <h2 className="text-sh1 text-white mb-6 font-manrope">
              Attachment
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {data.attachmentUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square bg-[#D9D9D9]"
                >
                  <Image
                    src={url}
                    alt={`Attachment ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Registration Modal */}
      {showRegistrationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 mt-12">
                <h2 className="text-h3 font-bold text-white">
                  Daftar Kegiatan
                </h2>
                <button
                  onClick={() => setShowRegistrationModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Registration Form */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-h4 text-gray-300 mb-4">{data.title}</h3>
                  </div>

                  <form
                    onSubmit={handleSubmitRegistration}
                    className="space-y-6"
                  >
                    {/* T-shirt Size Selection */}
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-white mb-4">
                        Ukuran Kaos/Jersey
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        {["S", "M", "L", "XL", "XXL", "XXXL"].map((size) => {
                          const price = data[`tshirtPrice${size}`] || 0;
                          return (
                            <label
                              key={size}
                              className="flex flex-col items-center p-3 border border-gray-600 rounded-lg cursor-pointer hover:border-red-500 transition-colors"
                            >
                              <input
                                type="radio"
                                name="tshirtSize"
                                value={size}
                                checked={formData.tshirtSize === size}
                                onChange={handleInputChange}
                                className="sr-only"
                              />
                              <div
                                className={`w-full text-center p-2 rounded ${
                                  formData.tshirtSize === size
                                    ? "bg-red-600 text-white"
                                    : "bg-gray-700 text-gray-300"
                                }`}
                              >
                                <div className="font-semibold">{size}</div>
                                <div className="text-sm">
                                  Rp
                                  {new Intl.NumberFormat("id-ID").format(price)}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Accommodation Options */}
                    {data.accommodationName && (
                      <div className="bg-gray-800 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-white mb-4">
                          Penginapan
                        </h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="needAccommodation"
                              name="needAccommodation"
                              checked={formData.needAccommodation}
                              onChange={handleInputChange}
                              className="w-4 h-4 text-red-600 rounded"
                            />
                            <label
                              htmlFor="needAccommodation"
                              className="text-white"
                            >
                              Saya membutuhkan penginapan di{" "}
                              <strong>{data.accommodationName}</strong>
                            </label>
                          </div>

                          {formData.needAccommodation && (
                            <div className="ml-7 space-y-2">
                              <div className="flex items-center space-x-3">
                                <input
                                  type="radio"
                                  id="sharing"
                                  name="roomType"
                                  value="sharing"
                                  checked={formData.roomType === "sharing"}
                                  onChange={handleInputChange}
                                  className="w-4 h-4 text-red-600"
                                />
                                <label
                                  htmlFor="sharing"
                                  className="text-gray-300"
                                >
                                  Kamar Sharing - Rp
                                  {new Intl.NumberFormat("id-ID").format(
                                    data.accommodationPriceSharing || 0
                                  )}
                                </label>
                              </div>
                              <div className="flex items-center space-x-3">
                                <input
                                  type="radio"
                                  id="single"
                                  name="roomType"
                                  value="single"
                                  checked={formData.roomType === "single"}
                                  onChange={handleInputChange}
                                  className="w-4 h-4 text-red-600"
                                />
                                <label
                                  htmlFor="single"
                                  className="text-gray-300"
                                >
                                  Kamar Single - Rp
                                  {new Intl.NumberFormat("id-ID").format(
                                    data.accommodationPriceSingle || 0
                                  )}
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors cursor-pointer"
                    >
                      {isProcessing ? "Memproses..." : "Lanjut ke Pembayaran"}
                    </button>
                  </form>
                </div>

                {/* Right Column - Summary */}
                <div className="bg-gray-800 p-4 rounded-lg h-fit">
                  <h4 className="text-lg font-semibold text-white mb-4">
                    Ringkasan Pendaftaran
                  </h4>

                  <div className="space-y-4">
                    {/* Activity Info */}
                    <div className="flex items-center space-x-3">
                      {data.imageUrl && (
                        <div className="relative w-12 h-12 bg-gray-700 rounded-lg">
                          <Image
                            src={data.imageUrl}
                            alt={data.title}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="font-semibold text-white text-sm">
                          {data.title}
                        </div>
                        <div className="text-xs text-gray-400">
                          {data.location}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(data.dateStart).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="border-t border-gray-700 pt-3 space-y-2">
                      <div className="flex justify-between text-white text-sm">
                        <span>Biaya Pendaftaran</span>
                        <span>
                          Rp
                          {new Intl.NumberFormat("id-ID").format(
                            pricing.baseFee
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-white text-sm">
                        <span>Kaos/Jersey ({formData.tshirtSize})</span>
                        <span>
                          Rp
                          {new Intl.NumberFormat("id-ID").format(
                            pricing.tshirtPrice
                          )}
                        </span>
                      </div>

                      {formData.needAccommodation && (
                        <div className="flex justify-between text-white text-sm">
                          <span>Penginapan ({formData.roomType})</span>
                          <span>
                            Rp
                            {new Intl.NumberFormat("id-ID").format(
                              pricing.accommodationPrice
                            )}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between font-semibold text-white border-t border-gray-700 pt-2">
                        <span>Total</span>
                        <span>
                          Rp
                          {new Intl.NumberFormat("id-ID").format(
                            pricing.totalPrice
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
