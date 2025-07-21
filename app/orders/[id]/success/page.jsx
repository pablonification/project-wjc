"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Navbar, Footer } from "@/app/components";
import Link from "next/link";
import Image from "next/image";

const PaymentSuccessPageSkeleton = () => (
    <main className="flex-grow bg-black text-white animate-pulse">
        <div className="container mx-auto mt-20 px-4 sm:px-6 lg:px-28 py-16">
            <div className="max-w-2xl mx-auto text-center">
                <div className="mb-8">
                    <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4" />
                    <div className="h-10 w-3/4 bg-gray-700 rounded mx-auto mb-4" />
                    <div className="h-5 w-full bg-gray-700 rounded mx-auto" />
                </div>
                <div className="bg-gray-900 p-6 rounded-lg mb-8 space-y-4">
                    <div className="h-8 w-1/2 bg-gray-700 rounded" />
                    <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 bg-gray-700 rounded-lg" />
                        <div className="flex-1 space-y-2">
                            <div className="h-5 w-3/4 bg-gray-700 rounded" />
                            <div className="h-4 w-1/2 bg-gray-700 rounded" />
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

const PaymentSuccessPage = () => {
  const params = useParams();
  const { id } = params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [waMerch, setWaMerch] = useState("6281234567890");

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

  useEffect(() => {
    const fetchWa = async () => {
      const res = await fetch("/api/admin/settings/wa-merch");
      const data = await res.json();
      if (data.number) setWaMerch(data.number);
    };
    fetchWa();
  }, []);

  useEffect(() => {
    if (order && waMerch) {
      const waMessage = encodeURIComponent(
        `Halo, saya sudah berhasil order merchandise.\n\n` +
        `Order ID: ${order.id}\n` +
        `Nama Produk: ${order.merchandise.name}\n` +
        `Jumlah: ${order.quantity}\n` +
        `Subtotal: Rp${order.subtotal.toLocaleString('id-ID')}\n` +
        `Ongkos Kirim: Rp${order.shippingCost.toLocaleString('id-ID')}\n` +
        `Total: Rp${order.total.toLocaleString('id-ID')}\n` +
        `Metode Pengiriman: ${order.shippingMethod === 'PICKUP' ? 'Ambil di Sekretariat' : 'Dikirim via Ekspedisi'}${order.shippingMethod === 'DELIVERY' && order.courierService ? ` (${order.courierService})` : ''}\n` +
        `Status: ${order.status === 'PAID' ? 'Dibayar' : order.status}`
      );
      const waLink = `https://wa.me/${waMerch}?text=${waMessage}`;
      const timeout = setTimeout(() => {
        window.location.href = waLink;
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [order, waMerch]);

  if (loading) {
    return (
        <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
            <Navbar />
            <PaymentSuccessPageSkeleton />
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
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-h1 font-bold mb-4">Pembayaran Berhasil!</h1>
              <p className="text-gray-300 text-b1">
                Terima kasih atas pembelian Anda. Pesanan Anda telah berhasil diproses.
              </p>
            </div>

            {order && (
              <div className="bg-gray-900 p-6 rounded-lg mb-8 text-left">
                <h2 className="text-h3 font-semibold mb-4">Detail Pesanan</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    {order.merchandise.imageUrls && order.merchandise.imageUrls[0] && (
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
                      <div className="font-semibold">{order.merchandise.name}</div>
                      <div className="text-sm text-gray-400">Qty: {order.quantity}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">Rp{new Intl.NumberFormat("id-ID").format(order.subtotal)}</div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-700 pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>Rp{new Intl.NumberFormat("id-ID").format(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ongkos Kirim</span>
                      <span>Rp{new Intl.NumberFormat("id-ID").format(order.shippingCost)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg border-t border-gray-700 pt-2">
                      <span>Total</span>
                      <span>Rp{new Intl.NumberFormat("id-ID").format(order.total)}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-700 pt-4">
                    <div className="text-sm text-gray-400">
                      <p><strong>Metode Pengiriman:</strong> {order.shippingMethod === 'PICKUP' ? 'Ambil di Sekretariat' : 'Dikirim via Ekspedisi'}</p>
                      {order.shippingMethod === 'DELIVERY' && order.courierService && (
                        <p><strong>Ekspedisi:</strong> {order.courierService}</p>
                      )}
                      <p><strong>Status:</strong> {order.status === 'PAID' ? 'Dibayar' : order.status}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="bg-gray-900/60 rounded-lg p-4">
                <p className="text-gray-300 text-b1 whitespace-pre-line leading-relaxed text-center sm:text-left break-words">
                  {order?.shippingMethod === 'PICKUP' 
                    ? 'Silakan ambil pesanan Anda di sekretariat pada jam kerja.'
                    : (
                        <>
                          Anda akan diarahkan untuk mengirim pesan melalui WhatsApp untuk pemrosesan lebih lanjut. Jika halaman tidak otomatis berpindah, silakan klik tombol merah di bawah ini.<br className="hidden sm:block" />
                        </>
                      )
                  }
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {order && (
                  <a
                    href={`https://wa.me/${waMerch}?text=${encodeURIComponent(
                      `Halo, saya sudah berhasil order merchandise.\n\n` +
                      `Order ID: ${order.id}\n` +
                      `Nama Produk: ${order.merchandise.name}\n` +
                      `Jumlah: ${order.quantity}\n` +
                      `Subtotal: Rp${order.subtotal.toLocaleString('id-ID')}\n` +
                      `Ongkos Kirim: Rp${order.shippingCost.toLocaleString('id-ID')}\n` +
                      `Total: Rp${order.total.toLocaleString('id-ID')}\n` +
                      `Metode Pengiriman: ${order.shippingMethod === 'PICKUP' ? 'Ambil di Sekretariat' : 'Dikirim via Ekspedisi'}${order.shippingMethod === 'DELIVERY' && order.courierService ? ` (${order.courierService})` : ''}\n` +
                      `Status: ${order.status === 'PAID' ? 'Dibayar' : order.status}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg cursor-pointer"
                  >
                    Konfirmasi Pesanan
                  </a>
                )}
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
};

export default PaymentSuccessPage;