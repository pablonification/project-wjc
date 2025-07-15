"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

const EditDokumenPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [form, setForm] = useState({
    name: "",
    url: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchDoc = async () => {
        try {
          const res = await fetch(`/api/dokumentasi/${id}`);
          if (!res.ok) throw new Error("Gagal mengambil data dokumen");
          const data = await res.json();
          setForm({
            name: data.name,
            url: data.url,
          });
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchDoc();
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validasi nama dan url tidak kosong
    if (!form.name.trim() || !form.url.trim()) {
      setError("Nama dan URL tidak boleh kosong");
      return;
    }

    // Pastikan URL diawali dengan http:// atau https://
    let fixedUrl = form.url.trim();
    if (!/^https?:\/\//i.test(fixedUrl)) {
      fixedUrl = `https://${fixedUrl}`;
    }

    try {
      const payload = { ...form, url: fixedUrl };

      const res = await fetch(`/api/dokumentasi/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal mengupdate dokumen");
      }

      router.push("/dashboard/manajemen-dokumentasi");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Memuat...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6">Edit Dokumen</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nama Dokumen"
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            name="url"
            value={form.url}
            onChange={handleChange}
            placeholder="https://drive.google.com/..."
            className="w-full border px-3 py-2 rounded"
            required
          />
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Update Dokumen
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

export default EditDokumenPage; 