// app/kegiatan/[slug]/payment/success/PaymentSuccessClient.jsx
"use client";
import { useEffect } from "react";
import { Navbar, Footer } from "@/app/components";
import Image from "next/image";
import Link from "next/link";

export default function PaymentSuccessClient({ data }) {
  // Sekarang kita hanya perlu destructure 'registration' dan 'waNumber'
  const { registration, waNumber } = data;
  
  // Untuk kemudahan, kita buat variabel 'activity' dari 'registration.activity'
  const activity = registration?.activity;

  useEffect(() => {
    if (!activity || !registration || !waNumber) return;

    const waMessage = encodeURIComponent(
      `Halo, saya sudah berhasil daftar kegiatan.\n\n` +
      `Nama: ${registration.user?.name || "-"}\n` +
      `Nama Kegiatan: ${activity.title}\n` +
      // ... (sisa pesan WA tidak berubah)
      `Total Pembayaran: Rp${new Intl.NumberFormat("id-ID").format(registration.totalPrice)}\n`
    );
    const waLink = `https://wa.me/${waNumber}?text=${waMessage}`;
    const timeout = setTimeout(() => {
      window.location.href = waLink;
    }, 2000);

    return () => clearTimeout(timeout);
  }, [activity, registration, waNumber]);

  if (!activity || !registration) {
    return (
      <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
        <Navbar />
        <main className="flex-grow flex items-center justify-center text-white">
          <p>Detail pendaftaran tidak dapat dimuat.</p>
        </main>
        <Footer />
      </div>
    );
  }

  // Logika harga sekarang menjadi lebih sederhana karena semua ada di 'activity'
  const tshirtPriceFields = {
    S: 'tshirtPriceS',
    M: 'tshirtPriceM',
    L: 'tshirtPriceL',
    XL: 'tshirtPriceXl',
    XXL: 'tshirtPriceXxl',
    XXXL: 'tshirtPriceXxxl',
  };

  const registrationFee = activity.registrationFee || 0;
  const selectedTshirtField = tshirtPriceFields[registration.tshirtSize];
  const tshirtPrice = activity[selectedTshirtField] || 0;

  let accommodationPrice = 0;
  if (registration.needAccommodation) {
    accommodationPrice = registration.roomType === 'single'
      ? activity.accomodationPriceSingle || 0
      : activity.accomodationPriceSharing || 0;
  }
  
  const waLinkManual = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Halo, saya sudah berhasil daftar kegiatan.\n\n` +
    `Nama: ${registration.user?.name || "-"}\n` +
    `Nama Kegiatan: ${activity.title}\n` +
    `Total Pembayaran: Rp${new Intl.NumberFormat("id-ID").format(registration.totalPrice)}\n`
  )}`;

  return (
    <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
      <Navbar />
      <main className="flex-grow bg-black text-white">
        <div className="container mx-auto mt-20 px-4 sm:px-6 lg:px-28 py-16">
          <div className="max-w-2xl mx-auto text-center">
            {/* ... Icon dan judul "Pembayaran Berhasil" ... */}
            <div className="mb-8">
              <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-h1 font-bold mb-4">Pembayaran Berhasil!</h1>
              <p className="text-gray-300 text-b1">
                Terima kasih telah mendaftar. Pendaftaran Anda untuk kegiatan ini sudah berhasil diproses.
              </p>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg mb-8 text-left space-y-4">
              <h2 className="text-h3 font-semibold mb-4">Detail Pembayaran</h2>
              <div className="flex items-center space-x-4 mb-4">
                {/* Sekarang semua detail diambil dari 'activity' yang ada di dalam 'registration' */}
                {activity.image?.url && (
                  <div className="relative w-16 h-16 bg-gray-800 rounded-lg flex-shrink-0">
                    <Image src={activity.image.url} alt={activity.title} fill className="object-cover rounded-lg" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-semibold text-white">{activity.title}</div>
                  <div className="text-xs text-gray-400">{activity.location}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(activity.dateStart).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                </div>
              </div>

              {/* Rincian biaya (kode ini tidak berubah, tapi sumber datanya sekarang lebih solid) */}
              <div className="border-t border-gray-700 pt-4 space-y-2 text-sm text-gray-300">
                <div className="flex justify-between">
                  <span>Biaya Pendaftaran</span>
                  <span>Rp {new Intl.NumberFormat("id-ID").format(registrationFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kaos/Jersey ({registration.tshirtSize})</span>
                  <span>Rp {new Intl.NumberFormat("id-ID").format(tshirtPrice)}</span>
                </div>
                {registration.needAccommodation && (
                  <div className="flex justify-between">
                    <span>Penginapan ({registration.roomType})</span>
                    <span>Rp {new Intl.NumberFormat("id-ID").format(accommodationPrice)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg border-t border-gray-700 mt-2 pt-2">
                  <span>Total</span>
                  <span>Rp {new Intl.NumberFormat("id-ID").format(registration.totalPrice)}</span>
                </div>
              </div>
              <div className="border-t border-gray-700 pt-4 text-sm text-gray-400">
                <p><strong>Status:</strong> Dibayar</p>
              </div>
            </div>

            {/* Tombol-tombol di bawah (tidak ada perubahan) */}
            <div className="space-y-4">
              <div className="bg-gray-900/60 rounded-lg p-4">
                  <p className="text-gray-300 text-b1 whitespace-pre-line leading-relaxed text-center">
                      Anda akan diarahkan ke WhatsApp untuk konfirmasi. Jika tidak, klik tombol di bawah.
                  </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href={waLinkManual} target="_blank" rel="noopener noreferrer" className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg cursor-pointer">
                      Konfirmasi Pendaftaran
                  </a>
                  <Link href="/" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg cursor-pointer">
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
}