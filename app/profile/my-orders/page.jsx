"use client";
import { useState, useEffect } from 'react';
import { Navbar, Footer } from '@/app/components';
import Link from 'next/link';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      try {
        // 1. Get user profile to get the ID
        const resUser = await fetch('/api/user/profile');
        if (!resUser.ok) throw new Error('Silakan login untuk melihat pesanan.');
        const dataUser = await resUser.json();
        setUser(dataUser.user);

        // 2. Fetch orders using the user ID
        const resOrders = await fetch(`/api/orders?userId=${dataUser.user.id}`);
        if (!resOrders.ok) throw new Error('Gagal memuat data pesanan.');
        const dataOrders = await resOrders.json();
        setOrders(dataOrders);

      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Dibayar</span>;
      case 'PENDING':
        return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">Menunggu Pembayaran</span>;
      case 'CANCELLED':
        return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">Dibatalkan</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded-full">{status}</span>;
    }
  };

  const handleConfirmReceived = async (orderId) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders(orders => orders.map(o => o.id === orderId ? updated : o));
    } else {
      alert("Gagal konfirmasi penerimaan barang");
    }
  };

  return (
    <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
      <Navbar />
      <main className="flex-grow bg-black text-white">
        <div className="container mx-auto mt-20 px-4 sm:px-6 lg:px-28 py-16">
          <h1 className="text-h1 font-bold mb-8">Pesanan Saya</h1>
          
          {loading && <p>Memuat pesanan...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && (
            <div className="space-y-6">
              {orders.length > 0 ? (
                orders.map(order => (
                  <div key={order.id} className="bg-gray-900 p-6 rounded-lg flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="font-semibold mr-4">Order #{order.id.substring(0, 8)}</span>
                        {getStatusBadge(order.status)}
                      </div>
                      <p className="text-sm text-gray-400 mb-4">
                        Tanggal: {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <div className="flex items-center gap-4">
                        <img
                          src={order.merchandise?.imageUrls?.[0] || "/assets/image/Placeholder.png"}
                          alt={order.merchandise?.name || "Produk tidak ditemukan"}
                          className="w-16 h-16 rounded-md object-cover"
                        />
                        <div>
                          <p className="font-semibold">{order.merchandise.name}</p>
                          <p className="text-sm text-gray-400">{order.quantity} x Rp{new Intl.NumberFormat('id-ID').format(order.unitPrice)}</p>
                          {order.resi && (
                            <p className="text-xs text-gray-400 mt-1">Resi: <span className="font-mono">{order.resi}</span></p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-left md:text-right mt-4 md:mt-0">
                      <p className="text-gray-400">Total Pembayaran</p>
                      <p className="text-xl font-bold">Rp{new Intl.NumberFormat('id-ID').format(order.total)}</p>
                      {order.status === 'PENDING' && order.xenditPaymentUrl && (
                        <a href={order.xenditPaymentUrl} target="_blank" rel="noopener noreferrer" className="inline-block mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm">
                          Bayar Sekarang
                        </a>
                      )}
                      {order.status === 'SHIPPING' && (
                        <button
                          className="inline-block mt-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
                          onClick={() => handleConfirmReceived(order.id)}
                        >
                          Konfirmasi Barang Diterima
                        </button>
                      )}
                      {order.status === 'SHIPPING' && (
                        <p className="text-sm text-gray-400 mt-2">
                          Klik tombol di atas jika barang sudah diterima.
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p>Anda belum memiliki pesanan.</p>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyOrdersPage;