'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Delete, Edit } from '../../../public/assets/image';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users');
        if (!res.ok) throw new Error('Gagal mengambil data pengguna.');
        const data = await res.json();
        setUsers(data.users);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus user ini? Ini tidak bisa dibatalkan.')) {
      return;
    }
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message);
      }
      setUsers(users.filter(user => user.id !== userId));
      alert('User berhasil dihapus.');
    } catch (err) {
      alert(`Gagal menghapus user: ${err.message}`);
    }
  };

  // Filter users by search
  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(search.toLowerCase()) ||
    user.phoneNumber?.toLowerCase().includes(search.toLowerCase()) ||
    user.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#141415] p-8">
      <div className="max-w-4xl p-4 rounded-xl shadow-md">
        <h1 className="text-h2 text-white mb-2">
          Manajemen Pengguna
        </h1>
        <p className="mb-6 text-[#B3B4B6] text-b1">
          Total pengguna terdaftar: {users.length}
        </p>

        {/* Search Input */}
        <div className="mb-6 flex items-center">
          <div className="relative w-full max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#65666B]">
              <svg width="20" height="20" fill="none" stroke="currentColor">
                <circle cx="9" cy="9" r="7" strokeWidth="2"/>
                <line x1="15" y1="15" x2="19" y2="19" strokeWidth="2"/>
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cari pengguna..."
              className="flex-grow px-10 py-2 text-white border border-[#65666B] rounded-sm"
            />
          </div>
        </div>

        {/* Error and Loading */}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {isLoading ? (
          <p className="text-white">Memuat data...</p>
        ) : (
          <div className="overflow-x-auto">
            {/* Table header */}
            <div className="min-w-[600px] grid grid-cols-7 text-[#B3B4B6] bg-[#1E1E20] rounded-sm py-3 px-3 mb-2 text-b1">
              <p className="col-span-2">Nama</p>
              <p className="col-span-2">Nomor Telepon</p>
              <p className="col-span-2">Role</p>
              <p className="col-span-1">Aksi</p>
            </div>
            {/* Table body */}
            {filteredUsers.length > 0 ? (
              <ul className="min-w-[600px]">
                {filteredUsers.map((user) => (
                  <li key={user.id} className="grid grid-cols-7 py-3 px-3 items-center border-b border-[#222225] last:border-none">
                    <span className="col-span-2 text-white">{user.name}</span>
                    <span className="col-span-2 text-white">{user.phoneNumber}</span>
                    <span className="col-span-2 flex">
                      <span
                        className={`inline-block text-center text-xs font-semibold rounded-sm ${
                          user.role === 'ADMIN'
                            ? 'bg-red-900 text-red-300'
                            : 'bg-green-900 text-green-300'
                        }`}
                        style={{
                          width: '90px',
                          minWidth: '90px',
                          maxWidth: '90px',
                          padding: '6px 0',
                        }}
                      >
                        {user.role === 'ADMIN' ? 'Admin' : 'Member'}
                      </span>
                    </span>
                    <span className="col-span-1 flex">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="flex flex-row gap-2 px-3 py-2 cursor-pointer bg-red-500 text-white text-b2 rounded-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Image src={Delete} alt='icon' width={20} height={20} />
                        <span>Hapus</span>
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-white min-w-[600px]">Tidak ada pengguna ditemukan.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;
