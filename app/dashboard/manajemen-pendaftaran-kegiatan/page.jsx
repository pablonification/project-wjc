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
    const statusStyles = {
      PAID: "bg-[#5FC364] text-white",
      PENDING: "bg-[#C4A254] text-white",
      FAILED: "bg-[#E53935] text-white",
      CANCELLED: "bg-[#88898d] text-white"
    };
    const statusText = {
      PAID: "Dibayar",
      PENDING: "Menunggu",
      FAILED: "Gagal",
      CANCELLED: "Batal"
    };
    return (
      <span className={`px-4 py-1 rounded-lg text-sm font-semibold ${statusStyles[status] || statusStyles.CANCELLED}`}>
        {statusText[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-8 h-8 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
      </div>
    );
  }
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="min-h-screen bg-[#141415] p-8">
      <div className="max-w-6xl bg-[#141415] p-4">
        <h1 className="text-h2 text-white mb-8">Pendaftaran Kegiatan</h1>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          {/* Filter + Export */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative">
              <select
                value={selectedActivity}
                onChange={(e) => setSelectedActivity(e.target.value)}
                className="w-full bg-[#222225] text-white font-semibold rounded-lg px-10 py-2 appearance-none outline-none border border-[#65666B] transition"
                style={{
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                  appearance: "none"
                }}
              >
                <option value="all">Semua Kegiatan</option>
                {activities.map(act => (
                  <option key={act.id} value={act.id}>{act.title}</option>
                ))}
              </select>
              {/* Filter icon kiri */}
              <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="18" height="18" viewBox="0 0 24 24" stroke="#B3B4B6" fill="none">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6h18M6 12h12M9 18h6" />
                </svg>
              </span>
            </div>
            <button
              onClick={handleExport}
              disabled={filteredRegistrations.length === 0}
              className="px-5 py-2 bg-[#034e07] text-white rounded-md font-medium hover:bg-[#509956] disabled:bg-[#65666B] transition cursor-pointer"
            >
              Export ke XLSX
            </button>
          </div>
        </div>
        <h2 className="block text-b2 text-[#B3B4B6] mb-2">Daftar Nomor</h2>
        <div className="w-full overflow-x-auto bg-[#141415]">
          <div className="min-w-[1100px] grid grid-cols-6 text-[#B3B4B6] bg-[#1E1E20] rounded-sm py-2 px-3 mb-2 font-medium">
            <p>Kegiatan</p>
            <p>Peserta</p>
            <p>Detail</p>
            <p>Total</p>
            <p>Tanggal</p>
            <p className="text-right">Status</p>
          </div>
          {filteredRegistrations.length > 0 ? (
            <ul className="min-w-[1100px]">
              {filteredRegistrations.map((reg) => (
                <li key={reg.id} className="grid grid-cols-6 py-3 px-3 items-center border-b border-[#222225] last:border-none">
                  {/* Kegiatan */}
                  <span className="text-white font-medium">{reg.activity.title}</span>
                  {/* Peserta */}
                  <span className="text-white">
                    {reg.user.name}
                    <br />
                    <span className="text-[#B3B4B6] text-sm">{reg.user.phoneNumber}</span>
                  </span>
                  {/* Detail */}
                  <span className="text-white text-sm">
                    Kaos: {reg.tshirtSize}<br />
                    Penginapan: {reg.needAccommodation ? `Ya${reg.roomType ? ` (${reg.roomType})` : ''}` : 'Tidak'}
                  </span>
                  {/* Total */}
                  <span className="text-white font-semibold">
                    {reg.totalPrice ? `Rp ${new Intl.NumberFormat("id-ID").format(reg.totalPrice)}` : "-"}
                  </span>
                  {/* Tanggal */}
                  <span className="text-white text-sm">{new Date(reg.createdAt).toLocaleDateString("id-ID")}</span>
                  {/* Status */}
                  <span className="flex justify-end">{getStatusBadge(reg.paymentStatus)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white min-w-[1100px] py-8 text-center">Tidak ada pendaftar.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityRegistrationsDashboard;