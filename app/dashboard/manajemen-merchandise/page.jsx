"use client";
import { useState, useEffect } from "react";
import { uploadToCloudinary } from "@/lib/uploadImage";
import Link from "next/link";

const MerchandiseDashboard = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    imageUrls: [],
    files: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [waMerch, setWaMerch] = useState("");
  const [waLoading, setWaLoading] = useState(false);
  const [waMsg, setWaMsg] = useState("");

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/merchandise");
      if (!res.ok) throw new Error("Gagal mengambil data merchandise");
      const data = await res.json();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch WhatsApp number for merchandise
  useEffect(() => {
    const fetchWa = async () => {
      setWaLoading(true);
      const res = await fetch("/api/admin/settings/wa-merch");
      const data = await res.json();
      setWaMerch(data.number || "");
      setWaLoading(false);
    };
    fetchWa();
  }, []);

  const handleWaSubmit = async (e) => {
    e.preventDefault();
    setWaLoading(true);
    setWaMsg("");
    const res = await fetch("/api/admin/settings/wa-merch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: waMerch }),
    });
    const data = await res.json();
    setWaLoading(false);
    if (data.number) setWaMsg("Nomor WhatsApp berhasil disimpan!");
    else setWaMsg(data.error || "Gagal menyimpan nomor WhatsApp");
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 3) {
      alert("Anda hanya dapat mengunggah maksimal 3 gambar.");
      e.target.value = ""; // Clear the file input
      return;
    }
    setForm({ ...form, files: Array.from(e.target.files) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // Upload images first
      let uploadedUrls = [];
      if (form.files.length) {
        uploadedUrls = await Promise.all(
          form.files.map((file) => uploadToCloudinary(file))
        );
      }

      const payload = {
        ...form,
        imageUrls: uploadedUrls,
      };

      const res = await fetch("/api/merchandise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal menambah produk");
      }
      await fetchItems();
      setForm({
        name: "",
        price: "",
        category: "",
        description: "",
        imageUrls: [],
        files: [],
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (slug) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      try {
        const res = await fetch(`/api/merchandise/${slug}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Gagal menghapus produk");
        }
        await fetchItems(); // Refetch
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6">Kelola Merchandise</h1>

        {/* WhatsApp Number Form */}
        <form onSubmit={handleWaSubmit} className="mb-8 flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp Konfirmasi Merchandise</label>
            <input
              type="text"
              value={waMerch}
              onChange={e => setWaMerch(e.target.value)}
              className="border px-3 py-2 rounded w-64"
              placeholder="628xxxxxxxxxx"
              required
              disabled={waLoading}
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" disabled={waLoading}>
            {waLoading ? "Menyimpan..." : "Simpan"}
          </button>
          {waMsg && <span className="text-sm ml-2">{waMsg}</span>}
        </form>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nama Produk"
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Harga (mis: 100000)"
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            name="category"
            value={form.category}
            onChange={handleChange}
            placeholder="Kategori"
            className="w-full border px-3 py-2 rounded"
            required
          />
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full border px-3 py-2 rounded"
            accept="image/*"
          />
           <p className="text-sm text-gray-500">Unggah maksimal 3 gambar.</p>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Deskripsi (opsional)"
            rows={4}
            className="w-full border px-3 py-2 rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Tambah Produk
          </button>
        </form>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* List */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Daftar Produk</h2>
          {loading ? (
            <p>Memuat data...</p>
          ) : items.length > 0 ? (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="border p-4 rounded-lg flex justify-between items-center"
                >
                  <div className="flex items-center space-x-4">
                    {item.imageUrls && item.imageUrls.length > 0 && (
                      <img src={item.imageUrls[0]} alt={item.name} className="w-16 h-16 rounded object-cover" />
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.category}</p>
                      <p className="font-bold text-gray-800">
                        Rp{new Intl.NumberFormat("id-ID").format(item.price)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/dashboard/manajemen-merchandise/buyers/${item.slug}`} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                      Pembeli
                    </Link>
                    <Link href={`/dashboard/manajemen-merchandise/edit/${item.slug}`} className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
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
            <p>Tidak ada merchandise.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MerchandiseDashboard;
