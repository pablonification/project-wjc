"use client";
import { useState, useEffect, Fragment } from "react";
import { Footer } from "@/app/components";
import {
  getBiteshipCourierCode,
  formatCourierDisplayName,
} from "@/lib/courierUtils";

const TrackingModal = ({ order, trackingData, isLoading, error, onClose }) => {
  if (!order) return null;

  return (
    // Wrapper utama untuk overlay dan modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose} // Menutup modal saat mengklik di luar
    >
      {/* Elemen Overlay Transparan */}
      <div className="absolute inset-0 bg-black opacity-70"></div>

      {/* Konten Modal */}
      <div
        className="relative bg-gray-900 p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto font-manrope text-white"
        onClick={(e) => e.stopPropagation()} // Mencegah modal tertutup saat mengklik di dalam
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            Lacak Pesanan #{order.id.substring(0, 8)}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg mb-6 text-sm">
          <p>
            <strong>Kurir:</strong>{" "}
            {formatCourierDisplayName(order.courierService)}
          </p>
          <p>
            <strong>No. Resi:</strong> {order.resi}
          </p>
          {trackingData?.status && (
            <p>
              <strong>Status Terkini:</strong>{" "}
              <span className="font-semibold text-green-400">
                {trackingData.status}
              </span>
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-8">Memuat riwayat pelacakan...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-400">{error}</div>
        ) : (
          <div className="space-y-4">
            {trackingData?.history?.length > 0 ? (
              trackingData.history.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        index === 0
                          ? "bg-green-500 ring-4 ring-green-500/30"
                          : "bg-gray-600"
                      }`}
                    ></div>
                    {index < trackingData.history.length - 1 && (
                      <div className="w-0.5 flex-grow bg-gray-600"></div>
                    )}
                  </div>
                  <div className="pb-6 flex-grow">
                    <p
                      className={`font-semibold ${
                        index === 0 ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {item.note}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.updated_at).toLocaleString("id-ID", {
                        dateStyle: "long",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center py-8 text-gray-400">
                Riwayat pelacakan tidak tersedia.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const OrderCardSkeleton = () => (
  <div className="bg-gray-900 p-6 rounded-lg animate-pulse">
    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
      <div className="flex-1">
        <div className="h-5 w-1/3 bg-gray-700 rounded mb-2" />
        <div className="h-4 w-1/4 bg-gray-700 rounded mb-4" />
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-md bg-gray-700" />
          <div>
            <div className="h-5 w-32 bg-gray-700 rounded mb-2" />
            <div className="h-4 w-24 bg-gray-700 rounded" />
          </div>
        </div>
      </div>
      <div className="text-left md:text-right w-full md:w-auto">
        <div className="h-4 w-24 bg-gray-700 rounded mb-2" />
        <div className="h-7 w-32 bg-gray-700 rounded mb-4" />
        <div className="h-10 w-32 bg-gray-700 rounded" />
      </div>
    </div>
  </div>
);

const MyOrdersPageSkeleton = () => (
  <div className="space-y-6">
    {[...Array(3)].map((_, i) => (
      <OrderCardSkeleton key={i} />
    ))}
  </div>
);

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState(null);

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      try {
        const resUser = await fetch("/api/user/profile");
        if (!resUser.ok)
          throw new Error("Silakan login untuk melihat pesanan.");
        const dataUser = await resUser.json();

        const resOrders = await fetch(`/api/orders?userId=${dataUser.user.id}`);
        if (!resOrders.ok) throw new Error("Gagal memuat data pesanan.");
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

  const handleTrackOrder = async (order) => {
    if (!order.resi || !order.courierService) return;

    setSelectedOrder(order);
    setIsTrackingLoading(true);
    setTrackingData(null);
    setTrackingError(null);

    const courierCode = getBiteshipCourierCode(order.courierService);

    if (!courierCode) {
      setTrackingError("Tidak dapat menentukan kode kurir.");
      setIsTrackingLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `/api/shipping/track?id=${order.resi}&courier=${courierCode}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal melacak pengiriman");
      }
      setTrackingData(data);
    } catch (err) {
      setTrackingError(err.message);
    } finally {
      setIsTrackingLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      PAID: "text-green-800 bg-green-200",
      PENDING: "text-yellow-800 bg-yellow-200",
      CANCELLED: "text-red-800 bg-red-200",
      SHIPPING: "text-blue-800 bg-blue-200",
      COMPLETED: "text-purple-800 bg-purple-200",
    };
    return (
      <span
        className={`px-2 py-1 text-xs font-semibold rounded-full ${
          styles[status] || "text-gray-800 bg-gray-200"
        }`}
      >
        {status}
      </span>
    );
  };

  const handleConfirmReceived = async (orderId) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders((orders) =>
        orders.map((o) => (o.id === orderId ? updated : o))
      );
    } else {
      alert("Gagal konfirmasi penerimaan barang");
    }
  };

  if (loading) {
    return (
      <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
        <main className="flex-grow bg-black text-white">
          <div className="container mx-auto mt-20 px-4 sm:px-6 lg:px-28 py-16">
            <div className="h-12 w-1/3 bg-gray-700 rounded mb-8 animate-pulse" />
            <MyOrdersPageSkeleton />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <Fragment>
      <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
        <main className="flex-grow bg-black text-white">
          <div className="container mx-auto mt-20 px-4 sm:px-6 lg:px-28 py-16">
            <h1 className="text-h1 font-bold mb-8">Pesanan Saya</h1>

            {error && <p className="text-red-500">{error}</p>}

            {!loading && !error && (
              <div className="space-y-6">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <div key={order.id} className="bg-gray-900 p-6 rounded-lg">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="font-semibold mr-4 text-sm">
                              Kode: {order.orderCode || order.id.substring(0, 8)}
                            </span>
                            {getStatusBadge(order.status)}
                          </div>
                          <p className="text-xs text-gray-400 mb-4">
                            {new Date(order.createdAt).toLocaleDateString(
                              "id-ID",
                              { day: "numeric", month: "long", year: "numeric" }
                            )}
                          </p>
                          <div className="flex items-center gap-4">
                            <img
                              src={
                                order.merchandise?.imageUrls?.[0] ||
                                "/assets/image/Placeholder.png"
                              }
                              alt={order.merchandise?.name || "Produk"}
                              className="w-16 h-16 rounded-md object-cover"
                            />
                            <div>
                              <p className="font-semibold">
                                {order.merchandise.name}
                              </p>
                              <p className="text-sm text-gray-400">
                                {order.quantity} x Rp
                                {new Intl.NumberFormat("id-ID").format(
                                  order.unitPrice
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-left md:text-right w-full md:w-auto">
                          <p className="text-gray-400 text-sm">
                            Total Pembayaran
                          </p>
                          <p className="text-xl font-bold mb-4">
                            Rp
                            {new Intl.NumberFormat("id-ID").format(order.total)}
                          </p>

                          <div className="flex flex-col items-start md:items-end gap-2">
                            {order.status === "PENDING" && (
                              <a
                                href={`/orders/${order.id}/success`}
                                className="w-full md:w-auto text-center bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                              >
                                Instruksi Pembayaran
                              </a>
                            )}
                            {order.status === "SHIPPING" && order.resi && (
                              <button
                                onClick={() => handleTrackOrder(order)}
                                className="w-full md:w-auto text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
                              >
                                Lacak
                              </button>
                            )}
                            {order.status === "SHIPPING" && (
                              <button
                                onClick={() => handleConfirmReceived(order.id)}
                                className="w-full md:w-auto text-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
                              >
                                Konfirmasi Diterima
                              </button>
                            )}
                          </div>
                          {order.status === "SHIPPING" && (
                            <p className="text-xs text-gray-400 mt-2">
                              Tekan tombol "Konfirmasi Diterima" jika barang
                              sudah diterima.
                            </p>
                          )}
                        </div>
                      </div>
                      {(order.status === "SHIPPING" ||
                        order.status === "COMPLETED") &&
                        order.resi && (
                          <div className="border-t border-gray-700 mt-4 pt-4 text-sm">
                            <p className="text-gray-400">
                              <strong>Metode:</strong>{" "}
                              {order.shippingMethod === "PICKUP"
                                ? "Ambil di Sekretariat"
                                : `Dikirim via ${formatCourierDisplayName(
                                    order.courierService
                                  )}`}
                            </p>
                            {order.shippingMethod === "DELIVERY" && (
                              <p className="text-gray-400">
                                <strong>No. Resi:</strong>{" "}
                                <span className="font-mono">{order.resi}</span>
                              </p>
                            )}
                          </div>
                        )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-gray-900 rounded-lg">
                    <p>Anda belum memiliki pesanan.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>

      {selectedOrder && (
        <TrackingModal
          order={selectedOrder}
          trackingData={trackingData}
          isLoading={isTrackingLoading}
          error={trackingError}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </Fragment>
  );
};

export default MyOrdersPage;
