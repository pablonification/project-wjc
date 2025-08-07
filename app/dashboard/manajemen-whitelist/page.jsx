'use client';

import {Delete} from '../../../public/assets/image'
import { useState, useEffect } from 'react';
import Image from "next/image";

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
    <div className="min-h-screen bg-[#141415] p-8">
      <div className="max-w-2xl p-4 rounded-xl shadow-md">
        <h1 className="text-h2 text-white mb-6">
          Pengelolaan Whitelist
        </h1>

        {/* Form untuk menambah nomor baru */}
        <form onSubmit={handleAddNumber} className="mb-8">
          <label htmlFor="phoneNumber" className="block text-b2 text-[#B3B4B6] mb-2">
            Tambah Nomor Telepon Baru
          </label>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              id="phoneNumber"
              type="tel"
              value={newNumber}
              onChange={(e) => setNewNumber(e.target.value)}
              placeholder="Contoh: 081234567890"
              className="flex-grow px-3 py-2 text-white border border-[#65666B] rounded-sm"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#65666B] text-white font-semibold rounded-md shadow-sm cursor-pointer"
            >
              Tambah Nomor Baru
            </button>
          </div>
        </form>

        {/* Menampilkan pesan error jika ada */}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Daftar nomor yang sudah di-whitelist */}
        <div>
          <h2 className="block text-b2 text-[#B3B4B6] mb-2">Daftar Nomor</h2>
          <div className='flex flex-row justify-between text-[#B3B4B6] pr-15 bg-[#1E1E20] rounded-sm py-2 px-3 mb-2'>
            <p>Nomor Telepon</p>
            <p>Aksi</p>
          </div>
          {isLoading ? (
            <p className="text-white">Memuat data...</p>
          ) : whitelist.length > 0 ? (
            <ul>
              {whitelist.map((item) => (
                <li key={item.id} className="py-3 px-2 flex justify-between items-center">
                  <span className="text-white">{item.phoneNumber}</span>
                  <button
                    onClick={() => handleDeleteNumber(item.id)}
                    className="flex flex-row gap-2 px-2 py-1 cursor-pointer bg-red-500 text-white text-b2 rounded-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <Image src={Delete} alt='icon' width={20} height={20} />
                    <p>Hapus</p>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white">Belum ada nomor yang di-whitelist.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Page;