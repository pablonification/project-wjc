"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar, Footer } from "@/app/components";
import Image from "next/image";
import Link from "next/link";

const ActivityPaymentSuccessPage = () => {
  const { slug } = useParams();
  const [activity, setActivity] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user profile
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

  // Fetch activity detail by slug
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

  // Fetch registration record for current user & activity
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

  if (loading) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        Memuat...
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
                Terima kasih telah mendaftar. Pendaftaran Anda untuk kegiatan ini sudah berhasil diproses.
              </p>
            </div>

            {/* Detail Kegiatan & Pendaftaran */}
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
                      {new Date(activity.dateStart).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
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
              <p className="text-gray-300 text-b1">
                Silakan cek email atau halaman profil Anda untuk konfirmasi lebih lanjut.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/kegiatan"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg"
                >
                  Lihat Kegiatan Lainnya
                </Link>
                <Link
                  href="/profile"
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg"
                >
                  Lihat Pendaftaran Saya
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