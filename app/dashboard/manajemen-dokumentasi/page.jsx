"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Delete, Edit } from '../../../public/assets/image';

const DokumenDashboard = () => {
  const [docs, setDocs] = useState([]);
  const [form, setForm] = useState({ name: "", url: "" });
  const [editForm, setEditForm] = useState({ name: "", url: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [editError, setEditError] = useState(null);

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

  const handleEditChange = (e) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value });

  // Tambah dokumen
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.url.trim()) {
      setError("Nama dan URL tidak boleh kosong");
      return;
    }
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
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Hapus dokumen
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
        await fetchDocs();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Edit dokumen (open modal)
  const handleEdit = async (doc) => {
    setEditError(null);
    setSelectedDoc(doc);
    setEditForm({ name: doc.name, url: doc.url });
    setShowEditModal(true);
  };

  // Submit edit dokumen
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError(null);

    if (!editForm.name.trim() || !editForm.url.trim()) {
      setEditError("Nama dan URL tidak boleh kosong");
      return;
    }
    let fixedUrl = editForm.url.trim();
    if (!/^https?:\/\//i.test(fixedUrl)) {
      fixedUrl = `https://${fixedUrl}`;
    }

    try {
      const payload = { ...editForm, url: fixedUrl };
      const res = await fetch(`/api/dokumentasi/${selectedDoc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal mengupdate dokumen");
      }
      await fetchDocs();
      setShowEditModal(false);
      setSelectedDoc(null);
    } catch (err) {
      setEditError(err.message);
    }
  };

  // Icon Add SVG
  const AddIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#B3B4B6">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#141415] text-white p-8">
      <div className="max-w-4xl p-4 rounded-xl shadow-md">
        <h1 className="text-h2 mb-4">Pengelolaan Dokumentasi</h1>
        <p className="text-b2 text-[#B3B4B6] mb-8">
          Pastikan link Google Drive di-set ke <span className="text-[#C4A254] font-semibold">Anyone with the link</span> &amp; permission <span className="text-[#C4A254] font-semibold">Editor</span> agar semua orang dapat mengunduh &amp; mengunggah.
        </p>
        {/* Button tambah dokumen */}
        <div className="flex mb-6">
          <button
            onClick={() => {
              setShowModal(true);
              setError(null);
            }}
            className="flex items-center gap-2 px-5 py-2 bg-[#222225] text-[#B3B4B6] rounded-md shadow hover:bg-[#2d2d30] transition cursor-pointer"
          >
            {AddIcon}
            Tambah Dokumentasi
          </button>
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Modal Tambah Dokumen */}
        {showModal && (
          <div className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-[#181818] rounded-xl p-7 shadow-xl w-full max-w-lg relative">
              <button
                className="absolute right-3 top-3 text-[#88898d] hover:text-[#E53935] text-xl"
                onClick={() => setShowModal(false)}
                aria-label="Tutup"
              >
                &times;
              </button>
              <h2 className="text-xl font-semibold mb-4">Tambah Dokumentasi</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nama Dokumentasi"
                  className="w-full bg-[#222225] border border-[#B3B4B6] text-white py-2 px-3 rounded-md focus:outline-none"
                  required
                  autoFocus
                />
                <input
                  name="url"
                  value={form.url}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-[#222225] border border-[#B3B4B6] text-white py-2 px-3 rounded-md focus:outline-none"
                  required
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2 bg-[#222225] text-[#B3B4B6] rounded-md hover:bg-[#2d2d30] transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#E53935] text-white rounded-md font-semibold hover:bg-[#c62828] transition cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
              </form>
              {error && <div className="text-red-500 mt-3">{error}</div>}
            </div>
          </div>
        )}

        {/* Modal Edit Dokumen */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center">
            <div className="bg-[#181818] rounded-xl p-7 shadow-xl w-full max-w-lg relative">
              <button
                className="absolute right-3 top-3 text-[#88898d] hover:text-[#E53935] text-xl"
                onClick={() => setShowEditModal(false)}
                aria-label="Tutup"
              >
                &times;
              </button>
              <h2 className="text-xl font-semibold mb-4">Edit Dokumen</h2>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <input
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  placeholder="Nama Dokumen"
                  className="w-full bg-[#222225] border border-[#B3B4B6] text-white py-2 px-3 rounded-md focus:outline-none"
                  required
                  autoFocus
                />
                <input
                  name="url"
                  value={editForm.url}
                  onChange={handleEditChange}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-[#222225] border border-[#B3B4B6] text-white py-2 px-3 rounded-md focus:outline-none"
                  required
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-5 py-2 bg-[#222225] text-[#B3B4B6] rounded-md hover:bg-[#2d2d30] transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#E53935] text-white rounded-md font-semibold hover:bg-[#c62828] transition cursor-pointer"
                  >
                    Update
                  </button>
                </div>
              </form>
              {editError && <div className="text-red-500 mt-3">{editError}</div>}
            </div>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Daftar Dokumen</h2>
          <div className="bg-[#141415] mx-auto w-[390px] sm:w-full max-w-full overflow-x-auto max-h-[calc(100vh-220px)] overflow-y-auto">
            <div className="min-w-[700px] w-auto">
              <div className="grid grid-cols-4 min-w-[700px] text-[#B3B4B6] bg-[#1E1E20] rounded-sm py-2 px-3 mb-2 font-medium text-b1">
                <p className="col-span-2">Nama Dokumentasi</p>
                <p className="col-span-1">Tanggal</p>
                <p className="col-span-1 text-right">Aksi</p>
              </div>
              {loading ? (
                <p className="text-[#B3B4B6]">Memuat data...</p>
              ) : docs.length > 0 ? (
                <ul className="min-w-[700px] w-full">
                  {docs.map((d) => (
                    <li key={d.id} className="grid grid-cols-4 py-3 px-3 items-center border-b border-[#222225] last:border-none min-w-0">
                      <span className="col-span-2 text-white break-words min-w-0">
                        <a
                          href={d.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white font-semibold hover:underline break-words"
                        >
                          {d.name}
                        </a>
                      </span>
                      <span className="col-span-1 text-[#B3B4B6] min-w-0">
                        {new Date(d.createdAt).toLocaleDateString("id-ID")}
                      </span>
                      <span className="col-span-1 flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(d)}
                          className="flex items-center gap-1 px-3 py-2 bg-[#C4A254] text-white text-b2 rounded-sm font-medium hover:bg-[#b7964b] focus:outline-none cursor-pointer"
                        >
                          <Image src={Edit} alt='Edit' width={20} height={20} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="flex items-center gap-1 px-3 py-2 bg-[#E53935] text-white text-b2 rounded-sm font-medium hover:bg-[#c62828] focus:outline-none cursor-pointer"
                        >
                          <Image src={Delete} alt='Hapus' width={20} height={20} />
                          Hapus
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[#B3B4B6] min-w-[700px]">Tidak ada dokumen.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DokumenDashboard;