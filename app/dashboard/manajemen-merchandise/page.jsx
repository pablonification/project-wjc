"use client";
import { useState, useEffect } from "react";
import { uploadToCloudinary } from "@/lib/uploadImage";

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

  useEffect(() => {
    const fetchItems = async () => {
      try {
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
    fetchItems();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, files: Array.from(e.target.files) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      const newItem = await res.json();
      setItems([newItem, ...items]);
      setForm({
        name: "",
        price: "",
        category: "",
        description: "",
        imageUrls: [],
        files: [],
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6">Kelola Merchandise</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nama Produk"
            className="w-full border px-3 py-2 rounded"
          />
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Harga (mis: 100000)"
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
            multiple
            onChange={handleFileChange}
            className="w-full border px-3 py-2 rounded"
          />
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
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Tambah Produk
          </button>
        </form>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* List */}
        {loading ? (
          <p>Memuat data...</p>
        ) : items.length ? (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="border p-4 rounded flex justify-between items-center"
              >
                <div>
                  <h2 className="font-semibold">{item.name}</h2>
                  <p className="text-sm text-gray-600">{item.category}</p>
                  <p className="font-bold text-gray-800">
                    Rp{new Intl.NumberFormat("id-ID").format(item.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Tidak ada merchandise.</p>
        )}
      </div>
    </div>
  );
};

export default MerchandiseDashboard;
