"use client";
import { useEffect, useState } from "react";

const PAGES = [
  { key: "kegiatan", label: "Kegiatan" },
  { key: "berita", label: "Berita" },
  { key: "dokumentasi", label: "Dokumentasi" },
  { key: "merchandise", label: "Merchandise" },
];

export default function BannerAdsPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingByPage, setUploadingByPage] = useState({}); // { [pageKey]: boolean }
  const [changedByPage, setChangedByPage] = useState({}); // { [pageKey]: boolean }

  useEffect(() => {
    fetch("/api/admin/settings/banner")
      .then((res) => res.json())
      .then((data) => {
        setBanners(data.banners || []);
        setLoading(false);
      });
  }, []);

  const handleChange = (idx, field, value, pageKey) => {
    setSuccess("");
    setError("");
    setBanners((prev) => {
      const copy = [...prev];
      if (idx === -1) {
        // Add new banner for this page
        copy.push({
          page: pageKey,
          enabled: false,
          imageUrl: "",
          targetUrl: "",
          [field]: value,
        });
      } else {
        copy[idx] = { ...copy[idx], [field]: value };
      }
      return copy;
    });
    setChangedByPage((prev) => ({ ...prev, [pageKey]: true }));
  };

  const CLOUDINARY_CLOUD_NAME =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_UPLOAD_PRESET =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const handleImageUpload = async (idx, file, pageKey) => {
    setSuccess("");
    setError("");
    setUploadingByPage((prev) => ({ ...prev, [pageKey]: true }));
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error?.message || "Gagal mengunggah gambar");
      }
      if (data.secure_url) {
        handleChange(idx, "imageUrl", data.secure_url, pageKey);
        setSuccess("Gambar berhasil diunggah.");
      }
    } catch (e) {
      setError(e.message || "Gagal mengunggah gambar");
    } finally {
      setUploadingByPage((prev) => ({ ...prev, [pageKey]: false }));
    }
  };

  const handleSave = async (banner) => {
    setSaving(true);
    setError("");
    setSuccess("");
    const method = banner.id ? "PUT" : "POST";
    const res = await fetch("/api/admin/settings/banner", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(banner),
    });
    if (!res.ok) {
      setError("Gagal menyimpan banner");
    } else {
      // Refresh banners
      const data = await fetch("/api/admin/settings/banner").then((r) =>
        r.json()
      );
      setBanners(data.banners || []);
      setSuccess("Banner berhasil disimpan.");
      setChangedByPage((prev) => ({ ...prev, [banner.page]: false }));
    }
    setSaving(false);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-8 h-8 rounded-full border-4 border-white border-t-transparent animate-spin"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#141415] text-white p-8">
      <div className="max-w-4xl p-4 rounded-xl shadow-md">
        <h1 className="text-h2 mb-6">Manajemen Banner Ads</h1>
        {success && (
          <div className="mb-4 rounded-md border border-green-700 bg-green-900/30 text-green-300 px-4 py-2">
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-md border border-red-700 bg-red-900/30 text-red-300 px-4 py-2">
            {error}
          </div>
        )}
        <div className="space-y-8">
          {PAGES.map((page) => {
            const banner = banners.find((b) => b.page === page.key) || {
              page: page.key,
              enabled: false,
              imageUrl: "",
              targetUrl: "",
            };
            const idx = banners.findIndex((b) => b.page === page.key);
            return (
              <div key={page.key} className="bg-[#222225] border border-[#222225] p-6 rounded-xl shadow flex flex-col gap-5">
                <h2 className="text-lg font-semibold mb-2 text-white">{page.label}</h2>
                <label className="flex items-center gap-2 mb-2 text-[#B3B4B6]">
                  <input
                    type="checkbox"
                    checked={banner.enabled}
                    onChange={(e) =>
                      handleChange(idx, "enabled", e.target.checked, page.key)
                    }
                    className="w-5 h-5 accent-[#C4A254] bg-[#141415] border-[#B3B4B6] rounded focus:ring-0"
                  />
                  <span>Aktifkan Banner</span>
                </label>
                <div>
                  <label className="block text-b2 text-[#B3B4B6] mb-1">
                    Target URL
                  </label>
                  <input
                    type="text"
                    className="w-full bg-[#181818] border border-[#B3B4B6] text-white px-4 py-2 rounded-md focus:outline-none focus:border-[#C4A254] placeholder-[#B3B4B6]"
                    placeholder="https://example.com"
                    value={banner.targetUrl}
                    onChange={(e) =>
                      handleChange(idx, "targetUrl", e.target.value, page.key)
                    }
                  />
                </div>
                <div>
                  <label className="block text-b2 text-[#B3B4B6] mb-1">
                    Gambar Banner <span className="text-[#88898d]">(JPG/PNG)</span>
                  </label>
                  {uploadingByPage[page.key] && (
                    <div className="flex items-center gap-2 text-[#B3B4B6] mb-2">
                      <div className="w-4 h-4 rounded-full border-2 border-[#B3B4B6] border-t-transparent animate-spin"></div>
                      <span>Mengunggah...</span>
                    </div>
                  )}
                  {banner.imageUrl && (
                    <img
                      src={banner.imageUrl}
                      alt="Banner"
                      className="h-28 rounded-md mb-2 border border-[#B3B4B6] object-cover bg-[#181818]"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload(idx, e.target.files[0], page.key)
                    }
                    disabled={!!uploadingByPage[page.key] || saving}
                    className="block w-full mt-2 text-[#B3B4B6] disabled:opacity-60 disabled:cursor-not-allowed file:bg-[#222225] file:border file:px-2 file:py-1 file:rounded file:border-[#B3B4B6] file:text-[#B3B4B6] file:cursor-pointer"
                  />
                </div>
                <div className="flex justify-end">
                  {changedByPage[page.key] && (
                    <span className="mr-3 self-center text-xs text-[#C4A254]">Perubahan belum disimpan</span>
                  )}
                  <button
                    className="px-6 py-2 bg-[#E53935] hover:bg-[#c62828] text-white rounded-md transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                    onClick={() => handleSave(banner)}
                    disabled={saving || !!uploadingByPage[page.key]}
                  >
                    {saving ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                        Menyimpan...
                      </>
                    ) : (
                      <>{banner.id ? "Update" : "Create"} Banner</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}