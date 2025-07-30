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

  useEffect(() => {
    fetch("/api/admin/settings/banner")
      .then((res) => res.json())
      .then((data) => {
        setBanners(data.banners || []);
        setLoading(false);
      });
  }, []);

  const handleChange = (idx, field, value, pageKey) => {
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
  };

  const CLOUDINARY_CLOUD_NAME =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_UPLOAD_PRESET =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const handleImageUpload = async (idx, file, pageKey) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await res.json();
    if (data.secure_url) {
      handleChange(idx, "imageUrl", data.secure_url, pageKey);
    }
  };

  const handleSave = async (banner) => {
    setSaving(true);
    setError("");
    const method = banner.id ? "PUT" : "POST";
    const res = await fetch("/api/admin/settings/banner", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(banner),
    });
    if (!res.ok) {
      setError("Failed to save banner");
    } else {
      // Refresh banners
      const data = await fetch("/api/admin/settings/banner").then((r) =>
        r.json()
      );
      setBanners(data.banners || []);
    }
    setSaving(false);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Banner Ads Management</h1>
      {PAGES.map((page, i) => {
        const banner = banners.find((b) => b.page === page.key) || {
          page: page.key,
          enabled: false,
          imageUrl: "",
          targetUrl: "",
        };
        const idx = banners.findIndex((b) => b.page === page.key);
        return (
          <div key={page.key} className="mb-8 border p-4 rounded bg-white">
            <h2 className="font-semibold mb-2">{page.label}</h2>
            <label className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={banner.enabled}
                onChange={(e) =>
                  handleChange(idx, "enabled", e.target.checked, page.key)
                }
              />
              Enable Banner
            </label>
            <div className="mb-2">
              <input
                type="text"
                className="border p-2 w-full"
                placeholder="Target URL"
                value={banner.targetUrl}
                onChange={(e) =>
                  handleChange(idx, "targetUrl", e.target.value, page.key)
                }
              />
            </div>
            <div className="mb-2">
              {banner.imageUrl && (
                <img src={banner.imageUrl} alt="Banner" className="h-24 mb-2" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  handleImageUpload(idx, e.target.files[0], page.key)
                }
              />
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={() => handleSave(banner)}
              disabled={saving}
            >
              {banner.id ? "Update" : "Create"} Banner
            </button>
          </div>
        );
      })}
      {error && <div className="text-red-600 mt-4">{error}</div>}
    </div>
  );
}
