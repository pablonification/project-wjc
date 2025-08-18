"use client";
import { useParams } from "next/navigation";
import { Footer } from "@/app/components";
import Link from "next/link";

const ActivityPaymentFailedPage = () => {
    const { slug } = useParams();

    return (
        <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
            <main className="flex-grow bg-black text-white">
                <div className="container mx-auto mt-20 px-4 sm:px-6 lg:px-28 py-16">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="mb-8">
                            <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h1 className="text-h1 font-bold mb-4">Pembayaran Gagal</h1>
                            <p className="text-gray-300 text-b1">
                                Pembayaran pendaftaran Anda tidak dapat diproses. Silakan coba lagi.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href={`/kegiatan/${slug}`} className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg">
                                Kembali ke Detail Kegiatan
                            </Link>
                            <Link href="/kegiatan" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg">
                                Lihat Kegiatan Lain
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default ActivityPaymentFailedPage;