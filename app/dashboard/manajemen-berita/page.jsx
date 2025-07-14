"use client";
import { useState, useEffect } from "react";
import { uploadToCloudinary } from "@/lib/uploadImage";

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

  useEffect(() => {
    const fetchNews = async () => {
      try {
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
    try {
      let imageUrl = form.imageUrl;

      if (form.file) {
        imageUrl = await uploadToCloudinary(form.file);
      }

      const payload = { ...form, imageUrl };

      const res = await fetch("/api/berita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal menambah berita");
      }
      const newItem = await res.json();
      setNews([newItem, ...news]);
      setForm({
        title: "",
        category: "",
        content: "",
        imageUrl: "",
        file: null,
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6">Kelola Berita</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Judul"
            className="w-full border px-3 py-2 rounded"
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
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Tambah Berita
          </button>
        </form>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* List */}
        {loading ? (
          <p>Memuat data...</p>
        ) : news.length ? (
          <ul className="space-y-4">
            {news.map((item) => (
              <li key={item.id} className="border p-4 rounded">
                <h2 className="font-semibold">{item.title}</h2>
                <p className="text-sm text-gray-600">{item.category}</p>
                <p className="text-gray-800 line-clamp-2">{item.content}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Tidak ada berita.</p>
        )}
      </div>
    </div>
  );
};

export default BeritaDashboard;
