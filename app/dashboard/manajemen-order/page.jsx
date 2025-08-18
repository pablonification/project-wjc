"use client";
import { useEffect, useState } from "react";
import { exportToExcel } from "@/lib/exportToExcel";

const OrdersDashboard = () => {
  const [allOrders, setAllOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [merchandise, setMerchandise] = useState([]);
  const [selectedMerch, setSelectedMerch] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editState, setEditState] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, merchRes] = await Promise.all([
          fetch('/api/admin/orders'),
          fetch('/api/merchandise')
        ]);

        if (!ordersRes.ok) throw new Error('Gagal mengambil data pesanan');
        if (!merchRes.ok) throw new Error('Gagal mengambil data merchandise');

        const ordersData = await ordersRes.json();
        const merchData = await merchRes.json();
        
        setAllOrders(ordersData);
        setFilteredOrders(ordersData);
        setMerchandise(merchData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedMerch === "all") {
      setFilteredOrders(allOrders);
    } else {
      setFilteredOrders(
        allOrders.filter((order) => order.merchandiseId === selectedMerch)
      );
    }
  }, [selectedMerch, allOrders]);

  const handleExport = () => {
    const dataToExport = filteredOrders.map(order => ({
      "Order ID": order.id,
      "Tanggal": new Date(order.createdAt).toLocaleString('id-ID'),
      "Nama Pembeli": order.user?.name,
      "No. Telepon": order.user?.phoneNumber,
      "Produk": order.merchandise?.name,
      "Jumlah": order.quantity,
      "Total Bayar (Rp)": order.total,
      "Status": order.status,
      "Metode Pengiriman": order.shippingMethod,
      "Kurir": order.courierService || '-',
      "No. Resi": order.resi || '-',
      "Alamat": order.address ? `${order.address.alamatLengkap}, ${order.address.kota}, ${order.address.provinsi} ${order.address.kodePos}` : 'Ambil di Sekretariat',
    }));
    
    const merchName = merchandise.find(m => m.id === selectedMerch)?.slug || 'semua-pesanan';
    exportToExcel(dataToExport, `pesanan_${merchName}_${new Date().toISOString().split('T')[0]}`);
  };
  
  const handleEditChange = (orderId, field, value) => {
    setEditState(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: value,
      },
    }));
  };

  const handleSave = async (order) => {
    const { status, resi } = editState[order.id] || {};
    setEditState(prev => ({ ...prev, [order.id]: { ...prev[order.id], saving: true } }));
    const res = await fetch(`/api/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: status || order.status, resi: resi !== undefined ? resi : order.resi }),
    });
    if (res.ok) {
      const updated = await res.json();
      setAllOrders(allOrders.map(o => o.id === order.id ? updated : o));
      setEditState(prev => ({ ...prev, [order.id]: { ...prev[order.id], saving: false } }));
    } else {
      setEditState(prev => ({ ...prev, [order.id]: { ...prev[order.id], saving: false } }));
      alert("Gagal update pesanan");
    }
  };

  const statusOptions = ["PENDING", "PAID", "SHIPPING", "COMPLETED", "CANCELLED"];

  if (loading) return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-8 h-8 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
      </div>
    );
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-[#141415] text-white p-8">
      <div className="max-w-7xl p-4 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
          <h1 className="text-h2">Manajemen Pesanan</h1>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <select
                value={selectedMerch}
                onChange={(e) => setSelectedMerch(e.target.value)}
                className="w-full bg-[#222225] text-white font-semibold rounded-lg px-5 py-2 appearance-none outline-none border border-[#65666B] focus:border-[#C4A254] transition"
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  appearance: "none"
                }}
              >
                <option value="all">Semua Merchandise</option>
                {merchandise.map(item => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
              {/* Chevron icon kanan */}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="18" height="18" fill="none" stroke="#B3B4B6" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </div>
            <button
              onClick={handleExport}
              disabled={filteredOrders.length === 0}
              className="px-5 py-2 bg-[#034e07] text-white rounded-md font-semibold hover:bg-[#509956] transition disabled:bg-[#65666B] disabled:text-[#bbb] disabled:cursor-not-allowed cursor-pointer"
            >
              Export ke XLSX
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            {/* Header: Tanggal, Pemesan, Produk, Total, Status, Resi, Aksi */}
            <div className="grid grid-cols-7 text-[#B3B4B6] bg-[#1E1E20] rounded-sm py-2 px-3 mb-2 font-medium text-b1">
              <p className="col-span-1">Tanggal</p>
              <p className="col-span-1">Pemesan</p>
              <p className="col-span-1">Produk</p>
              <p className="col-span-1">Total</p>
              <p className="col-span-1">Status</p>
              <p className="col-span-1">Resi</p>
              <p className="col-span-1">Aksi</p>
            </div>
            {/* Table Body */}
            {filteredOrders.length > 0 ? (
              <ul>
                {filteredOrders.map(order => {
                  const edit = editState[order.id] || {};
                  return (
                    <li key={order.id} className="grid grid-cols-7 py-3 px-3 items-center border-b border-[#222225] last:border-none hover:bg-[#222225] transition">
                      {/* Tanggal */}
                      <span className="col-span-1 text-white text-sm">
                        {new Date(order.createdAt).toLocaleString('id-ID')}
                      </span>
                      {/* Pemesan */}
                      <span className="col-span-1 text-white text-sm">
                        <div className="font-medium">{order.user?.name}</div>
                        <div className="text-xs text-[#B3B4B6]">{order.user?.phoneNumber}</div>
                        <div className="text-xs text-[#B3B4B6]">{order.address ? `${order.address.alamatLengkap}, ${order.address.kota}, ${order.address.provinsi} ${order.address.kodePos}` : 'Ambil di Sekretariat'}</div>
                      </span>
                      {/* Produk */}
                      <span className="col-span-1 text-white text-sm">
                        <div>
                          {order.merchandise?.name || <span className="text-red-500">-</span>}
                        </div>
                        <div className="text-xs text-[#B3B4B6]">Qty: {order.quantity}</div>
                        <div className="text-xs text-[#B3B4B6]">{order.shippingMethod} {order.courierService && <>| Kurir: {order.courierService}</>}</div>
                      </span>
                      {/* Total */}
                      <span className="col-span-1 text-white text-sm">
                        Rp{new Intl.NumberFormat('id-ID').format(order.total)}
                      </span>
                      {/* Status */}
                      <span className="col-span-1 text-white text-sm">
                        <select
                          className="border border-[#B3B4B6] bg-[#141415] text-white px-2 py-1 rounded-md text-xs focus:border-[#C4A254] outline-none"
                          value={edit.status || order.status}
                          onChange={e => handleEditChange(order.id, 'status', e.target.value)}
                        >
                          {statusOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                        </select>
                      </span>
                      {/* Resi */}
                      <span className="col-span-1 text-white text-sm">
                        {(edit.status || order.status) === 'SHIPPING' ? (
                          <input
                            type="text"
                            className="border border-[#B3B4B6] bg-[#141415] text-white px-2 py-1 rounded-md w-24 text-xs outline-none"
                            placeholder="No. Resi"
                            value={edit.resi !== undefined ? edit.resi : (order.resi || '')}
                            onChange={e => handleEditChange(order.id, 'resi', e.target.value)}
                          />
                        ) : (
                          <span className="text-xs text-[#B3B4B6]">{order.resi || '-'}</span>
                        )}
                      </span>
                      {/* Aksi */}
                      <span className="col-span-1 flex gap-2">
                        <button
                          className="px-4 py-2 bg-[#65666B] text-white text-b2 rounded-md font-medium hover:bg-[#88898d] focus:outline-none cursor-pointer"
                          onClick={() => handleSave(order)}
                          disabled={edit.saving}
                        >
                          {edit.saving ? "..." : "Simpan"}
                        </button>
                      </span>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-white min-w-[1000px] py-8 text-center">Tidak ada pesanan.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersDashboard;