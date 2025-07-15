"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const DokumenDashboard = () => {
  const [docs, setDocs] = useState([]);
  const [form, setForm] = useState({ name: "", url: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dokumentasi");
      if (!res.ok) throw new Error("Gagal mengambil data");
      const data = await res.json();
      setDocs(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

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
      const res = await fetch("/api/dokumentasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, url: fixedUrl }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal menambah dokumen");
      }
      await fetchDocs();
      setForm({ name: "", url: "" });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) {
      try {
        const res = await fetch(`/api/dokumentasi/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Gagal menghapus dokumen");
        }
        await fetchDocs(); // Refetch
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6">Kelola Dokumentasi</h1>
        <p className="text-sm text-gray-600 mb-4">
          Reminder: Pastikan link Google Drive di-set ke{" "}
          <strong>Anyone with the link</strong> & permission{" "}
          <strong>Editor</strong> agar semua orang dapat mengunduh & mengunggah.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
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
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Tambah Dokumen
          </button>
        </form>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Daftar Dokumen</h2>
          {loading ? (
            <p>Memuat data...</p>
          ) : docs.length > 0 ? (
            <div className="space-y-3">
              {docs.map((d) => (
                <div
                  key={d.id}
                  className="flex justify-between items-center border p-3 rounded-lg"
                >
                  <div>
                    <a
                      href={d.url}
                      target="_blank"
                      className="text-indigo-600 hover:underline"
                    >
                      {d.name}
                    </a>
                    <span className="text-xs text-gray-500 ml-4">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/dashboard/manajemen-dokumentasi/edit/${d.id}`} className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>Tidak ada dokumen.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DokumenDashboard;
