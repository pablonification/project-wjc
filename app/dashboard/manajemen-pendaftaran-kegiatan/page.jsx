"use client";
import { useState, useEffect } from "react";
import { exportToExcel } from "@/lib/exportToExcel";

const ActivityRegistrationsDashboard = () => {
  const [allRegistrations, setAllRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [regsRes, activitiesRes] = await Promise.all([
          fetch("/api/admin/activity-registrations"),
          fetch("/api/kegiatan"),
        ]);

        if (!regsRes.ok) throw new Error("Gagal mengambil data pendaftaran");
        if (!activitiesRes.ok) throw new Error("Gagal mengambil data kegiatan");

        const regsData = await regsRes.json();
        const activitiesData = await activitiesRes.json();

        setAllRegistrations(regsData);
        setFilteredRegistrations(regsData);
        setActivities(activitiesData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedActivity === "all") {
      setFilteredRegistrations(allRegistrations);
    } else {
      setFilteredRegistrations(
        allRegistrations.filter((reg) => reg.activity.id === selectedActivity)
      );
    }
  }, [selectedActivity, allRegistrations]);

  const handleExport = () => {
    const dataToExport = filteredRegistrations.map((reg) => ({
      "ID Pendaftaran": reg.id,
      "Tanggal Daftar": new Date(reg.createdAt).toLocaleString("id-ID"),
      "Nama Kegiatan": reg.activity.title,
      "Nama Peserta": reg.user.name,
      "No. Telepon": reg.user.phoneNumber,
      "Ukuran Kaos": reg.tshirtSize,
      "Butuh Penginapan": reg.needAccommodation ? "Ya" : "Tidak",
      "Tipe Kamar": reg.roomType || "-",
      "Total Bayar (Rp)": reg.totalPrice,
      "Status Pembayaran": reg.paymentStatus,
    }));
    
    const activityName = activities.find(a => a.id === selectedActivity)?.slug || 'semua-kegiatan';
    exportToExcel(dataToExport, `pendaftar_${activityName}_${new Date().toISOString().split('T')[0]}`);
  };
  
  const getStatusBadge = (status) => {
    const statusStyles = { PENDING: "bg-yellow-100 text-yellow-800", PAID: "bg-green-100 text-green-800", FAILED: "bg-red-100 text-red-800", CANCELLED: "bg-gray-100 text-gray-800"};
    const statusText = { PENDING: "Menunggu", PAID: "Dibayar", FAILED: "Gagal", CANCELLED: "Batal"};
    return (<span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.CANCELLED}`}>{statusText[status] || status}</span>);
  };

  if (loading) return <p>Memuat data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Pendaftaran Kegiatan</h1>
          <div className="flex items-center gap-4">
            <select
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">Semua Kegiatan</option>
              {activities.map((act) => (
                <option key={act.id} value={act.id}>{act.title}</option>
              ))}
            </select>
            <button
              onClick={handleExport}
              disabled={filteredRegistrations.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              Export ke XLSX
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kegiatan</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peserta</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRegistrations.length > 0 ? filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-semibold">{reg.activity.title}</td>
                    <td className="px-4 py-2">{reg.user.name} <br/> <span className="text-xs text-gray-500">{reg.user.phoneNumber}</span></td>
                    <td className="px-4 py-2 text-sm">
                      Kaos: {reg.tshirtSize} <br/>
                      Penginapan: {reg.needAccommodation ? `Ya (${reg.roomType})` : 'Tidak'}
                    </td>
                    <td className="px-4 py-2 font-semibold">Rp{new Intl.NumberFormat("id-ID").format(reg.totalPrice)}</td>
                    <td className="px-4 py-2">{getStatusBadge(reg.paymentStatus)}</td>
                    <td className="px-4 py-2 text-sm">{new Date(reg.createdAt).toLocaleDateString("id-ID")}</td>
                  </tr>
                )) : (
                    <tr>
                        <td colSpan="6" className="text-center py-4">Tidak ada pendaftar.</td>
                    </tr>
                )}
              </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityRegistrationsDashboard;