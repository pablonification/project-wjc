"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const statusOptions = [
  "PENDING",
  "PAID",
  "SHIPPING",
  "COMPLETED",
  "CANCELLED",
];

const OrdersDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editState, setEditState] = useState({}); // { [orderId]: { status, resi, saving } }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/admin/orders');
        if (!res.ok) throw new Error('Gagal mengambil data pesanan');
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

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
      setOrders(orders => orders.map(o => o.id === order.id ? updated : o));
      setEditState(prev => ({ ...prev, [order.id]: { ...prev[order.id], saving: false } }));
    } else {
      setEditState(prev => ({ ...prev, [order.id]: { ...prev[order.id], saving: false } }));
      alert("Gagal update pesanan");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6">Manajemen Pesanan</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {loading ? (
          <p>Memuat data...</p>
        ) : orders.length === 0 ? (
          <p>Tidak ada pesanan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pemesan</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produk</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resi</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map(order => {
                  const edit = editState[order.id] || {};
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {new Date(order.createdAt).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {order.user?.name}<br/>
                        <span className="text-xs text-gray-500">{order.user?.phoneNumber}</span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {order.merchandise?.name || <span className="text-red-500">-</span>}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-center">
                        {order.quantity}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        Rp{new Intl.NumberFormat('id-ID').format(order.total)}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        <select
                          className="border rounded px-2 py-1"
                          value={edit.status || order.status}
                          onChange={e => handleEditChange(order.id, 'status', e.target.value)}
                        >
                          {statusOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                        {(edit.status || order.status) === 'SHIPPING' ? (
                          <input
                            type="text"
                            className="border rounded px-2 py-1 w-32"
                            placeholder="No. Resi"
                            value={edit.resi !== undefined ? edit.resi : (order.resi || '')}
                            onChange={e => handleEditChange(order.id, 'resi', e.target.value)}
                          />
                        ) : (
                          order.resi || '-'
                        )}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <button
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                          onClick={() => handleSave(order)}
                          disabled={edit.saving}
                        >
                          {edit.saving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersDashboard; 