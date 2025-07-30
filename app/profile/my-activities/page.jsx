"use client";
import { useState, useEffect } from "react";
import { Navbar, Footer } from "@/app/components";
import Link from "next/link";
import Image from "next/image";

const ActivityCardSkeleton = () => (
  <div className="bg-gray-900 p-6 rounded-lg animate-pulse">
    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
      <div className="flex-1">
        <div className="flex items-center mb-2">
          <div className="h-5 w-32 bg-gray-700 rounded mr-4" />
          <div className="h-6 w-24 bg-gray-700 rounded-full" />
        </div>
        <div className="h-4 w-1/4 bg-gray-700 rounded mb-4" />
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-md bg-gray-700" />
          <div>
            <div className="h-5 w-40 bg-gray-700 rounded mb-2" />
            <div className="h-4 w-24 bg-gray-700 rounded" />
          </div>
        </div>
      </div>
      <div className="text-left md:text-right mt-4 md:mt-0">
        <div className="h-4 w-24 bg-gray-700 rounded mb-2" />
        <div className="h-7 w-32 bg-gray-700 rounded" />
      </div>
    </div>
  </div>
);

const MyActivitiesPageSkeleton = () => (
  <div className="space-y-6">
    {[...Array(3)].map((_, i) => (
      <ActivityCardSkeleton key={i} />
    ))}
  </div>
);

const MyActivitiesPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserAndRegistrations = async () => {
      try {
        const resUser = await fetch("/api/user/profile");
        if (!resUser.ok)
          throw new Error("Silakan login untuk melihat pendaftaran.");
        const dataUser = await resUser.json();
        setUser(dataUser.user);

        const resRegistrations = await fetch(
          `/api/admin/activity-registrations`
        );
        if (!resRegistrations.ok)
          throw new Error("Gagal memuat data pendaftaran.");
        const allRegistrations = await resRegistrations.json();
        const userRegistrations = allRegistrations.filter(
          (reg) => reg.user.id === dataUser.user.id
        );
        setRegistrations(userRegistrations);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndRegistrations();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "PAID":
        return (
          <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">
            Terdaftar
          </span>
        );
      case "PENDING":
        return (
          <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">
            Menunggu Pembayaran
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">
            Dibatalkan
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded-full">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
        <Navbar />
        <main className="flex-grow bg-black text-white">
          <div className="container mx-auto mt-20 px-4 sm:px-6 lg:px-28 py-16">
            <div className="h-12 w-1/3 bg-gray-700 rounded mb-8 animate-pulse" />
            <MyActivitiesPageSkeleton />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
      <Navbar />
      <main className="flex-grow bg-black text-white">
        <div className="container mx-auto mt-20 px-4 sm:px-6 lg:px-28 py-16">
          <h1 className="text-h1 font-bold mb-8">Kegiatan Saya</h1>

          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && (
            <div className="space-y-6">
              {registrations.length > 0 ? (
                registrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="bg-gray-900 p-6 rounded-lg flex flex-col md:flex-row justify-between items-start gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="font-semibold mr-4">
                          Registrasi #{reg.id.substring(0, 8)}
                        </span>
                        {getStatusBadge(reg.paymentStatus)}
                      </div>
                      <p className="text-sm text-gray-400 mb-4">
                        Tanggal Daftar:{" "}
                        {new Date(reg.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                      <div className="flex items-center gap-4">
                        {console.log(
                          "imageUrl:",
                          reg.activity.imageUrl,
                          "title:",
                          reg.activity.title
                        )}
                        <Image
                          src={
                            reg.activity.imageUrl ||
                            "/assets/image/Placeholder.png"
                          }
                          alt={reg.activity.title}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-md object-cover"
                          onError={(e) => {
                            e.target.src = "/assets/image/Placeholder.png";
                          }}
                        />
                        <div>
                          <p className="font-semibold">{reg.activity.title}</p>
                          <p className="text-sm text-gray-400">
                            {reg.activity.location}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-left md:text-right mt-4 md:mt-0">
                      <p className="text-gray-400">Total Pembayaran</p>
                      <p className="text-xl font-bold">
                        Rp
                        {new Intl.NumberFormat("id-ID").format(reg.totalPrice)}
                      </p>
                      {reg.paymentStatus === "PENDING" &&
                        reg.midtransRedirectUrl && (
                          <a
                            href={reg.midtransRedirectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                          >
                            Lanjutkan Pembayaran
                          </a>
                        )}
                    </div>
                  </div>
                ))
              ) : (
                <p>Anda belum terdaftar di kegiatan manapun.</p>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyActivitiesPage;
