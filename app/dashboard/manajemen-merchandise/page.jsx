"use client";
import { useState, useEffect } from "react";
import { uploadToCloudinary } from "@/lib/uploadImage";
import Image from "next/image";
import { Delete, Edit } from "../../../public/assets/image"; // Pastikan asset sudah ada!

const initialForm = {
  name: "",
  price: "",
  description: "",
  imageUrls: [],
  files: [],
};

const MerchandiseDashboard = () => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [waMerch, setWaMerch] = useState("");
  const [waLoading, setWaLoading] = useState(false);
  const [waMsg, setWaMsg] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSlug, setEditSlug] = useState(null);
  const [attachmentsPreview, setAttachmentsPreview] = useState([]);

  // ----------- DATA FETCH -----------
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

  useEffect(() => {
    const fetchWa = async () => {
      setWaLoading(true);
      const res = await fetch("/api/admin/settings/wa-merch");
      const data = await res.json();
      setWaMerch(data.number || "");
      setWaLoading(false);
    };
    fetchWa();
    fetchItems();
  }, []);

  // ----------- WA SUBMIT -----------
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

  // ----------- MODAL LOGIC -----------
  const openAddModal = () => {
    setForm({ ...initialForm });
    setAttachmentsPreview([]);
    setShowAddModal(true);
    setError(null);
  };
  const closeAddModal = () => {
    setShowAddModal(false);
    setForm({ ...initialForm });
    setAttachmentsPreview([]);
    setError(null);
  };

  const openEditModal = async (slug) => {
    setEditSlug(slug);
    setShowEditModal(true);
    setError(null);
    setAttachmentsPreview([]);
    try {
      const res = await fetch(`/api/merchandise/${slug}`);
      if (!res.ok) throw new Error("Gagal mengambil data produk");
      const data = await res.json();
      setForm({
        ...initialForm,
        ...data,
        price: data.price?.toString() || "",
        files: [],
      });
      setAttachmentsPreview(data.imageUrls || []);
    } catch (err) {
      setError(err.message);
    }
  };
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditSlug(null);
    setForm({ ...initialForm });
    setAttachmentsPreview([]);
    setError(null);
  };

  // ----------- FORM LOGIC -----------
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Attachment Preview Logic (add, not replace)
  const handleFileChange = (e) => {
    let newFiles = Array.from(e.target.files);
    let totalFiles = form.files.length + newFiles.length;
    if (totalFiles > 3) {
      alert("Maksimal 3 gambar produk.");
      newFiles = newFiles.slice(0, 3 - form.files.length);
    }
    const updatedFiles = [...form.files, ...newFiles];
    setForm({ ...form, files: updatedFiles });
    setAttachmentsPreview([
      ...attachmentsPreview,
      ...newFiles.map((file) => URL.createObjectURL(file)),
    ]);
  };
  // Remove attachment preview
  const removeAttachment = (idx) => {
    const newFiles = form.files.filter((_, i) => i !== idx);
    const newPreviews = attachmentsPreview.filter((_, i) => i !== idx);
    setForm({ ...form, files: newFiles });
    setAttachmentsPreview(newPreviews);
  };

  // ----------- SUBMIT LOGIC -----------
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      let uploadedUrls = [];
      if (form.files.length) {
        uploadedUrls = await Promise.all(
          form.files.map((file) => uploadToCloudinary(file))
        );
      }
      const payload = { ...form, imageUrls: uploadedUrls };
      delete payload.files;
      const res = await fetch("/api/merchandise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let errMsg = "Gagal menambah produk";
        try {
          const err = await res.json();
          errMsg = err.message || errMsg;
        } catch (e) {}
        throw new Error(errMsg);
      }
      await fetchItems();
      closeAddModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      let uploadedUrls = form.imageUrls || [];
      if (form.files.length > 0) {
        uploadedUrls = [
          ...(form.imageUrls || []),
          ...(
            await Promise.all(
              form.files.map((file) => uploadToCloudinary(file))
            )
          ),
        ];
      }
      const payload = { ...form, imageUrls: uploadedUrls };
      delete payload.files;
      const res = await fetch(`/api/merchandise/${editSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let errMsg = "Gagal mengupdate produk";
        try {
          const err = await res.json();
          errMsg = err.message || errMsg;
        } catch (e) {}
        throw new Error(errMsg);
      }
      await fetchItems();
      closeEditModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (slug) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      try {
        const res = await fetch(`/api/merchandise/${slug}`, { method: "DELETE" });
        if (!res.ok) {
          let errMsg = "Gagal menghapus produk";
          try {
            const err = await res.json();
            errMsg = err.message || errMsg;
          } catch (e) {}
          throw new Error(errMsg);
        }
        await fetchItems();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // ----------- MODAL COMPONENT -----------
  const renderModal = (type = "add") => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[#141415]/70 backdrop-blur-sm"></div>
      <div className="relative z-10 w-[95vw] max-w-lg bg-[#141415] rounded-xl p-8 shadow-2xl text-white overflow-y-auto max-h-[95vh]">
        <button
          className="absolute top-5 right-5 text-3xl text-white hover:text-gray-300 transition"
          onClick={type === "add" ? closeAddModal : closeEditModal}
          aria-label="Close"
        >
          &times;
        </button>
        <h1 className="text-2xl font-semibold mb-6">
          {type === "add" ? "Buat Produk Baru" : "Edit Produk"}
        </h1>

        <form
          onSubmit={type === "add" ? handleAddSubmit : handleEditSubmit}
          className="space-y-6"
        >
          <div>
            <label className="block mb-2 font-medium">Nama</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Masukkan nama produk"
              className="w-full border border-[#B3B4B6] bg-transparent px-3 py-2 rounded-md text-white placeholder-[#B3B4B6] outline-none"
              required
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Deskripsi (Opsional)</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Masukkan deskripsi produk"
              rows={4}
              className="w-full border border-[#B3B4B6] bg-transparent px-3 py-2 rounded-md text-white placeholder-[#B3B4B6] outline-none"
            />
          </div>
          <div>
            <label className="block mb-2 font-medium">Harga</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Rp"
              className="w-full border border-[#B3B4B6] bg-transparent px-3 py-2 rounded-md text-white placeholder-[#B3B4B6] outline-none"
              required
            />
          </div>
          {/* Attachments */}
          <div>
            <label className="block mb-2 font-medium">Gambar Attachment (Maks. 3)</label>
            <div className="flex gap-2 mb-2">
              {attachmentsPreview && attachmentsPreview.length > 0
                ? attachmentsPreview.map((url, idx) => (
                    <div key={idx} className="w-[60px] h-[60px] bg-white rounded-md flex items-center justify-center relative">
                      <img src={url} alt={`Produk ${idx + 1}`} className="w-full h-full object-cover rounded-md" />
                      <button type="button" onClick={() => removeAttachment(idx)}
                        className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-xs text-white hover:bg-red-600 flex items-center justify-center">
                        <Image src={Delete} alt="Delete" width={18} height={18}/>
                      </button>
                    </div>
                  ))
                : Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="w-[60px] h-[60px] bg-white rounded-md flex items-center justify-center"></div>
                  ))
              }
            </div>
            <label className="flex items-center justify-center border border-dashed border-[#B3B4B6] rounded-md py-4 cursor-pointer mb-2 transition hover:border-white">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
                disabled={attachmentsPreview.length >= 3}
              />
              <span className="flex items-center gap-1 text-[#B3B4B6]">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#B3B4B6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16V18a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0l-4 4m4-4l4 4" />
                </svg>
                <span>Upload File Gambar</span>
              </span>
            </label>
          </div>

          {error && <p className="text-red-500 mb-2">{error}</p>}

          <button
            type="submit"
            className="w-full mt-6 py-3 bg-[#E53935] text-white rounded font-semibold text-base flex items-center justify-center gap-2 hover:bg-[#c62828] transition"
          >
            {type === "add" ? "Buat Produk Baru" : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </div>
  );

  // ----------- MAIN DASHBOARD UI -----------
  return (
    <div className="min-h-screen bg-[#141415] p-8">
      <div className="max-w-5xl p-4">
        {/* Judul */}
        <h1 className="text-h2 text-white mb-8">
          Pengelolaan Merchandise
        </h1>
        {/* WA Konfirmasi */}
        <form onSubmit={handleWaSubmit} className="mb-8">
          <label className="block text-b2 text-[#B3B4B6] mb-2">
            Nomor WA Konfirmasi Merchandise
          </label>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              type="text"
              value={waMerch}
              onChange={e => setWaMerch(e.target.value)}
              className="border border-[#B3B4B6] bg-[#141415] text-white px-4 py-2 rounded-md placeholder-[#B3B4B6] outline-none"
              placeholder="+628xxxxxxxxxx"
              required
              disabled={waLoading}
            />
            <button
              type="submit"
              className="px-5 py-2 bg-[#65666B] text-white rounded-md hover:bg-[#88898d] transition"
              disabled={waLoading}
            >
              {waLoading ? "..." : "Simpan"}
            </button>
          </div>
          {waMsg && <span className="text-sm ml-2 text-white">{waMsg}</span>}
        </form>
        {/* Button Tambah Produk Baru */}
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-6 py-2 bg-[#222225] text-white rounded-md mb-8 shadow transition hover:bg-[#2d2d30] focus:outline-none"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#B3B4B6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
          </svg>
          <span className="font-medium">Tambah Produk Baru</span>
        </button>
        {/* Table Produk */}
        <div className="w-full overflow-x-auto bg-[#141415]">
          <h2 className="block text-b2 text-[#B3B4B6] mb-3">Daftar Produk</h2>
          {/* Table Header */}
          <div className="min-w-[900px] grid grid-cols-5 text-[#B3B4B6] bg-[#1E1E20] rounded-sm py-2 px-3 mb-2 text-b1">
            <p className="col-span-2">Produk</p>
            <p className="col-span-2">Harga</p>
            <p className="col-span-1">Aksi</p>
          </div>
          {/* Table Body */}
          {loading ? (
            <p className="text-white">Memuat data...</p>
          ) : items.length > 0 ? (
            <ul className="min-w-[900px]">
              {items.map((item) => (
                <li key={item.id} className="grid grid-cols-5 py-3 px-3 items-center border-b border-[#222225] last:border-none">
                  {/* Produk & gambar */}
                  <span className="col-span-2 flex items-center gap-4 text-white">
                    {item.imageUrls && item.imageUrls.length > 0 ? (
                      <img src={item.imageUrls[0]} alt={item.name} className="w-12 h-12 rounded-md object-cover bg-white" />
                    ) : (
                      <div className="w-12 h-12 rounded-md bg-white"></div>
                    )}
                    <div>
                      <div className="font-medium">{item.name}</div>
                    </div>
                  </span>
                  {/* Harga */}
                  <span className="col-span-2 text-white font-semibold">
                    {item.price ? `Rp ${new Intl.NumberFormat("id-ID").format(item.price)}` : "-"}
                  </span>
                  {/* Aksi */}
                  <span className="col-span-1 flex gap-2">
                    <button
                      onClick={() => openEditModal(item.slug)}
                      className="flex items-center gap-1 px-3 py-2 bg-[#C4A254] text-white text-b2 rounded-sm font-medium hover:bg-[#b7964b] focus:outline-none"
                    >
                      <Image src={Edit} alt='icon' width={20} height={20} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.slug)}
                      className="flex items-center gap-1 px-3 py-2 bg-[#E53935] text-white text-b2 rounded-sm font-medium hover:bg-[#c62828] focus:outline-none"
                    >
                      <Image src={Delete} alt='icon' width={20} height={20} />
                      Hapus
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white min-w-[900px]">Tidak ada produk.</p>
          )}
        </div>
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
      {showAddModal && renderModal("add")}
      {showEditModal && renderModal("edit")}
    </div>
  );
};

export default MerchandiseDashboard;