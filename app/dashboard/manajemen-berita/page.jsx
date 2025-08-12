"use client";
import { useState, useEffect } from "react";
import { uploadToCloudinary } from "@/lib/uploadImage";
import Link from "next/link";
import Image from 'next/image';
import { Delete, Edit } from '../../../public/assets/image';
import { confirmDialog } from "@/lib/confirmDialog";

const initialForm = {
  title: "",
  category: "",
  content: "",
  imageUrl: "",
  file: null,
};

const BeritaDashboard = () => {
  const [news, setNews] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSlug, setEditSlug] = useState(null);

  // Untuk multiple attachment (max 3)
  const [attachments, setAttachments] = useState([]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/berita");
      if (!res.ok) throw new Error("Gagal mengambil data berita");
      const data = await res.json();
      setNews(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // ------------------------ ADD NEWS ------------------------
  const openAddModal = () => {
    setForm(initialForm);
    setAttachments([]);
    setShowAddModal(true);
    setError(null);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setForm(initialForm);
    setAttachments([]);
    setError(null);
  };

  const handleAddChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddFileChange = async (e) => {
    const files = Array.from(e.target.files).slice(0, 3 - attachments.length);
    let newAttachments = [...attachments];
    for (const file of files) {
      const url = await uploadToCloudinary(file);
      newAttachments.push({ url, file });
    }
    setAttachments(newAttachments);
  };

  const handleRemoveAttachment = (idx) => {
    const newAttachments = attachments.filter((_, i) => i !== idx);
    setAttachments(newAttachments);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      // The backend will create the slug
      const payload = {
        ...form,
        imageUrl: attachments[0]?.url || "",
        attachments: attachments.map(a => a.url),
        description: form.content,
      };
      const res = await fetch("/api/berita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal menambah berita");
      }
      await fetchNews();
      closeAddModal();
    } catch (err) {
      setError(err.message);
    }
  };

  // ------------------------ EDIT NEWS ------------------------
  const openEditModal = async (slug) => {
    setEditSlug(slug);
    setShowEditModal(true);
    setError(null);
    setAttachments([]);
    setForm(initialForm);
    try {
      const res = await fetch(`/api/berita/${slug}`);
      if (!res.ok) throw new Error("Gagal mengambil data berita");
      const data = await res.json();
      setForm({
        title: data.title || "",
        category: data.category || "",
        content: data.content || "",
        imageUrl: data.imageUrl || "",
        file: null,
      });
      setAttachments(
        data.attachments
          ? data.attachments.map(url => ({ url, file: null }))
          : data.imageUrl
          ? [{ url: data.imageUrl, file: null }]
          : []
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditSlug(null);
    setForm(initialForm);
    setAttachments([]);
    setError(null);
  };

  const handleEditChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEditFileChange = async (e) => {
    const files = Array.from(e.target.files).slice(0, 3 - attachments.length);
    let newAttachments = [...attachments];
    for (const file of files) {
      const url = await uploadToCloudinary(file);
      newAttachments.push({ url, file });
    }
    setAttachments(newAttachments);
  };

  const handleEditRemoveAttachment = (idx) => {
    setAttachments(attachments.filter((_, i) => i !== idx));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      let imageUrl = form.imageUrl;
      if (form.file) {
        imageUrl = await uploadToCloudinary(form.file);
      }
      const payload = { ...form, imageUrl };
      const res = await fetch(`/api/berita/${editSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let errMsg = "Gagal mengupdate berita";
        try {
          const err = await res.json();
          errMsg = err.message || errMsg;
        } catch (e) {}
        throw new Error(errMsg);
      }
      await fetchNews();
      closeEditModal();
    } catch (err) {
      setError(err.message);
    }
  };

  // ------------------------ DELETE NEWS ------------------------
  const handleDelete = async (slug) => {
    const confirmed = await confirmDialog("Apakah Anda yakin ingin menghapus berita ini?");
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/berita/${slug}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "Gagal menghapus berita");
        }
        await fetchNews();
      } catch (err) {
        setError(err.message);
      }
  };

  // ------------------------ Helper UI ------------------------
  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Render popup modal for Add/Edit Berita
  const renderModal = (type = "add") => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blur Background */}
      <div className="absolute inset-0 bg-[#141415]/70 backdrop-blur-sm"></div>
      {/* Modal */}
      <div className="relative z-10 w-[95vw] max-w-lg bg-[#141415] rounded-xl p-8 shadow-2xl text-white">
        <button
          className="absolute top-5 right-5 text-3xl text-white hover:text-gray-300 transition"
          onClick={type === "add" ? closeAddModal : closeEditModal}
          aria-label="Close"
        >
          &times;
        </button>
        <h1 className="text-2xl font-semibold mb-6">
          {type === "add" ? "Buat Berita Baru" : "Edit Berita"}
        </h1>
        <form
          onSubmit={type === "add" ? handleAddSubmit : handleEditSubmit}
          className="space-y-4"
        >
          <div>
            <label className="block mb-2">Judul</label>
            <input
              name="title"
              value={form.title}
              onChange={type === "add" ? handleAddChange : handleEditChange}
              placeholder={
                type === "add" ? "Masukkan judul berita" : "Judul"
              }
              className="w-full border border-[#B3B4B6] bg-transparent px-3 py-2 rounded-md text-white placeholder-[#B3B4B6] outline-none"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Kategori</label>
            <input
              name="category"
              value={form.category}
              onChange={type === "add" ? handleAddChange : handleEditChange}
              placeholder={
                type === "add" ? "Masukkan kategori berita" : "Kategori"
              }
              className="w-full border border-[#B3B4B6] bg-transparent px-3 py-2 rounded-md text-white placeholder-[#B3B4B6] outline-none"
            />
          </div>
          <div>
            <label className="block mb-2">Attachment</label>
            <div className="flex gap-2 mb-2">
              {attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="w-[70px] h-[70px] bg-white rounded-md flex items-center justify-center relative"
                >
                  {att.url && (
                    <img
                      src={att.url}
                      alt="gambar"
                      className="w-full h-full object-cover rounded-md"
                    />
                  )}
                  <button
                    type="button"
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-xs text-white hover:bg-red-600 flex items-center justify-center"
                    onClick={() =>
                      type === "add"
                        ? handleRemoveAttachment(idx)
                        : handleEditRemoveAttachment(idx)
                    }
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path
                        fill="white"
                        d="M7 7L17 17M7 17L17 7"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              ))}
              {/* Placeholder boxes */}
              {Array.from({ length: 3 - attachments.length }).map((_, idx) => (
                <div
                  key={idx + attachments.length}
                  className="w-[70px] h-[70px] bg-white rounded-md flex items-center justify-center"
                ></div>
              ))}
            </div>
            {/* Upload box */}
            <label
              className="flex items-center justify-center border border-dashed border-[#B3B4B6] rounded-md py-4 cursor-pointer mb-2 transition hover:border-white"
            >
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={
                  type === "add"
                    ? handleAddFileChange
                    : handleEditFileChange
                }
                disabled={attachments.length >= 3}
              />
              <span className="flex items-center gap-1 text-[#B3B4B6]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="#B3B4B6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16V18a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0l-4 4m4-4l4 4"
                  />
                </svg>
                <span>Upload File Gambar</span>
              </span>
            </label>
          </div>
          <div>
            <label className="block mb-2">Konten</label>
            <textarea
              name="content"
              value={form.content}
              onChange={type === "add" ? handleAddChange : handleEditChange}
              placeholder={
                type === "add"
                  ? "Masukkan isi konten berita"
                  : "Konten"
              }
              rows={7}
              className="w-full border border-[#B3B4B6] bg-transparent px-3 py-2 rounded-md text-white placeholder-[#B3B4B6] outline-none"
              required
            />
          </div>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <button
            type="submit"
            className="w-full mt-6 py-3 bg-[#E53935] text-white rounded font-semibold text-base flex items-center justify-center gap-2 hover:bg-[#c62828] transition cursor-pointer"
          >
            {type === "add" ? (
              "Buat Berita"
            ) : (
              <>
                Simpan Perubahan
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#141415] p-8">
      <div className="max-w-7xl p-4 rounded-xl shadow-md bg-[#141415]">
        <h1 className="text-h2 text-white mb-6">
          Pengelolaan Berita
        </h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2 bg-[#222225] text-[#B3B4B6] rounded-md mb-6 shadow hover:bg-[#2d2d30] transition cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            fill="none"
            viewBox="0 0 24 24"
            stroke="#B3B4B6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Tambah Berita Baru
        </button>
        {/* Table wrapper: w-full and overflow-x-auto */}
        <div className="w-full overflow-x-auto bg-[#141415]">
          <h2 className="block text-b2 text-[#B3B4B6] mb-2">Daftar Nomor</h2>
          {/* Table Header */}
          <div className="min-w-[1200px] grid grid-cols-5 text-[#B3B4B6] bg-[#1E1E20] rounded-sm py-2 px-3 mb-2 font-medium text-b1">
            <p className="col-span-2">Berita</p>
            <p className="col-span-1">Kategori</p>
            <p className="col-span-1">Tanggal</p>
            <p className="col-span-1">Aksi</p>
          </div>
          {/* Table Body */}
          {loading ? (
            <p className="text-white">Memuat data...</p>
          ) : news && news.length > 0 ? (
            <ul className="min-w-[1200px]">
              {news.map((item) => (
                <li
                  key={item.id}
                  className="grid grid-cols-5 py-3 px-3 items-center border-b border-[#222225] last:border-none"
                >
                  {/* Berita */}
                  <span className="col-span-2 text-white">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-[#B3B4B6] text-sm truncate w-full" style={{ maxWidth: "95%" }}>
                      {item.content?.split(" ").slice(0, 18).join(" ") +
                        (item.content?.split(" ").length > 18 ? " ..." : "")}
                    </div>
                  </span>
                  {/* Kategori */}
                  <span className="col-span-1 text-white">
                    {item.category || "-"}
                  </span>
                  {/* Tanggal */}
                  <span className="col-span-1 text-white">
                    {formatDate(item.createdAt)}
                  </span>
                  {/* Aksi */}
                  <span className="col-span-1 flex gap-2">
                    <button
                      onClick={() => openEditModal(item.slug)}
                      className="flex items-center gap-1 px-3 py-2 bg-[#C4A254] hover:bg-[#b7964b] text-white text-b2 rounded-sm focus:outline-none cursor-pointer"
                    >
                      <Image src={Edit} alt='icon' width={20} height={20} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.slug)}
                      className="flex items-center gap-1 px-3 py-2 bg-[#E53935] text-white text-b2 rounded-sm hover:bg-[#c62828] focus:outline-none cursor-pointer"
                    >
                      <Image src={Delete} alt='icon' width={20} height={20} />
                      Hapus
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white min-w-[1200px]">Tidak ada berita.</p>
          )}
        </div>
      </div>
      {showAddModal && renderModal("add")}
      {showEditModal && renderModal("edit")}
    </div>
  );
};

export default BeritaDashboard;