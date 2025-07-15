"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { uploadToCloudinary } from "@/lib/uploadImage";

const EditMerchandisePage = () => {
  const router = useRouter();
  const params = useParams();
  const { slug } = params;

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
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    if (slug) {
      const fetchItem = async () => {
        try {
          const res = await fetch(`/api/merchandise/${slug}`);
          if (!res.ok) throw new Error("Gagal mengambil data produk");
          const data = await res.json();
          setForm({
            name: data.name,
            price: data.price.toString(),
            category: data.category,
            description: data.description || "",
            imageUrls: data.imageUrls || [],
            files: [],
          });
          setExistingImages(data.imageUrls || []);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchItem();
    }
  }, [slug]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
     if (e.target.files.length > 3) {
      alert("Anda hanya dapat mengunggah maksimal 3 gambar.");
      e.target.value = "";
      return;
    }
    setForm({ ...form, files: Array.from(e.target.files) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      let uploadedUrls = existingImages;

      if (form.files.length > 0) {
        uploadedUrls = await Promise.all(
          form.files.map((file) => uploadToCloudinary(file))
        );
      }
      
      const payload = { ...form, imageUrls: uploadedUrls };

      const res = await fetch(`/api/merchandise/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal mengupdate produk");
      }

      router.push("/dashboard/manajemen-merchandise");
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Memuat...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold mb-6">Edit Merchandise</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="flex flex-wrap gap-4">
            {existingImages.map((url, index) => (
                <img key={index} src={url} alt={`Gambar produk ${index + 1}`} className="w-24 h-24 rounded object-cover" />
            ))}
          </div>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full border px-3 py-2 rounded"
            accept="image/*"
          />
           <p className="text-sm text-gray-500">Unggah gambar baru untuk menggantikan yang lama (maksimal 3).</p>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Deskripsi (opsional)"
            rows={5}
            className="w-full border px-3 py-2 rounded"
          />
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Update Produk
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

export default EditMerchandisePage; 