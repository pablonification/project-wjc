"use client";
import { useState, useEffect } from "react";
import { uploadToCloudinary } from "@/lib/uploadImage";

const KegiatanDashboard = () => {
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    dateStart: "",
    dateEnd: "",
    location: "",
    status: "UPCOMING",
    imageUrl: "",
    file: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await fetch("/api/kegiatan");
        if (!res.ok) throw new Error("Gagal mengambil data kegiatan");
        const data = await res.json();
        setActivities(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
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

      const res = await fetch("/api/kegiatan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal menambah kegiatan");
      }
      const newItem = await res.json();
      setActivities([newItem, ...activities]);
      setForm({
        title: "",
        description: "",
        dateStart: "",
        dateEnd: "",
        location: "",
        status: "UPCOMING",
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
        <h1 className="text-2xl font-bold mb-6">Kelola Kegiatan</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Judul"
            className="w-full border px-3 py-2 rounded"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Deskripsi"
            rows={4}
            className="w-full border px-3 py-2 rounded"
          />
          <div className="flex gap-2">
            <input
              type="date"
              name="dateStart"
              value={form.dateStart}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-full"
            />
            <input
              type="date"
              name="dateEnd"
              value={form.dateEnd}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-full"
            />
          </div>
          <input
            name="location"
            value={form.location}
            onChange={handleChange}
            placeholder="Lokasi"
            className="w-full border px-3 py-2 rounded"
          />
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded"
          >
            <option value="UPCOMING">Mendatang</option>
            <option value="ONGOING">Berlangsung</option>
            <option value="COMPLETED">Selesai</option>
          </select>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full border px-3 py-2 rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded"
          >
            Tambah Kegiatan
          </button>
        </form>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* List */}
        {loading ? (
          <p>Memuat data...</p>
        ) : activities.length ? (
          <ul className="space-y-4">
            {activities.map((item) => (
              <li key={item.id} className="border p-4 rounded">
                <h2 className="font-semibold">{item.title}</h2>
                <p className="text-sm text-gray-600">{item.location}</p>
                <p className="text-gray-800 line-clamp-2">{item.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Tidak ada kegiatan.</p>
        )}
      </div>
    </div>
  );
};

export default KegiatanDashboard;
