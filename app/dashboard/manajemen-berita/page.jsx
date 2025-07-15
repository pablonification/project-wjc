"use client";
import { useState, useEffect } from "react";
import { uploadToCloudinary } from "@/lib/uploadImage";
import Link from "next/link";

const BeritaDashboard = () => {
  const [news, setNews] = useState([]);
  const [form, setForm] = useState({
    title: "",
    category: "",
    content: "",
    imageUrl: "",
    file: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

    const fetchNews = async () => {
      try {
      setLoading(true);
        const res = await fetch("/api/berita");
        if (!res.ok) throw new Error("Gagal mengambil data berita");
        const data = await res.json();
        setNews(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, file: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      let imageUrl = form.imageUrl;

      if (form.file) {
        imageUrl = await uploadToCloudinary(form.file);
      }

      // The backend will create the slug
      const payload = { ...form, imageUrl, description: form.content }; // description was missing

      const res = await fetch("/api/berita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal menambah berita");
      }
      await fetchNews(); // Refetch all news
      setForm({
        title: "",
        category: "",
        content: "",
        imageUrl: "",
        file: null,
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (slug) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus berita ini?")) {
      try {
        const res = await fetch(`/api/berita/${slug}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Gagal menghapus berita");
        }
        await fetchNews(); // Refetch
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6">Kelola Berita</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Judul"
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Kategori"
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full border px-3 py-2 rounded"
          />
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            placeholder="Konten"
            rows={5}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Tambah Berita
          </button>
        </form>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* List */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Daftar Berita</h2>
        {loading ? (
          <p>Memuat data...</p>
          ) : news.length > 0 ? (
            <div className="space-y-4">
            {news.map((item) => (
                <div key={item.id} className="border p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.category}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/dashboard/manajemen-berita/edit/${item.slug}`} className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                        Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(item.slug)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
            ))}
            </div>
        ) : (
          <p>Tidak ada berita.</p>
        )}
        </div>
      </div>
    </div>
  );
};

export default BeritaDashboard;
