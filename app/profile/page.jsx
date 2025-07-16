'use client';

import { useState, useEffect } from 'react';
import { Button } from '../components';
import Image from 'next/image';
import {upload} from "../../public/assets/image"

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [chapter, setChapter] = useState('Bandung');
  const [ktpUrl, setKtpUrl] = useState('');
  const [ktpPublicId, setKtpPublicId] = useState('');
  const [ktpFile, setKtpFile] = useState(null);
  const [ktpPreview, setKtpPreview] = useState('');
  const [showKtpModal, setShowKtpModal] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Ambil data profil saat halaman dimuat
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (!res.ok) throw new Error('Gagal mengambil data profil.');
        const data = await res.json();
        setUser(data.user);
        setName(data.user.name || '');
        setNickname(data.user.nickname || '');
        setChapter(data.user.chapter || 'Bandung');
        setKtpUrl(data.user.ktpUrl || '');
        setKtpPublicId(data.user.ktpPublicId || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Fungsi upload ke Cloudinary
  const handleKtpUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.secure_url && data.public_id) {
      setKtpPublicId(data.public_id);
      return data;
    }
    throw new Error('Gagal upload foto KTP');
  };

  // Fungsi hapus KTP lama di Cloudinary
  const deleteOldKtp = async (publicId) => {
    if (!publicId) return;
    await fetch('/api/user/profile/delete-ktp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId }),
    });
  };

  // Handler update profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    // Validasi semua field wajib diisi
    if (!name.trim() || !nickname.trim() || !chapter.trim() || (!ktpFile && !ktpUrl)) {
      setError('Semua field wajib diisi.');
      setIsSaving(false);
      return;
    }

    try {
      let uploadedKtpUrl = ktpUrl;
      let uploadedKtpPublicId = ktpPublicId;

      // Jika user upload file baru, hapus KTP lama lalu upload baru
      if (ktpFile) {
        if (ktpPublicId) {
          await deleteOldKtp(ktpPublicId);
        }
        const data = await handleKtpUpload(ktpFile);
        uploadedKtpUrl = data.secure_url;
        uploadedKtpPublicId = data.public_id;
        setKtpUrl(uploadedKtpUrl);
        setKtpPublicId(uploadedKtpPublicId);
      }

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          nickname,
          chapter,
          ktpUrl: uploadedKtpUrl,
          ktpPublicId: uploadedKtpPublicId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccess('Profil berhasil diperbarui!');
      window.location.reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="pt-24 text-center text-white">Loading profil...</div>;
  }

  if (error && !user) {
    return <div className="pt-24 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-2">
      <div className="flex flex-col items-center w-full max-w-lg p-8 md:p-12 rounded-xl shadow-lg">
        <h1 className="text-3xl font-semibold text-center text-white mb-8">Edit Profile</h1>
        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6 w-full">
          <div>
            <label className="block text-white text-sm mb-1">Nomor Telepon</label>
            <p className="mt-1 text-base border-b border-gray-400 text-white bg-black p-2">{user?.phoneNumber}</p>
          </div>
          <div>
            <label htmlFor="name" className="block text-white text-sm mb-1">Nama Lengkap</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: John Doe"
              className="w-full bg-transparent border-b border-gray-400 text-white py-2 px-1 placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label htmlFor="nickname" className="block text-white text-sm mb-1">Nama Panggilan</label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Contoh: John"
              className="w-full bg-transparent border-b border-gray-400 text-white py-2 px-1 placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
          </div>
          <div>
            <label htmlFor="chapter" className="block text-white text-sm mb-1">Asal Chapter</label>
            <select
              id="chapter"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className="w-full bg-black text-white border-b border-gray-400 py-2 px-1 focus:outline-none focus:border-red-500"
            >
              <option value="Bandung">Bandung</option>
              <option value="Tasik">Tasik</option>
              <option value="Garut">Garut</option>
            </select>
            
          </div>
          <div>
            <label htmlFor="ktp" className="block text-white text-sm mb-1">Upload Foto KTP</label>
            <p className="text-xs text-gray-400 mb-2">Upload dokumen dalam bentuk JPG, PNG, atau PDF</p>
            <div className="flex items-center gap-2">
              <label
                htmlFor="ktp"
                className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-md cursor-pointer border border-gray-600 hover:bg-gray-700 transition"
              >
                <Image src={upload} alt='upload'/>
                <span>Upload dokumen</span>
                <input
                  id="ktp"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    setKtpFile(file);
                    setKtpPreview(file ? URL.createObjectURL(file) : '');
                    setError(null);
                    setSuccess(null);
                  }}
                  className="hidden"
                />
              </label>
              {ktpFile && (
                <div className="flex items-center bg-gray-900 text-white px-2 py-1 rounded">
                  <span className="text-xs">{ktpFile.name}</span>
                  <button
                    type="button"
                    className="ml-2 text-red-400 hover:text-red-600"
                    onClick={() => setKtpFile(null)}
                  >
                    &times;
                  </button>
                </div>
              )}
              {!ktpFile && ktpUrl && (
                <button
                  type="button"
                  className="text-blue-400 underline text-2b hover:text-blue-600 transition cursor-pointer"
                  onClick={() => setShowKtpModal(true)}
                >
                  Lihat dokumen
                </button>
              )}
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            {/* Modal Preview */}
            {showKtpModal && (ktpPreview || ktpUrl) && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
                onClick={() => setShowKtpModal(false)}
              >
                <div
                  className="rounded-lg p-4 max-w-full max-h-full flex flex-col items-center"
                  onClick={e => e.stopPropagation()}
                >
                  <img
                    src={ktpPreview || ktpUrl}
                    alt="Preview KTP"
                    className="max-h-[80vh] max-w-[90vw] object-contain rounded mb-4"
                  />
                  <Button
                    type="button"
                    label="Tutup"
                    onClick={() => setShowKtpModal(false)}
                    className="mt-4"
                  />
                </div>
              </div>
            )}
          </div>
          {success && <p className="text-green-500 text-sm mb-4">{success}</p>}
          <Button
            type="submit"
            label={isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            isLoading={isSaving}
            disabled={isSaving}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-md mt-2"
          />
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;