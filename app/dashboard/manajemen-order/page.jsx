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

  if (loading) return <p>Memuat data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Manajemen Pesanan</h1>
          <div className="flex items-center gap-4">
            <select
              value={selectedMerch}
              onChange={(e) => setSelectedMerch(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">Semua Merchandise</option>
              {merchandise.map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
            <button
              onClick={handleExport}
              disabled={filteredOrders.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              Export ke XLSX
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pemesan</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resi</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length > 0 ? filteredOrders.map(order => {
                    const edit = editState[order.id] || {};
                    const statusOptions = ["PENDING", "PAID", "SHIPPING", "COMPLETED", "CANCELLED"];
                    return (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{new Date(order.createdAt).toLocaleString('id-ID')}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{order.user?.name}<br/><span className="text-xs text-gray-500">{order.user?.phoneNumber}</span></td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{order.merchandise?.name || <span className="text-red-500">-</span>}<br/><span className="text-xs text-gray-500">Qty: {order.quantity}</span></td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">Rp{new Intl.NumberFormat('id-ID').format(order.total)}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            <select className="border rounded px-2 py-1" value={edit.status || order.status} onChange={e => handleEditChange(order.id, 'status', e.target.value)}>
                              {statusOptions.map(opt => (<option key={opt} value={opt}>{opt}</option>))}
                            </select>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {(edit.status || order.status) === 'SHIPPING' ? (
                              <input type="text" className="border rounded px-2 py-1 w-32" placeholder="No. Resi" value={edit.resi !== undefined ? edit.resi : (order.resi || '')} onChange={e => handleEditChange(order.id, 'resi', e.target.value)} />
                            ) : (order.resi || '-')}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <button className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-xs" onClick={() => handleSave(order)} disabled={edit.saving}>{edit.saving ? '...' : 'Simpan'}</button>
                          </td>
                        </tr>
                    );
                }) : (
                    <tr><td colSpan="7" className="text-center py-4">Tidak ada pesanan.</td></tr>
                )}
              </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrdersDashboard;