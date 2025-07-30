"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar, Footer } from "@/app/components";
import Link from "next/link";
import Image from "next/image";

const PaymentFailedPage = () => {
  const params = useParams();
  const { id } = params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchOrder = async () => {
        try {
          const res = await fetch(`/api/orders/${id}`);
          if (res.ok) {
            const data = await res.json();
            setOrder(data);
          }
        } catch (error) {
          console.error("Error fetching order:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [id]);

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
              <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-h1 font-bold mb-4">Pembayaran Gagal</h1>
              <p className="text-gray-300 text-b1">
                Pembayaran Anda tidak dapat diproses. Silakan coba lagi atau
                hubungi customer service.
              </p>
            </div>

            {order && (
              <div className="bg-gray-900 p-6 rounded-lg mb-8 text-left">
                <h2 className="text-h3 font-semibold mb-4">Detail Pesanan</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    {order.merchandise.imageUrls &&
                      order.merchandise.imageUrls[0] && (
                        <div className="relative w-16 h-16 bg-gray-800 rounded-lg">
                          <Image
                            src={order.merchandise.imageUrls[0]}
                            alt={order.merchandise.name}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                      )}
                    <div className="flex-1">
                      <div className="font-semibold">
                        {order.merchandise.name}
                      </div>
                      <div className="text-sm text-gray-400">
                        Qty: {order.quantity}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        Rp
                        {new Intl.NumberFormat("id-ID").format(order.subtotal)}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>
                        Rp
                        {new Intl.NumberFormat("id-ID").format(order.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ongkos Kirim</span>
                      <span>
                        Rp
                        {new Intl.NumberFormat("id-ID").format(
                          order.shippingCost
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t border-gray-700 pt-2">
                      <span>Total</span>
                      <span>
                        Rp{new Intl.NumberFormat("id-ID").format(order.total)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <div className="text-sm text-gray-400">
                      <p>
                        <strong>Status:</strong>{" "}
                        {order.status === "CANCELLED"
                          ? "Dibatalkan"
                          : order.status}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <p className="text-gray-300 text-b1">
                Pesanan Anda belum berhasil diproses. Anda dapat mencoba
                melakukan pembayaran lagi atau menghubungi customer service
                untuk bantuan.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() =>
                    (window.location.href = order?.midtransRedirectUrl)
                  }
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg"
                  disabled={!order?.midtransRedirectUrl}
                >
                  Coba Bayar Lagi
                </button>
                <Link
                  href="/merchandise"
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg"
                >
                  Kembali ke Toko
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

export default PaymentFailedPage;
