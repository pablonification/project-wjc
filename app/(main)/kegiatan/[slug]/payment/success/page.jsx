"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar, Footer } from "@/app/components";
import Image from "next/image";
import Link from "next/link";

const ActivityPaymentSuccessPageSkeleton = () => (
     <main className="flex-grow bg-black text-white animate-pulse">
        <div className="container mx-auto mt-20 px-4 sm:px-6 lg:px-28 py-16">
            <div className="max-w-2xl mx-auto text-center">
                <div className="mb-8">
                    <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4" />
                    <div className="h-10 w-3/4 bg-gray-700 rounded mx-auto mb-4" />
                    <div className="h-5 w-full bg-gray-700 rounded mx-auto" />
                </div>

                <div className="bg-gray-900 p-6 rounded-lg mb-8 text-left space-y-4">
                    <div className="h-8 w-1/3 bg-gray-700 rounded mb-4" />
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-700 rounded-lg flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                            <div className="h-5 w-full bg-gray-700 rounded" />
                            <div className="h-4 w-1/2 bg-gray-700 rounded" />
                            <div className="h-4 w-3/4 bg-gray-700 rounded" />
                        </div>
                    </div>
                     <div className="border-t border-gray-700 pt-4 space-y-2">
                        <div className="h-5 w-full bg-gray-700 rounded" />
                        <div className="h-5 w-full bg-gray-700 rounded" />
                        <div className="h-7 w-full bg-gray-700 rounded mt-2" />
                    </div>
                </div>

                 <div className="space-y-4">
                    <div className="bg-gray-900/60 rounded-lg p-4">
                       <div className="h-5 w-full bg-gray-700 rounded" />
                       <div className="h-5 w-3/4 bg-gray-700 rounded mt-2" />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <div className="h-12 w-48 bg-gray-700 rounded-lg" />
                        <div className="h-12 w-48 bg-gray-700 rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    </main>
);

