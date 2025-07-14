'use client';

import { useState, useEffect } from 'react';

const Page = () => {

  const [whitelist, setWhitelist] = useState([]);
  const [newNumber, setNewNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect -> ambil daftar whitelist dari db
  useEffect(() => {
    const fetchWhitelist = async () => {
      try {
        setIsLoading(true);
        // call API GET buat ambil data whitelist
        const response = await fetch('/api/admin/whitelist');
        if (!response.ok) {
          throw new Error('Gagal mengambil data whitelist');
        }
        const data = await response.json();
        setWhitelist(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWhitelist();
  }, []);

  // Fungsi untuk menangani penambahan nomor baru
  const handleAddNumber = async (e) => {
    e.preventDefault(); // Mencegah form dari refresh halaman
    if (!newNumber.trim()) {
      setError('Nomor telepon tidak boleh kosong.');
      return;
    }

    try {
      // call API POST untuk menambahkan nomor baru
      const response = await fetch('/api/admin/whitelist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: newNumber }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menambahkan nomor');
      }

      const addedNumber = await response.json();
      // Menambahkan nomor baru ke state agar UI langsung ter-update
      setWhitelist([...whitelist, addedNumber]);
      setNewNumber(''); // Mengosongkan input field
      setError(null); // Menghapus pesan error jika ada
    } catch (err) {
      setError(err.message);
    }
  };

  // Fungsi utk menangani penghapusan nomor
  const handleDeleteNumber = async (id) => {
    // Konfirmasi sederhana sebelum menghapus
    if (!window.confirm('Apakah Anda yakin ingin menghapus nomor ini?')) {
      return;
    }

    try {
      // call API DELETE untuk menghapus nomor berdasarkan ID
      const response = await fetch('/api/admin/whitelist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menghapus nomor');
      }

      // Menghapus nomor dari state agar UI langsung ter-update
      setWhitelist(whitelist.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Admin Dashboard - Kelola Whitelist
        </h1>

        {/* Form untuk menambah nomor baru */}
        <form onSubmit={handleAddNumber} className="mb-8">
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
            Tambah Nomor Telepon Baru
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id="phoneNumber"
              type="tel"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              placeholder="Contoh: 081234567890"
              className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Tambah
            </button>
          </div>
        </form>

        {/* Menampilkan pesan error jika ada */}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Daftar nomor yang sudah di-whitelist */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Daftar Nomor</h2>
          {isLoading ? (
            <p className="text-gray-500">Memuat data...</p>
          ) : whitelist.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {whitelist.map((item) => (
                <li key={item.id} className="py-3 flex justify-between items-center">
                  <span className="text-gray-900">{item.phoneNumber}</span>
                  <button
                    onClick={() => handleDeleteNumber(item.id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Hapus
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Belum ada nomor yang di-whitelist.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;