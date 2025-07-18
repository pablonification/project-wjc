"use client";
import { useState, useEffect } from "react";
import { uploadToCloudinary } from "@/lib/uploadImage";
import Link from "next/link";

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
    coverFile: null,
    attachmentFiles: [],
    // Accommodation fields
    accommodationName: "",
    accommodationPriceSharing: "",
    accommodationPriceSingle: "",
    registrationFee: "",
    // T-shirt pricing fields
    tshirtPriceS: "",
    tshirtPriceM: "",
    tshirtPriceL: "",
    tshirtPriceXL: "",
    tshirtPriceXXL: "",
    tshirtPriceXXXL: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [waKegiatan, setWaKegiatan] = useState("");
  const [waLoading, setWaLoading] = useState(false);
  const [waMsg, setWaMsg] = useState("");

  const fetchActivities = async () => {
    try {
      setLoading(true);
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

  // Fetch WhatsApp number for kegiatan
  useEffect(() => {
    const fetchWa = async () => {
      setWaLoading(true);
      const res = await fetch("/api/admin/settings/wa-kegiatan");
      const data = await res.json();
      setWaKegiatan(data.number || "");
      setWaLoading(false);
    };
    fetchWa();
  }, []);

  const handleWaSubmit = async (e) => {
    e.preventDefault();
    setWaLoading(true);
    setWaMsg("");
    const res = await fetch("/api/admin/settings/wa-kegiatan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: waKegiatan }),
    });
    const data = await res.json();
    setWaLoading(false);
    if (data.number) setWaMsg("Nomor WhatsApp berhasil disimpan!");
    else setWaMsg(data.error || "Gagal menyimpan nomor WhatsApp");
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCoverFileChange = (e) => {
    setForm({ ...form, coverFile: e.target.files[0] });
  };

  const handleAttachmentFilesChange = (e) => {
    if (e.target.files.length > 4) {
      alert("Anda hanya dapat mengunggah maksimal 4 gambar attachment.");
      e.target.value = ""; // Clear the file input
      return;
    }
    setForm({ ...form, attachmentFiles: Array.from(e.target.files) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      let coverImageUrl = "";
      if (form.coverFile) {
        coverImageUrl = await uploadToCloudinary(form.coverFile);
      }

      let attachmentImageUrls = [];
      if (form.attachmentFiles.length) {
        attachmentImageUrls = await Promise.all(
          form.attachmentFiles.map((file) => uploadToCloudinary(file))
        );
      }

      const payload = { 
        ...form, 
        imageUrl: coverImageUrl,
        attachmentUrls: attachmentImageUrls
      };

      const res = await fetch("/api/kegiatan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal menambah kegiatan");
      }
      await fetchActivities();
      setForm({
        title: "",
        description: "",
        dateStart: "",
        dateEnd: "",
        location: "",
        status: "UPCOMING",
        imageUrl: "",
        coverFile: null,
        attachmentFiles: [],
        // Accommodation fields
        accommodationName: "",
        accommodationPriceSharing: "",
        accommodationPriceSingle: "",
        registrationFee: "",
        // T-shirt pricing fields
        tshirtPriceS: "",
        tshirtPriceM: "",
        tshirtPriceL: "",
        tshirtPriceXL: "",
        tshirtPriceXXL: "",
        tshirtPriceXXXL: "",
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (slug) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus kegiatan ini?")) {
      try {
        const res = await fetch(`/api/kegiatan/${slug}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Gagal menghapus kegiatan");
        }
        await fetchActivities(); // Refetch
      } catch (err) {
        setError(err.message);
      }
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6">Kelola Kegiatan</h1>

        {/* WhatsApp Number Form */}
        <form onSubmit={handleWaSubmit} className="mb-8 flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor WhatsApp Konfirmasi Kegiatan</label>
            <input
              type="text"
              value={waKegiatan}
              onChange={e => setWaKegiatan(e.target.value)}
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
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Judul"
            className="w-full border px-3 py-2 rounded"
            required
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Deskripsi"
            rows={4}
            className="w-full border px-3 py-2 rounded"
            required
          />
          <div className="flex gap-4">
            <input
              type="date"
              name="dateStart"
              value={form.dateStart}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-full"
              required
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
            required
          />
          <input
            name="registrationFee"
            value={form.registrationFee}
            onChange={handleChange}
            placeholder="Biaya Pendaftaran (Rp)"
            type="number"
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
          <label className="block text-sm font-medium text-gray-700">Gambar Cover</label>
          <input
            type="file"
            onChange={handleCoverFileChange}
            className="w-full border px-3 py-2 rounded"
            accept="image/*"
          />
           <label className="block text-sm font-medium text-gray-700">Gambar Attachment (Maks. 4)</label>
          <input
            type="file"
            multiple
            onChange={handleAttachmentFilesChange}
            className="w-full border px-3 py-2 rounded"
            accept="image/*"
          />
          
          {/* Accommodation Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Penginapan (Opsional)</h3>
            <input
              name="accommodationName"
              value={form.accommodationName}
              onChange={handleChange}
              placeholder="Nama Tempat Penginapan"
              className="w-full border px-3 py-2 rounded mb-4"
            />
            <div className="grid grid-cols-2 gap-4">
              <input
                name="accommodationPriceSharing"
                value={form.accommodationPriceSharing}
                onChange={handleChange}
                placeholder="Harga Kamar Sharing"
                type="number"
                className="w-full border px-3 py-2 rounded"
              />
              <input
                name="accommodationPriceSingle"
                value={form.accommodationPriceSingle}
                onChange={handleChange}
                placeholder="Harga Kamar Single"
                type="number"
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>

          {/* T-shirt Pricing Section */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-4">Harga Kaos/Jersey per Ukuran</h3>
            <div className="grid grid-cols-3 gap-4">
              <input
                name="tshirtPriceS"
                value={form.tshirtPriceS}
                onChange={handleChange}
                placeholder="Harga Size S"
                type="number"
                className="w-full border px-3 py-2 rounded"
              />
              <input
                name="tshirtPriceM"
                value={form.tshirtPriceM}
                onChange={handleChange}
                placeholder="Harga Size M"
                type="number"
                className="w-full border px-3 py-2 rounded"
              />
              <input
                name="tshirtPriceL"
                value={form.tshirtPriceL}
                onChange={handleChange}
                placeholder="Harga Size L"
                type="number"
                className="w-full border px-3 py-2 rounded"
              />
              <input
                name="tshirtPriceXL"
                value={form.tshirtPriceXL}
                onChange={handleChange}
                placeholder="Harga Size XL"
                type="number"
                className="w-full border px-3 py-2 rounded"
              />
              <input
                name="tshirtPriceXXL"
                value={form.tshirtPriceXXL}
                onChange={handleChange}
                placeholder="Harga Size XXL"
                type="number"
                className="w-full border px-3 py-2 rounded"
              />
              <input
                name="tshirtPriceXXXL"
                value={form.tshirtPriceXXXL}
                onChange={handleChange}
                placeholder="Harga Size XXXL"
                type="number"
                className="w-full border px-3 py-2 rounded"
              />
            </div>
          </div>
          
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Tambah Kegiatan
          </button>
        </form>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* List */}
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Daftar Kegiatan</h2>
          {loading ? (
            <p>Memuat data...</p>
          ) : activities.length > 0 ? (
            <div className="space-y-4">
              {activities.map((item) => (
                <div key={item.id} className="border p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.location}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(item.dateStart).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/dashboard/manajemen-kegiatan/registrants/${item.slug}`} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                      Peserta
                    </Link>
                    <Link href={`/dashboard/manajemen-kegiatan/edit/${item.slug}`} className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
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
            <p>Tidak ada kegiatan.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default KegiatanDashboard;
