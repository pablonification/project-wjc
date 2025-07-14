'use client';

import { useState, useEffect } from 'react';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Mengambil data profil saat halaman dimuat
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (!res.ok) throw new Error('Gagal mengambil data profil.');
        const data = await res.json();
        setUser(data.user);
        setName(data.user.name);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Menangani update nama
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('Nama berhasil diperbarui!');
      // Refresh halaman untuk memperbarui nama di navbar
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="pt-24 text-center">Loading profil...</div>;
  }

  if (error && !user) {
    return <div className="pt-24 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 pt-24">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Profil Saya</h1>
        <form onSubmit={handleUpdateProfile}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600">Nomor Telepon</label>
            <p className="mt-1 text-lg text-gray-500 bg-gray-100 p-2 rounded-md">{user?.phoneNumber}</p>
            <p className="text-xs text-gray-400 mt-1">Nomor telepon tidak dapat diubah.</p>
          </div>
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-600">Nama Lengkap</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {success && <p className="text-green-500 text-sm mb-4">{success}</p>}
          <button
            type="submit"
            disabled={isSaving}
            className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-indigo-400"
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
