'use client';

import { useState } from 'react';
import { Button } from '../components';
import Image from 'next/image';
import { upload } from "../../public/assets/image";
import { useRouter } from 'next/navigation';

export default function ProfileClient({ initialUser }) {
  // Inisialisasi state form langsung dari props, tidak perlu fetch lagi di sini
  const [name, setName] = useState(initialUser.name || '');
  const [nickname, setNickname] = useState(initialUser.nickname || '');
  const [chapter, setChapter] = useState(initialUser.chapter || 'Bandung');
  const [ktpUrl, setKtpUrl] = useState(initialUser.ktpUrl || '');
  const [ktpPublicId, setKtpPublicId] = useState(initialUser.ktpPublicId || '');
  
  // State untuk manajemen file dan UI
  const [ktpFile, setKtpFile] = useState(null);
  const [ktpPreview, setKtpPreview] = useState('');
  const [showKtpModal, setShowKtpModal] = useState(false);

  // State untuk loading dan pesan feedback
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fungsi untuk mengunggah gambar ke Cloudinary
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
      return data;
    }
    throw new Error('Gagal upload foto KTP');
  };

  // Fungsi untuk menghapus gambar lama di Cloudinary via API
  const deleteOldKtp = async (publicId) => {
    if (!publicId) return;
    try {
        await fetch('/api/user/profile/delete-ktp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicId }),
        });
    } catch (error) {
        console.error("Gagal menghapus KTP lama, melanjutkan proses update:", error);
    }
  };

  // Handler untuk menyimpan perubahan profil
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    if (!name.trim() || !nickname.trim() || !chapter.trim() || (!ktpFile && !ktpUrl)) {
      setError('Semua field wajib diisi, termasuk upload KTP.');
      setIsSaving(false);
      return;
    }

    try {
      let uploadedKtpUrl = ktpUrl;
      let uploadedKtpPublicId = ktpPublicId;

      if (ktpFile) {
        if (ktpPublicId) {
          await deleteOldKtp(ktpPublicId);
        }
        const data = await handleKtpUpload(ktpFile);
        uploadedKtpUrl = data.secure_url;
        uploadedKtpPublicId = data.public_id;
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
      if (!res.ok) throw new Error(data.message || "Gagal memperbarui profil.");
      
      setSuccess('Profil berhasil diperbarui!');
      setKtpUrl(uploadedKtpUrl);
      setKtpPublicId(uploadedKtpPublicId);
      setKtpFile(null);
      setKtpPreview('');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };
  const router = useRouter();
  const handleNavigateToForgotPassword = () => {
    router.replace('/change-password');
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-2 pt-24 pb-12">
      <div className="flex flex-col items-center w-full max-w-lg p-8 md:p-12 rounded-xl shadow-lg">
        <h1 className="text-3xl font-semibold text-center text-white mb-8">Edit Profile</h1>
        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-6 w-full">
          {/* Nomor Telepon (Read-only) */}
          <div>
            <label className="block text-white text-sm mb-1">Nomor Telepon</label>
            <p className="mt-1 text-base border-b border-gray-400 text-gray-400 bg-black p-2">{initialUser?.phoneNumber}</p>
          </div>
          
          {/* Nama Lengkap */}
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

          {/* Nama Panggilan */}
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

          {/* Asal Chapter */}
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

          {/* Upload KTP */}
          <div>
            <label htmlFor="ktp" className="block text-white text-sm mb-1">Upload Foto KTP</label>
            <p className="text-xs text-gray-400 mb-2">Upload dokumen dalam bentuk JPG, PNG, atau PDF</p>
            <div className="flex items-center gap-2">
              <label htmlFor="ktp" className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-md cursor-pointer border border-gray-600 hover:bg-gray-700 transition">
                <Image src={upload} alt='upload' width={16} height={16}/>
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
                  <button type="button" className="ml-2 text-red-400 hover:text-red-600" onClick={() => setKtpFile(null)}>
                    &times;
                  </button>
                </div>
              )}
              {!ktpFile && ktpUrl && (
                <button type="button" className="text-blue-400 underline text-sm hover:text-blue-600 transition cursor-pointer" onClick={() => setShowKtpModal(true)}>
                  Lihat dokumen
                </button>
              )}
            </div>
          </div>

          {/* Modal Preview KTP */}
          {showKtpModal && (ktpPreview || ktpUrl) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70" onClick={() => setShowKtpModal(false)}>
              <div className="rounded-lg p-4 max-w-full max-h-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
                <img src={ktpPreview || ktpUrl} alt="Preview KTP" className="max-h-[80vh] max-w-[90vw] object-contain rounded mb-4" />
                <Button type="button" label="Tutup" onClick={() => setShowKtpModal(false)} className="mt-4" />
              </div>
            </div>
          )}

          {/* Pesan Feedback */}
          {success && <p className="text-green-500 text-sm">{success}</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          {/* Tombol Simpan */}
          <Button
            type="submit"
            label={isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            isLoading={isSaving}
            disabled={isSaving}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-md mt-2"
          />
            <button type="button" className="text-blue-400 underline text-sm hover:text-blue-600 transition cursor-pointer" onClick={handleNavigateToForgotPassword}>
                  Ubah Password
            </button>
        </form>
      </div>
    </div>
  );
};