const ActivityPaymentSuccessPage = () => {
  const { slug } = useParams();
  const [activity, setActivity] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [waKegiatan, setWaKegiatan] = useState("6281234567890");

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/user/profile");
      if (!res.ok) return null;
      const data = await res.json();
      return data.user;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  };

  const fetchActivity = async (slug) => {
    try {
      const res = await fetch(`/api/kegiatan/${slug}`);
      if (!res.ok) return null;
      return await res.json();
    } catch (error) {
      console.error("Error fetching activity:", error);
      return null;
    }
  };

  const fetchRegistration = async (userId, slug) => {
    try {
      const res = await fetch("/api/admin/activity-registrations");
      if (!res.ok) return null;
      const data = await res.json();
      return data.find(
        (reg) => reg.user.id === userId && reg.activity.slug === slug
      );
    } catch (error) {
      console.error("Error fetching registration:", error);
      return null;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!slug) return;
      setLoading(true);
      const [user, act] = await Promise.all([fetchUser(), fetchActivity(slug)]);
      setActivity(act);
      if (user) {
        const reg = await fetchRegistration(user.id, slug);
        setRegistration(reg);
      }
      setLoading(false);
    };

    loadData();
  }, [slug]);

  useEffect(() => {
    const fetchWa = async () => {
      const res = await fetch("/api/admin/settings/wa-kegiatan");
      const data = await res.json();
      if (data.number) setWaKegiatan(data.number);
    };
    fetchWa();
  }, []);

  useEffect(() => {
    if (activity && registration) {
      const waMessage = encodeURIComponent(
        `Halo, saya sudah berhasil daftar kegiatan.\n\n` +
        `Nama: ${registration.user?.name || "-"}\n` +
        `Nama Kegiatan: ${activity.title}\n` +
        `Tanggal: ${new Date(activity.dateStart).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}` +
        (activity.dateEnd ? ` - ${new Date(activity.dateEnd).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}` : "") + `\n` +
        `Lokasi: ${activity.location}\n` +
        `Ukuran Kaos: ${registration.tshirtSize}\n` +
        (registration.needAccommodation ? `Penginapan: Ya (${registration.roomType})\n` : "") +
        `Total Pembayaran: Rp${registration.totalPrice.toLocaleString("id-ID")}\n`
      );
      const waLink = `https://wa.me/${waKegiatan}?text=${waMessage}`;
      const timeout = setTimeout(() => {
        window.location.href = waLink;
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [activity, registration, waKegiatan]);

  if (loading) {
    return (
        <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
            <Navbar />
            <ActivityPaymentSuccessPageSkeleton />
            <Footer />
        </div>
    );
  }

  return (
    <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
      <Navbar />
      <main className="flex-grow bg-black text-white">
        <div className="container mx-auto mt-20 px-4 sm:px-6 lg:px-28 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-12 h-12 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-h1 font-bold mb-4">Pembayaran Berhasil!</h1>
              <p className="text-gray-300 text-b1">
                Terima kasih telah mendaftar. Pendaftaran Anda untuk kegiatan
                ini sudah berhasil diproses.
              </p>
            </div>

            {activity && (
              <div className="bg-gray-900 p-6 rounded-lg mb-8 text-left space-y-4">
                <h2 className="text-h3 font-semibold mb-4">Detail Kegiatan</h2>
                <div className="flex items-center space-x-4">
                  {activity.imageUrl && (
                    <div className="relative w-16 h-16 bg-gray-800 rounded-lg flex-shrink-0">
                      <Image
                        src={activity.imageUrl}
                        alt={activity.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-white">
                      {activity.title}
                    </div>
                    <div className="text-xs text-gray-400">
                      {activity.location}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(activity.dateStart).toLocaleDateString(
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

                {registration && (
                  <>
                    <div className="border-t border-gray-700 pt-4 space-y-2 text-sm text-gray-300">
                      <div className="flex justify-between">
                        <span>Ukuran Kaos/Jersey</span>
                        <span>{registration.tshirtSize}</span>
                      </div>
                      {registration.needAccommodation && (
                        <div className="flex justify-between">
                          <span>Penginapan ({registration.roomType})</span>
                          <span>
                            Rp
                            {new Intl.NumberFormat("id-ID").format(
                              registration.accommodationPrice
                            )}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold text-lg border-t border-gray-700 pt-2">
                        <span>Total</span>
                        <span>
                          Rp
                          {new Intl.NumberFormat("id-ID").format(
                            registration.totalPrice
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-gray-700 pt-4 text-sm text-gray-400">
                      <p>
                        <strong>Status:</strong> {"Dibayar"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            <div className="space-y-4">
              <div className="bg-gray-900/60 rounded-lg p-4">
                <p className="text-gray-300 text-b1 whitespace-pre-line leading-relaxed text-center sm:text-left break-words">
                  Anda akan diarahkan untuk mengirim pesan melalui WhatsApp
                  untuk pemrosesan lebih lanjut. Jika halaman tidak otomatis
                  berpindah, silakan klik tombol merah di bawah ini.
                  <br className="hidden sm:block" />
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {activity && registration && (
                  <a
                    href={`https://wa.me/${waKegiatan}?text=${encodeURIComponent(
                      `Halo, saya sudah berhasil daftar kegiatan.\n\n` +
                      `Nama: ${registration.user?.name || "-"}\n` +
                      `Nama Kegiatan: ${activity.title}\n` +
                      `Tanggal: ${new Date(activity.dateStart).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}` +
                      (activity.dateEnd ? ` - ${new Date(activity.dateEnd).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}` : "") + `\n` +
                      `Lokasi: ${activity.location}\n` +
                      `Ukuran Kaos: ${registration.tshirtSize}\n` +
                      (registration.needAccommodation ? `Penginapan: Ya (${registration.roomType})\n` : "") +
                      `Total Pembayaran: Rp${registration.totalPrice.toLocaleString("id-ID")}\n`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg cursor-pointer"
                  >
                    Konfirmasi Pendaftaran
                  </a>
                )}
                <Link
                  href="/"
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg cursor-pointer"
                >
                  Ke Halaman Utama
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ActivityPaymentSuccessPage;