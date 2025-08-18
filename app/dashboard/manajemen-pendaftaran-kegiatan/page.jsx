"use client";
import { useState, useEffect } from "react";
import { exportToExcel } from "@/lib/exportToExcel";

const ActivityRegistrationsDashboard = () => {
  const [allRegistrations, setAllRegistrations] = useState([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [activities, setActivities] = useState([]);
  const [searchCode, setSearchCode] = useState("");
  const [selectedActivity, setSelectedActivity] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editState, setEditState] = useState({});

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
    let base = selectedActivity === "all" ? allRegistrations : allRegistrations.filter((reg) => reg.activity.id === selectedActivity);
    if (searchCode.trim()) {
      const q = searchCode.trim();
      base = base.filter((reg) => (reg.registrationCode || "").includes(q));
    }
    setFilteredRegistrations(base);
  }, [selectedActivity, allRegistrations, searchCode]);

  const handleExport = () => {
    const dataToExport = filteredRegistrations.map((reg) => ({
      "Kode Pendaftaran": reg.registrationCode || '',
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
          {/* Filter + Search + Export + Backfill */}
          <div className="flex items-center gap-4 flex-wrap">
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
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Cari Kode Pendaftaran (5 digit)"
              className="w-[240px] bg-[#222225] text-white font-semibold rounded-lg px-4 py-2 outline-none border border-[#65666B] focus:border-[#C4A254]"
            />
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
          <div className="min-w-[1100px] grid grid-cols-7 text-[#B3B4B6] bg-[#1E1E20] rounded-sm py-1.5 px-3 mb-2 font-medium text-xs">
            <p>Kode</p>
            <p>Kegiatan</p>
            <p>Peserta</p>
            <p>Total</p>
            <p>Tanggal</p>
            <p>Status</p>
            <p className="text-left">Aksi</p>
          </div>
          {filteredRegistrations.length > 0 ? (
            <ul className="min-w-[1100px]">
              {filteredRegistrations.map((reg) => (
                <li key={reg.id} className="grid grid-cols-7 py-2.5 px-3 items-center border-b border-[#222225] last:border-none text-xs">
                  {/* Kode */}
                  <span className="text-white font-semibold">{reg.registrationCode || '-'}</span>
                  {/* Kegiatan */}
                  <span className="text-white font-medium truncate max-w-[220px]">{reg.activity.title}</span>
                  {/* Peserta */}
                  <span className="text-white truncate max-w-[220px]">
                    <span className="font-semibold">{reg.user.name}</span>
                    <br />
                    <span className="text-[#B3B4B6]">{reg.user.phoneNumber}</span>
                  </span>
                  {/* Total */}
                  <span className="text-white font-semibold">
                    {reg.totalPrice ? `Rp ${new Intl.NumberFormat("id-ID").format(reg.totalPrice)}` : "-"}
                  </span>
                  {/* Tanggal */}
                  <span className="text-white">{new Date(reg.createdAt).toLocaleDateString("id-ID")}</span>
                  {/* Status dropdown */}
                  <span>
                    <select
                      value={editState[reg.id]?.paymentStatus ?? reg.paymentStatus}
                      onChange={(e) =>
                        setEditState((prev) => ({
                          ...prev,
                          [reg.id]: { ...(prev[reg.id] || {}), paymentStatus: e.target.value },
                        }))
                      }
                      className="border border-[#B3B4B6] bg-[#141415] text-white px-2 py-1 rounded-md text-xs focus:border-[#C4A254] outline-none"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="FAILED">FAILED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </span>
                  {/* Aksi: Simpan */}
                  <span className="flex">
                    <button
                      onClick={async () => {
                        const newStatus = editState[reg.id]?.paymentStatus ?? reg.paymentStatus;
                        if (newStatus === reg.paymentStatus) return; // nothing to save
                        setEditState((prev) => ({ ...(prev || {}), [reg.id]: { ...(prev[reg.id] || {}), saving: true } }));
                        const res = await fetch(`/api/admin/activity-registrations/${reg.id}`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ paymentStatus: newStatus })
                        });
                        if (res.ok) {
                          const updated = await res.json();
                          setAllRegistrations(prev => prev.map(r => r.id === reg.id ? updated : r));
                          setEditState((prev) => ({ ...(prev || {}), [reg.id]: { ...prev[reg.id], saving: false } }));
                        } else {
                          alert('Gagal update status');
                          setEditState((prev) => ({ ...(prev || {}), [reg.id]: { ...prev[reg.id], saving: false } }));
                        }
                      }}
                      className="px-3 py-1 bg-[#65666B] text-white rounded-md text-xs hover:bg-[#777] disabled:opacity-60 cursor-pointer"
                      disabled={editState[reg.id]?.saving}
                    >
                      {editState[reg.id]?.saving ? '...' : 'Simpan'}
                    </button>
                  </span>
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