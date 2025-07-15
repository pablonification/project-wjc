"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { uploadToCloudinary } from "@/lib/uploadImage";

const EditBeritaPage = () => {
  const router = useRouter();
  const params = useParams();
  const { slug } = params;

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
    if (slug) {
      const fetchBerita = async () => {
        try {
          const res = await fetch(`/api/berita/${slug}`);
          if (!res.ok) throw new Error("Gagal mengambil data berita");
          const data = await res.json();
          setForm({
            title: data.title,
            category: data.category || "",
            content: data.content || "",
            imageUrl: data.imageUrl || "",
            file: null,
          });
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchBerita();
    }
  }, [slug]);

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

      const payload = { ...form, imageUrl };

      const res = await fetch(`/api/berita/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal mengupdate berita");
      }

      router.push("/dashboard/manajemen-berita");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Memuat...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6">Edit Berita</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          {form.imageUrl && (
            <img
              src={form.imageUrl}
              alt="Current image"
              className="w-full h-auto rounded-lg"
            />
          )}
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
            rows={10}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Update Berita
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400"
            >
              Batal
            </button>
          </div>
        </form>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default EditBeritaPage; 