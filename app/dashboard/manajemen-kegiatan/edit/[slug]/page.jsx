"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { uploadToCloudinary } from "@/lib/uploadImage";

const EditKegiatanPage = () => {
  const router = useRouter();
  const params = useParams();
  const { slug } = params;

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
    attachmentUrls: [],
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
  const [existingCover, setExistingCover] = useState("");
  const [existingAttachments, setExistingAttachments] = useState([]);

  useEffect(() => {
    if (slug) {
      const fetchKegiatan = async () => {
        try {
          const res = await fetch(`/api/kegiatan/${slug}`);
          if (!res.ok) throw new Error("Gagal mengambil data kegiatan");
          const data = await res.json();
          setForm({
            title: data.title,
            description: data.description || "",
            dateStart: data.dateStart ? new Date(data.dateStart).toISOString().split('T')[0] : "",
            dateEnd: data.dateEnd ? new Date(data.dateEnd).toISOString().split('T')[0] : "",
            location: data.location || "",
            status: data.status || "UPCOMING",
            imageUrl: data.imageUrl || "",
            attachmentUrls: data.attachmentUrls || [],
            coverFile: null,
            attachmentFiles: [],
            // Accommodation fields
            accommodationName: data.accommodationName || "",
            accommodationPriceSharing: data.accommodationPriceSharing || "",
            accommodationPriceSingle: data.accommodationPriceSingle || "",
            // T-shirt pricing fields
            tshirtPriceS: data.tshirtPriceS || "",
            tshirtPriceM: data.tshirtPriceM || "",
            tshirtPriceL: data.tshirtPriceL || "",
            tshirtPriceXL: data.tshirtPriceXL || "",
            tshirtPriceXXL: data.tshirtPriceXXL || "",
            tshirtPriceXXXL: data.tshirtPriceXXXL || "",
            registrationFee: data.registrationFee || "",
          });
          setExistingCover(data.imageUrl || "");
          setExistingAttachments(data.attachmentUrls || []);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchKegiatan();
    }
  }, [slug]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCoverFileChange = (e) => {
    setForm({ ...form, coverFile: e.target.files[0] });
  };

  const handleAttachmentFilesChange = (e) => {
    if (e.target.files.length > 4) {
      alert("Anda hanya dapat mengunggah maksimal 4 gambar attachment.");
      e.target.value = "";
      return;
    }
    setForm({ ...form, attachmentFiles: Array.from(e.target.files) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      let coverImageUrl = existingCover;
      if (form.coverFile) {
        coverImageUrl = await uploadToCloudinary(form.coverFile);
      }

      let attachmentImageUrls = existingAttachments;
      if (form.attachmentFiles.length > 0) {
        attachmentImageUrls = await Promise.all(
          form.attachmentFiles.map((file) => uploadToCloudinary(file))
        );
      }

      const payload = { 
        ...form, 
        imageUrl: coverImageUrl,
        attachmentUrls: attachmentImageUrls
      };

      const res = await fetch(`/api/kegiatan/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal mengupdate kegiatan");
      }

      router.push("/dashboard/manajemen-kegiatan");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Memuat...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6">Edit Kegiatan</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            rows={5}
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
          {existingCover && (
            <img src={existingCover} alt="Current cover image" className="w-full h-auto rounded-lg mb-4" />
          )}
          <input
            type="file"
            onChange={handleCoverFileChange}
            className="w-full border px-3 py-2 rounded"
            accept="image/*"
          />
           <p className="text-sm text-gray-500">Unggah gambar baru untuk menggantikan yang lama.</p>

          <label className="block text-sm font-medium text-gray-700 mt-4">Gambar Attachment (Maks. 4)</label>
          <div className="flex flex-wrap gap-4">
            {existingAttachments.map((url, index) => (
                <img key={index} src={url} alt={`Attachment ${index + 1}`} className="w-24 h-24 rounded object-cover" />
            ))}
          </div>
          <input
            type="file"
            multiple
            onChange={handleAttachmentFilesChange}
            className="w-full border px-3 py-2 rounded"
            accept="image/*"
          />
           <p className="text-sm text-gray-500">Unggah gambar baru untuk menggantikan semua attachment yang lama.</p>
          
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
          
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Update Kegiatan
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

export default EditKegiatanPage; 