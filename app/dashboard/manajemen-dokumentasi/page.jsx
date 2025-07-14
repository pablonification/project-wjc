"use client";
import { useState, useEffect } from "react";

const DokumenDashboard = () => {
  const [docs, setDocs] = useState([]);
  const [form, setForm] = useState({ name: "", url: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
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
    fetchDocs();
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      const newDoc = await res.json();
      setDocs([newDoc, ...docs]);
      setForm({ name: "", url: "" });
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
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
          />
          <input
            name="url"
            value={form.url}
            onChange={handleChange}
            placeholder="https://drive.google.com/..."
            className="w-full border px-3 py-2 rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Tambah Dokumen
          </button>
        </form>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {loading ? (
          <p>Memuat data...</p>
        ) : docs.length ? (
          <ul className="space-y-3">
            {docs.map((d) => (
              <li
                key={d.id}
                className="flex justify-between items-center border p-3 rounded"
              >
                <a
                  href={d.url}
                  target="_blank"
                  className="text-indigo-600 hover:underline"
                >
                  {d.name}
                </a>
                <span className="text-xs text-gray-500">
                  {new Date(d.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p>Tidak ada dokumen.</p>
        )}
      </div>
    </div>
  );
};

export default DokumenDashboard;
