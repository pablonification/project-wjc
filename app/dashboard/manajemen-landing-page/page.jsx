'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '../../components';
import Image from 'next/image';
import { upload } from "../../../public/assets/image";

const ManajemenLandingPage = () => {
  // State hero section
  const [heroTitle, setHeroTitle] = useState('');
  const [heroDescription, setHeroDescription] = useState('');
  const [heroButton, setHeroButton] = useState('');
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [heroImagePublicId, setHeroImagePublicId] = useState('');
  const [heroImageFile, setHeroImageFile] = useState(null);
  const [heroImagePreview, setHeroImagePreview] = useState('');
  const [showHeroImageModal, setShowHeroImageModal] = useState(false);

  // State tentang section
  const [tentangTitle, setTentangTitle] = useState('');
  const [tentangDescription, setTentangDescription] = useState('');
  const [tentangButton, setTentangButton] = useState('');
  const [tentangImageUrl, setTentangImageUrl] = useState('');
  const [tentangImagePublicId, setTentangImagePublicId] = useState('');
  const [tentangImageFile, setTentangImageFile] = useState(null);
  const [tentangImagePreview, setTentangImagePreview] = useState('');
  const [showTentangImageModal, setShowTentangImageModal] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [isSavingTentang, setIsSavingTentang] = useState(false);
  const [error, setError] = useState(null);
  const [heroSuccess, setHeroSuccess] = useState(null);
  const [tentangSuccess, setTentangSuccess] = useState(null);

  // Ref untuk reset file input
  const heroImageInputRef = useRef(null);
  const tentangImageInputRef = useRef(null);

  // Fetch data saat halaman dimuat
  useEffect(() => {
    const fetchLandingPageContent = async () => {
      try {
        const res = await fetch('/api/admin/landing-page');

        if (!res.ok) throw new Error('Gagal mengambil data landing page.');
        
        const data = await res.json();
        const content = data.data;
        
        // Hero section
        setHeroTitle(content.heroTitle || '');
        setHeroDescription(content.heroDescription || '');
        setHeroButton(content.heroButton || '');
        setHeroImageUrl(content.heroImageUrl || '');
        setHeroImagePublicId(content.heroImagePublicId || '');
        
        // Tentang section
        setTentangTitle(content.tentangTitle || '');
        setTentangDescription(content.tentangDescription || '');
        setTentangButton(content.tentangButton || '');
        setTentangImageUrl(content.tentangImageUrl || '');
        setTentangImagePublicId(content.tentangImagePublicId || '');
        
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLandingPageContent();
  }, []);

  // Auto-hide success after 2.5s
  useEffect(() => {
    if (heroSuccess) {
      const timer = setTimeout(() => setHeroSuccess(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [heroSuccess]);
  useEffect(() => {
    if (tentangSuccess) {
      const timer = setTimeout(() => setTentangSuccess(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [tentangSuccess]);

  // Fungsi upload ke Cloudinary
  const handleImageUpload = async (file) => {
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
    throw new Error('Gagal upload gambar');
  };

  // Fungsi hapus gambar lama di Cloudinary
  const deleteOldImage = async (publicId) => {
    if (!publicId) return;
    await fetch('/api/admin/delete-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publicId }),
    });
  };

  // Hapus gambar di Cloudinary dan database
  const handleDeleteImage = async (section, publicId) => {
    if (!publicId) return;
    
    const confirmDelete = window.confirm(`Yakin ingin menghapus gambar ${section}?`);
    if (!confirmDelete) return;

    try {
      if (section === 'hero') {
        setIsSavingHero(true);
      } else {
        setIsSavingTentang(true);
      }

      // Hapus gambar di Cloudinary
      await deleteOldImage(publicId);

      // Update database - set image ke null
      const updateData = {};
      if (section === 'hero') {
        updateData.heroImageUrl = null;
        updateData.heroImagePublicId = null;
      } else {
        updateData.tentangImageUrl = null;
        updateData.tentangImagePublicId = null;
      }

      const res = await fetch('/api/admin/landing-page', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Update state & RESET FILE INPUT DOM
      if (section === 'hero') {
        setHeroImageUrl('');
        setHeroImagePublicId('');
        setHeroImageFile(null);
        setHeroImagePreview('');
        setHeroSuccess('Gambar hero berhasil dihapus!');
        if (heroImageInputRef.current) heroImageInputRef.current.value = "";
      } else {
        setTentangImageUrl('');
        setTentangImagePublicId('');
        setTentangImageFile(null);
        setTentangImagePreview('');
        setTentangSuccess('Gambar tentang berhasil dihapus!');
        if (tentangImageInputRef.current) tentangImageInputRef.current.value = "";
      }

      // Trigger refresh pada landing page components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('landingPageUpdated', {
          detail: {
            section: section,
            timestamp: Date.now(),
            action: 'deleteImage',
            data: data.data
          }
        }));
      }

    } catch (error) {
      setError(error.message);
    } finally {
      if (section === 'hero') {
        setIsSavingHero(false);
      } else {
        setIsSavingTentang(false);
      }
    }
  };

  // Handler untuk update Hero Section
  const handleUpdateHeroSection = async (e) => {
    e.preventDefault();
    setIsSavingHero(true);
    setError(null);
    setHeroSuccess(null);
    setTentangSuccess(null);

    try {
      let uploadedHeroImageUrl = heroImageUrl;
      let uploadedHeroImagePublicId = heroImagePublicId;

      // Upload gambar hero jika ada file baru
      if (heroImageFile) {
        if (heroImagePublicId) {
          await deleteOldImage(heroImagePublicId);
        }
        const heroData = await handleImageUpload(heroImageFile);
        uploadedHeroImageUrl = heroData.secure_url;
        uploadedHeroImagePublicId = heroData.public_id;
        setHeroImageUrl(uploadedHeroImageUrl);
        setHeroImagePublicId(uploadedHeroImagePublicId);
      }

      // Hanya kirim data yang diubah (partial update)
      const updateData = {};
      
      if (heroTitle.trim()) updateData.heroTitle = heroTitle.trim();
      if (heroDescription.trim()) updateData.heroDescription = heroDescription.trim();
      if (heroButton.trim()) updateData.heroButton = heroButton.trim();
      if (heroImageFile || uploadedHeroImageUrl !== heroImageUrl) {
        updateData.heroImageUrl = uploadedHeroImageUrl;
        updateData.heroImagePublicId = uploadedHeroImagePublicId;
      }

      const res = await fetch('/api/admin/landing-page', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setHeroSuccess('Hero Section berhasil diperbarui!');
      setHeroImageFile(null);
      setHeroImagePreview('');
      if (heroImageInputRef.current) heroImageInputRef.current.value = "";

      // Trigger event untuk refresh landing page components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('landingPageUpdated', {
          detail: {
            section: 'hero',
            timestamp: Date.now(),
            data: data.data
          }
        }));
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSavingHero(false);
    }
  };

  // Handler untuk update Tentang Section
  const handleUpdateTentangSection = async (e) => {
    e.preventDefault();
    setIsSavingTentang(true);
    setError(null);
    setHeroSuccess(null);
    setTentangSuccess(null);

    try {
      let uploadedTentangImageUrl = tentangImageUrl;
      let uploadedTentangImagePublicId = tentangImagePublicId;

      // Upload gambar tentang jika ada file baru
      if (tentangImageFile) {
        if (tentangImagePublicId) {
          await deleteOldImage(tentangImagePublicId);
        }
        const tentangData = await handleImageUpload(tentangImageFile);
        uploadedTentangImageUrl = tentangData.secure_url;
        uploadedTentangImagePublicId = tentangData.public_id;
        setTentangImageUrl(uploadedTentangImageUrl);
        setTentangImagePublicId(uploadedTentangImagePublicId);
      }

      // Hanya kirim data yang diubah (partial update)
      const updateData = {};
      
      if (tentangTitle.trim()) updateData.tentangTitle = tentangTitle.trim();
      if (tentangDescription.trim()) updateData.tentangDescription = tentangDescription.trim();
      if (tentangButton.trim()) updateData.tentangButton = tentangButton.trim();
      if (tentangImageFile || uploadedTentangImageUrl !== tentangImageUrl) {
        updateData.tentangImageUrl = uploadedTentangImageUrl;
        updateData.tentangImagePublicId = uploadedTentangImagePublicId;
      }

      const res = await fetch('/api/admin/landing-page', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setTentangSuccess('Tentang Section berhasil diperbarui!');
      setTentangImageFile(null);
      setTentangImagePreview('');
      if (tentangImageInputRef.current) tentangImageInputRef.current.value = "";

      // Trigger event untuk refresh landing page components
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('landingPageUpdated', {
          detail: {
            section: 'tentang',
            timestamp: Date.now(),
            data: data.data
          }
        }));
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSavingTentang(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-8 h-8 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#141415] text-white p-8">
      <div className="max-w-5xl p-4">
        <h1 className="text-h2 mb-8">Manajemen Landing Page</h1>
        <p className="text-[#B3B4B6] mb-8">
          Edit konten yang ingin diubah. Kosongkan field yang tidak ingin diubah.
        </p>
        
        <div className="space-y-10">
          {/* Hero Section Form */}
          <form onSubmit={handleUpdateHeroSection} className="bg-[#1E1E20] p-8 rounded-xl shadow-md space-y-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Hero Section</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="heroTitle" className="block text-b2 text-[#B3B4B6] mb-2">
                  Judul Hero <span className="text-[#88898d]">(Opsional)</span>
                </label>
                <input
                  id="heroTitle"
                  type="text"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin mengubah"
                  className="w-full bg-[#222225] border border-[#B3B4B6] text-white py-2 px-3 rounded-md focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label htmlFor="heroDescription" className="block text-b2 text-[#B3B4B6] mb-2">
                  Deskripsi Hero <span className="text-[#88898d]">(Opsional)</span>
                </label>
                <textarea
                  id="heroDescription"
                  rows={4}
                  value={heroDescription}
                  onChange={(e) => setHeroDescription(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin mengubah"
                  className="w-full bg-[#222225] border border-[#B3B4B6] text-white py-2 px-3 rounded-md focus:outline-none focus:border-red-500 resize-vertical"
                />
              </div>
              <div>
                <label htmlFor="heroButton" className="block text-b2 text-[#B3B4B6] mb-2">
                  Teks Tombol Hero <span className="text-[#88898d]">(Opsional)</span>
                </label>
                <input
                  id="heroButton"
                  type="text"
                  value={heroButton}
                  onChange={(e) => setHeroButton(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin mengubah"
                  className="w-full bg-[#222225] border border-[#B3B4B6] text-white py-2 px-3 rounded-md focus:outline-none focus:border-red-500"
                />
              </div>
              {/* Upload Gambar Hero */}
              <div>
                <label htmlFor="heroImage" className="block text-b2 text-[#B3B4B6] mb-2">
                  Gambar Background Hero <span className="text-[#88898d]">(Opsional)</span>
                </label>
                <p className="text-xs text-[#88898d] mb-2">Upload gambar JPG/PNG jika ingin mengubah</p>
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="heroImage"
                    className="flex items-center gap-2 px-4 py-2 bg-[#222225] text-white rounded-md cursor-pointer border border-[#B3B4B6] hover:bg-[#2d2d30] transition"
                  >
                    <Image src={upload} alt='upload' width={16} height={16}/>
                    <span>Upload gambar</span>
                    <input
                      ref={heroImageInputRef}
                      id="heroImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setHeroImageFile(file);
                        setHeroImagePreview(file ? URL.createObjectURL(file) : '');
                        setError(null);
                        setHeroSuccess(null);
                        setTentangSuccess(null);
                      }}
                      className="hidden"
                    />
                  </label>
                  {heroImageFile && (
                    <div className="flex items-center bg-[#222225] text-white px-3 py-1 rounded">
                      <span className="text-xs">{heroImageFile.name}</span>
                      <button
                        type="button"
                        className="ml-2 text-red-400 hover:text-red-600"
                        onClick={() => {
                          setHeroImageFile(null);
                          setHeroImagePreview('');
                          if (heroImageInputRef.current) heroImageInputRef.current.value = "";
                        }}
                      >
                        &times;
                      </button>
                    </div>
                  )}
                  {!heroImageFile && heroImageUrl && (
                    <>
                      <button
                        type="button"
                        className="text-[#5F9DF7] underline text-sm hover:text-[#2e6dbd] transition cursor-pointer"
                        onClick={() => setShowHeroImageModal(true)}
                      >
                        Lihat gambar saat ini
                      </button>
                      <button
                        type="button"
                        className="text-[#E53935] underline text-sm hover:text-[#c62828] transition cursor-pointer"
                        onClick={() => handleDeleteImage('hero', heroImagePublicId)}
                        disabled={isSavingHero}
                      >
                        {isSavingHero ? 'Menghapus...' : 'Hapus gambar'}
                      </button>
                    </>
                  )}
                </div>
                {/* Modal Preview Hero Image */}
                {showHeroImageModal && (heroImagePreview || heroImageUrl) && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
                    onClick={() => setShowHeroImageModal(false)}
                  >
                    <div
                      className="rounded-lg p-4 max-w-full max-h-full flex flex-col items-center"
                      onClick={e => e.stopPropagation()}
                    >
                      <img
                        src={heroImagePreview || heroImageUrl}
                        alt="Preview Hero"
                        className="max-h-[80vh] max-w-[90vw] object-contain rounded mb-4"
                      />
                      <Button
                        type="button"
                        label="Tutup"
                        onClick={() => setShowHeroImageModal(false)}
                        className="mt-4"
                      />
                    </div>
                  </div>
                )}
              </div>
              {/* Success Message untuk Hero */}
              {heroSuccess && (
                <div className="bg-[#1F4439] border border-green-700 text-green-100 px-4 py-3 rounded">
                  {heroSuccess}
                </div>
              )}
              {/* Submit Button untuk Hero */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  label={isSavingHero ? 'Menyimpan Hero...' : 'Simpan Hero Section'}
                  isLoading={isSavingHero}
                  disabled={isSavingHero}
                  className="bg-[#E53935] hover:bg-[#c62828] text-white px-6 py-3 rounded-md font-semibold transition"
                />
              </div>
            </div>
          </form>

          {/* Tentang Section Form */}
          <form onSubmit={handleUpdateTentangSection} className="bg-[#1E1E20] p-8 rounded-xl shadow-md space-y-6">
            <h2 className="text-xl font-semibold mb-4 text-white">Tentang Section</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="tentangTitle" className="block text-b2 text-[#B3B4B6] mb-2">
                  Judul Tentang <span className="text-[#88898d]">(Opsional)</span>
                </label>
                <input
                  id="tentangTitle"
                  type="text"
                  value={tentangTitle}
                  onChange={(e) => setTentangTitle(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin mengubah"
                  className="w-full bg-[#222225] border border-[#B3B4B6] text-white py-2 px-3 rounded-md focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label htmlFor="tentangDescription" className="block text-b2 text-[#B3B4B6] mb-2">
                  Deskripsi Tentang <span className="text-[#88898d]">(Opsional)</span>
                </label>
                <textarea
                  id="tentangDescription"
                  rows={6}
                  value={tentangDescription}
                  onChange={(e) => setTentangDescription(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin mengubah"
                  className="w-full bg-[#222225] border border-[#B3B4B6] text-white py-2 px-3 rounded-md focus:outline-none focus:border-red-500 resize-vertical"
                />
              </div>
              <div>
                <label htmlFor="tentangButton" className="block text-b2 text-[#B3B4B6] mb-2">
                  Teks Tombol Tentang <span className="text-[#88898d]">(Opsional)</span>
                </label>
                <input
                  id="tentangButton"
                  type="text"
                  value={tentangButton}
                  onChange={(e) => setTentangButton(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin mengubah"
                  className="w-full bg-[#222225] border border-[#B3B4B6] text-white py-2 px-3 rounded-md focus:outline-none focus:border-red-500"
                />
              </div>
              {/* Upload Gambar Tentang */}
              <div>
                <label htmlFor="tentangImage" className="block text-b2 text-[#B3B4B6] mb-2">
                  Logo/Gambar Tentang <span className="text-[#88898d]">(Opsional)</span>
                </label>
                <p className="text-xs text-[#88898d] mb-2">Upload gambar JPG/PNG jika ingin mengubah</p>
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="tentangImage"
                    className="flex items-center gap-2 px-4 py-2 bg-[#222225] text-white rounded-md cursor-pointer border border-[#B3B4B6] hover:bg-[#2d2d30] transition"
                  >
                    <Image src={upload} alt='upload' width={16} height={16}/>
                    <span>Upload gambar</span>
                    <input
                      ref={tentangImageInputRef}
                      id="tentangImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setTentangImageFile(file);
                        setTentangImagePreview(file ? URL.createObjectURL(file) : '');
                        setError(null);
                        setHeroSuccess(null);
                        setTentangSuccess(null);
                      }}
                      className="hidden"
                    />
                  </label>
                  {tentangImageFile && (
                    <div className="flex items-center bg-[#222225] text-white px-3 py-1 rounded">
                      <span className="text-xs">{tentangImageFile.name}</span>
                      <button
                        type="button"
                        className="ml-2 text-red-400 hover:text-red-600"
                        onClick={() => {
                          setTentangImageFile(null);
                          setTentangImagePreview('');
                          if (tentangImageInputRef.current) tentangImageInputRef.current.value = "";
                        }}
                      >
                        &times;
                      </button>
                    </div>
                  )}
                  {!tentangImageFile && tentangImageUrl && (
                    <>
                      <button
                        type="button"
                        className="text-[#5F9DF7] underline text-sm hover:text-[#2e6dbd] transition cursor-pointer"
                        onClick={() => setShowTentangImageModal(true)}
                      >
                        Lihat gambar saat ini
                      </button>
                      <button
                        type="button"
                        className="text-[#E53935] underline text-sm hover:text-[#c62828] transition cursor-pointer"
                        onClick={() => handleDeleteImage('tentang', tentangImagePublicId)}
                        disabled={isSavingTentang}
                      >
                        {isSavingTentang ? 'Menghapus...' : 'Hapus gambar'}
                      </button>
                    </>
                  )}
                </div>
                {/* Modal Preview Tentang Image */}
                {showTentangImageModal && (tentangImagePreview || tentangImageUrl) && (
                  <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
                    onClick={() => setShowTentangImageModal(false)}
                  >
                    <div
                      className="rounded-lg p-4 max-w-full max-h-full flex flex-col items-center"
                      onClick={e => e.stopPropagation()}
                    >
                      <img
                        src={tentangImagePreview || tentangImageUrl}
                        alt="Preview Tentang"
                        className="max-h-[80vh] max-w-[90vw] object-contain rounded mb-4"
                      />
                      <Button
                        type="button"
                        label="Tutup"
                        onClick={() => setShowTentangImageModal(false)}
                        className="mt-4"
                      />
                    </div>
                  </div>
                )}
              </div>
              {/* Success Message untuk Tentang */}
              {tentangSuccess && (
                <div className="bg-[#1F4439] border border-green-700 text-green-100 px-4 py-3 rounded">
                  {tentangSuccess}
                </div>
              )}
              {/* Submit Button untuk Tentang */}
              <div className="flex justify-end">
                <Button
                  type="submit"
                  label={isSavingTentang ? 'Menyimpan Tentang...' : 'Simpan Tentang Section'}
                  isLoading={isSavingTentang}
                  disabled={isSavingTentang}
                  className="bg-[#E53935] hover:bg-[#c62828] text-white px-6 py-3 rounded-md font-semibold transition"
                />
              </div>
            </div>
          </form>

          {/* Error Message Global */}
          {error && (
            <div className="bg-[#2e0707] border border-red-700 text-red-100 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManajemenLandingPage;