"use client";
import { useState, useEffect } from "react";

const ActivityRegistrationsDashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/activity-registrations");
      if (!res.ok) throw new Error("Gagal mengambil data pendaftaran");
      const data = await res.json();
      setRegistrations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const getStatusBadge = (status) => {
    const statusStyles = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PAID: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
      CANCELLED: "bg-gray-100 text-gray-800"
    };

    const statusText = {
      PENDING: "Menunggu Pembayaran",
      PAID: "Sudah Dibayar",
      FAILED: "Gagal",
      CANCELLED: "Dibatalkan"
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>
        {statusText[status]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6">Manajemen Pendaftaran Kegiatan</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {loading ? (
          <p>Memuat data...</p>
        ) : registrations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Kegiatan</th>
                  <th className="px-4 py-2 text-left">Peserta</th>
                  <th className="px-4 py-2 text-left">Kontak</th>
                  <th className="px-4 py-2 text-left">Ukuran Kaos</th>
                  <th className="px-4 py-2 text-left">Penginapan</th>
                  <th className="px-4 py-2 text-left">Total</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Tanggal Daftar</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((registration) => (
                  <tr key={registration.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <div>
                        <div className="font-semibold">{registration.activity.title}</div>
                        <div className="text-sm text-gray-600">{registration.activity.location}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(registration.activity.dateStart).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="font-semibold">{registration.user.name}</div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="text-sm">{registration.user.phoneNumber}</div>
                    </td>
                    <td className="px-4 py-2">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                        {registration.tshirtSize}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {registration.needAccommodation ? (
                        <div className="text-sm">
                          <div className="text-green-600">✓ Ya</div>
                          <div className="text-gray-600">{registration.roomType}</div>
                        </div>
                      ) : (
                        <div className="text-gray-500">Tidak</div>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="font-semibold">
                        Rp{new Intl.NumberFormat("id-ID").format(registration.totalPrice)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Kaos: Rp{new Intl.NumberFormat("id-ID").format(registration.tshirtPrice)}
                        {registration.accommodationPrice > 0 && (
                          <div>Penginapan: Rp{new Intl.NumberFormat("id-ID").format(registration.accommodationPrice)}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      {getStatusBadge(registration.paymentStatus)}
                    </td>
                    <td className="px-4 py-2">
                      <div className="text-sm">
                        {new Date(registration.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric"
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(registration.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">Belum ada pendaftaran kegiatan.</p>
        )}
      </div>
    </div>
  );
};

export default ActivityRegistrationsDashboard; 