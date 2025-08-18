'use client';

import { useState, useEffect } from "react";
import { uploadToCloudinary } from "@/lib/uploadImage";
import Image from 'next/image';
import { Delete, Edit } from '../../../public/assets/image';
import { confirmDialog } from "@/lib/confirmDialog";

const initialForm = {
  title: "",
  description: "",
  dateStart: "",
  dateEnd: "",
  location: "",
  status: "UPCOMING",
  imageUrl: "",
  coverFile: null,
  coverUrl: "",
  attachmentFiles: [],
  attachmentUrls: [],
  accommodationName: "",
  accommodationPriceSharing: "",
  accommodationPriceSingle: "",
  registrationFee: "",
  tshirtPriceS: "",
  tshirtPriceM: "",
  tshirtPriceL: "",
  tshirtPriceXL: "",
  tshirtPriceXXL: "",
  tshirtPriceXXXL: "",
};

const ManajemenKegiatanPage = () => {
  const [activities, setActivities] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [waKegiatan, setWaKegiatan] = useState("");
  const [waLoading, setWaLoading] = useState(false);
  const [waMsg, setWaMsg] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSlug, setEditSlug] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cover image & attachments as preview urls
  const [coverPreview, setCoverPreview] = useState([]);
  const [attachmentsPreview, setAttachmentsPreview] = useState([]);

  // Fetch activities & WA number
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

  useEffect(() => {
    const fetchWa = async () => {
      setWaLoading(true);
      const res = await fetch("/api/admin/settings/wa-kegiatan");
      const data = await res.json();
      setWaKegiatan(data.number || "");
      setWaLoading(false);
    };
    fetchWa();
    fetchActivities();
  }, []);

  // ----------- WA KONFIRMASI -----------
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

  // ----------- MODAL LOGIC -----------
  const openAddModal = () => {
    setForm({ ...initialForm });
    setCoverPreview([]);
    setAttachmentsPreview([]);
    setShowAddModal(true);
    setError(null);
  };
  const closeAddModal = () => {
    setShowAddModal(false);
    setForm({ ...initialForm });
    setCoverPreview([]);
    setAttachmentsPreview([]);
    setError(null);
  };

  const openEditModal = async (slug) => {
    setEditSlug(slug);
    setShowEditModal(true);
    setError(null);
    setCoverPreview([]);
    setAttachmentsPreview([]);
    try {
      const res = await fetch(`/api/kegiatan/${slug}`);
      if (!res.ok) throw new Error("Gagal mengambil data kegiatan");
      const data = await res.json();
      setForm({
        ...initialForm,
        ...data,
        dateStart: data.dateStart ? new Date(data.dateStart).toISOString().split('T')[0] : "",
        dateEnd: data.dateEnd ? new Date(data.dateEnd).toISOString().split('T')[0] : "",
        coverUrl: data.imageUrl || "",
        attachmentUrls: data.attachmentUrls || [],
        attachmentFiles: [],
        coverFile: null,
      });
      setCoverPreview(data.imageUrl ? [data.imageUrl] : []);
      setAttachmentsPreview(data.attachmentUrls || []);
    } catch (err) {
      setError(err.message);
    }
  };
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditSlug(null);
    setForm({ ...initialForm });
    setCoverPreview([]);
    setAttachmentsPreview([]);
    setError(null);
  };

  // ----------- FORM LOGIC -----------
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCoverFileChange = (e) => {
    const file = e.target.files[0];
    setForm({ ...form, coverFile: file });
    if (file) {
      setCoverPreview([URL.createObjectURL(file)]);
    } else {
      setCoverPreview([]);
    }
  };
  const removeCover = () => {
    setForm({ ...form, coverFile: null, coverUrl: "" });
    setCoverPreview([]);
  };

  const handleAttachmentFilesChange = (e) => {
    let newFiles = Array.from(e.target.files);
    let totalFiles = form.attachmentFiles.length + newFiles.length;
    if (totalFiles > 4) {
      alert("Maksimal 4 gambar attachment.");
      newFiles = newFiles.slice(0, 4 - form.attachmentFiles.length);
    }
    const updatedFiles = [...form.attachmentFiles, ...newFiles];
    setForm({ ...form, attachmentFiles: updatedFiles });
    setAttachmentsPreview([
      ...attachmentsPreview,
      ...newFiles.map((file) => URL.createObjectURL(file)),
    ]);
  };
  const removeAttachment = (idx) => {
    const newFiles = form.attachmentFiles.filter((_, i) => i !== idx);
    const newPreviews = attachmentsPreview.filter((_, i) => i !== idx);
    setForm({ ...form, attachmentFiles: newFiles });
    setAttachmentsPreview(newPreviews);
  };

  // ----------- SUBMIT LOGIC -----------
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      let coverImageUrl = form.coverUrl;
      if (form.coverFile) {
        coverImageUrl = await uploadToCloudinary(form.coverFile);
      }
      let attachmentImageUrls = form.attachmentUrls || [];
      if (form.attachmentFiles && form.attachmentFiles.length) {
        attachmentImageUrls = [
          ...(form.attachmentUrls || []),
          ...(
            await Promise.all(
              form.attachmentFiles.map((file) => uploadToCloudinary(file))
            )
          ),
        ];
      }
      const payload = { ...form, imageUrl: coverImageUrl, attachmentUrls: attachmentImageUrls };
      delete payload.coverFile;
      delete payload.attachmentFiles;
      delete payload.coverUrl;
      const res = await fetch("/api/kegiatan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let errMsg = "Gagal menambah kegiatan";
        try {
          const err = await res.json();
          errMsg = err.message || errMsg;
        } catch (e) {}
        throw new Error(errMsg);
      }
      await fetchActivities();
      closeAddModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      let coverImageUrl = form.coverUrl;
      if (form.coverFile) {
        coverImageUrl = await uploadToCloudinary(form.coverFile);
      }
      let attachmentImageUrls = form.attachmentUrls || [];
      if (form.attachmentFiles && form.attachmentFiles.length) {
        attachmentImageUrls = [
          ...(form.attachmentUrls || []),
          ...(
            await Promise.all(
              form.attachmentFiles.map((file) => uploadToCloudinary(file))
            )
          ),
        ];
      }
      const payload = { ...form, imageUrl: coverImageUrl, attachmentUrls: attachmentImageUrls };
      delete payload.coverFile;
      delete payload.attachmentFiles;
      delete payload.coverUrl;
      const res = await fetch(`/api/kegiatan/${editSlug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let errMsg = "Gagal mengupdate kegiatan";
        try {
          const err = await res.json();
          errMsg = err.message || errMsg;
        } catch (e) {}
        throw new Error(errMsg);
      }
      await fetchActivities();
      closeEditModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (slug) => {
    const confirmed = await confirmDialog("Apakah Anda yakin ingin menghapus kegiatan ini?");
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/kegiatan/${slug}`, { method: "DELETE" });
      if (!res.ok) {
        let errMsg = "Gagal menghapus kegiatan";
        try {
          const err = await res.json();
          errMsg = err.message || errMsg;
        } catch (e) {}
        throw new Error(errMsg);
      }
      await fetchActivities();
    } catch (err) {
      setError(err.message);
      alert(err.message);
    }
  };

  // ----------- UI HELPERS -----------
  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // ----------- MODAL COMPONENT -----------
  const renderModal = (type = "add") => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[#141415]/70 backdrop-blur-sm"></div>
      <div className="relative z-10 w-[95vw] max-w-2xl bg-[#141415] rounded-xl p-8 shadow-2xl text-white overflow-y-auto max-h-[95vh]">
        <button
          className="absolute top-5 right-5 text-3xl text-white hover:text-gray-300 transition"
          onClick={type === "add" ? closeAddModal : closeEditModal}
          aria-label="Close"
        >
          &times;
        </button>
        <h1 className="text-2xl font-semibold mb-6">
          {type === "add" ? "Buat Kegiatan Baru" : "Edit Kegiatan"}
        </h1>

        <form
          onSubmit={type === "add" ? handleAddSubmit : handleEditSubmit}
          className="space-y-6"
        >
          {/* Bagian Kegiatan */}
          <div>
            <label className="block mb-2 font-medium">Kegiatan</label>
            <input name="title" value={form.title} onChange={handleChange} placeholder="Masukkan judul kegiatan" className="w-full border border-[#B3B4B6] bg-transparent px-3 py-2 rounded-md text-white placeholder-[#B3B4B6] outline-none" required />
          </div>
          <div>
            <label className="block mb-2 font-medium">Deskripsi</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Masukkan deskripsi kegiatan" rows={4} className="w-full border border-[#B3B4B6] bg-transparent px-3 py-2 rounded-md text-white placeholder-[#B3B4B6] outline-none" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium">Tanggal Mulai</label>
              <input type="date" name="dateStart" value={form.dateStart} onChange={handleChange} className="w-full border border-[#B3B4B6] bg-transparent px-3 py-2 rounded-md text-white placeholder-[#B3B4B6] outline-none" required />
            </div>
            <div>
              <label className="block mb-2 font-medium">Tanggal Selesai</label>
              <input type="date" name="dateEnd" value={form.dateEnd} onChange={handleChange} className="w-full border border-[#B3B4B6] bg-transparent px-3 py-2 rounded-md text-white placeholder-[#B3B4B6] outline-none" />
            </div>
          </div>
          <div>
            <label className="block mb-2 font-medium">Lokasi</label>
            <input name="location" value={form.location} onChange={handleChange} placeholder="Masukkan lokasi kegiatan" className="w-full border border-[#B3B4B6] bg-transparent px-3 py-2 rounded-md text-white placeholder-[#B3B4B6] outline-none" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium">Biaya Pendaftaran</label>
              <input name="registrationFee" value={form.registrationFee} onChange={handleChange} placeholder="Rp" type="number" className="w-full border border-[#B3B4B6] bg-transparent px-3 py-2 rounded-md text-white placeholder-[#B3B4B6] outline-none" />
            </div>
            <div>
              <label className="block mb-2 font-medium">Status Pendaftaran</label>
              <select name="status" value={form.status} onChange={handleChange} className="w-full border border-[#B3B4B6] bg-transparent px-3 py-2 rounded-md text-white">
                <option value="UPCOMING" className="text-black">Mendatang</option>
                <option value="ONGOING" className="text-black">Berlangsung</option>
                <option value="COMPLETED" className="text-black">Selesai</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block mb-2 font-medium">Gambar Cover</label>
            <div className="flex gap-2 mb-2">
              {coverPreview && coverPreview.length > 0 ? (
                coverPreview.map((url, idx) => (
                  <div key={idx} className="w-[80px] h-[80px] bg-white rounded-md flex items-center justify-center relative">
                    <img src={url} alt="Cover" className="w-full h-full object-cover rounded-md" />
                    <button type="button" onClick={removeCover} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-xs text-white hover:bg-red-600 flex items-center justify-center">
                      <Image src={Delete} alt="Delete" width={18} height={18}/>
                    </button>
                  </div>
                ))
              ) : (
                <div className="w-[80px] h-[80px] bg-white rounded-md flex items-center justify-center"></div>
              )}
            </div>
            <label className="flex items-center justify-center border border-dashed border-[#B3B4B6] rounded-md py-4 cursor-pointer mb-2 transition hover:border-white">
              <input type="file" accept="image/*" className="hidden" onChange={handleCoverFileChange} />
              <span className="flex items-center gap-1 text-[#B3B4B6]">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#B3B4B6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16V18a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0l-4 4m4-4l4 4" /></svg>
                <span>Upload File Gambar</span>
              </span>
            </label>
          </div>
          <div>
            <label className="block mb-2 font-medium">Gambar Attachment (Maks. 4)</label>
            <div className="flex gap-2 mb-2">
              {attachmentsPreview && attachmentsPreview.length > 0
                ? attachmentsPreview.map((url, idx) => (
                    <div key={idx} className="w-[70px] h-[70px] bg-white rounded-md flex items-center justify-center relative">
                      <img src={url} alt={`Attachment ${idx + 1}`} className="w-full h-full object-cover rounded-md" />
                      <button type="button" onClick={() => removeAttachment(idx)} className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-xs text-white hover:bg-red-600 flex items-center justify-center">
                        <Image src={Delete} alt="Delete" width={18} height={18}/>
                      </button>
                    </div>
                  ))
                : Array.from({ length: 4 }).map((_, idx) => (
                    <div key={idx} className="w-[70px] h-[70px] bg-white rounded-md flex items-center justify-center"></div>
                  ))
              }
            </div>
            <label className="flex items-center justify-center border border-dashed border-[#B3B4B6] rounded-md py-4 cursor-pointer mb-2 transition hover:border-white">
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleAttachmentFilesChange} disabled={attachmentsPreview.length >= 4} />
              <span className="flex items-center gap-1 text-[#B3B4B6]">
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#B3B4B6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16V18a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0l-4 4m4-4l4 4" /></svg>
                <span>Upload File Gambar</span>
              </span>
            </label>
          </div>
          <div>
            <label className="block mb-2 font-medium">Penginapan (Opsional)</label>
            <input name="accommodationName" value={form.accommodationName} onChange={handleChange} placeholder="Masukkan nama tempat penginapan" className="w-full border border-[#B3B4B6] bg-transparent px-3 py-2 rounded-md text-white placeholder-[#B3B4B6] outline-none mb-3" />
            <div className="grid grid-cols-2 gap-4">
              <input name="accommodationPriceSingle" value={form.accommodationPriceSingle} onChange={handleChange} placeholder="Harga Kamar Single" type="number" className="w-full border border-[#B3B4B6] bg-transparent px-3 py-2 rounded-md text-white placeholder-[#B3B4B6] outline-none" />
              <input name="accommodationPriceSharing" value={form.accommodationPriceSharing} onChange={handleChange} placeholder="Harga Kamar Sharing" type="number" className="w-full border border-[#B3B4B6] bg-transparent px-3 py-2 rounded-md text-white placeholder-[#B3B4B6] outline-none" />
            </div>
          </div>
          <div>
            <label className="block mb-2 font-medium">Harga Kaos/Jersey per Ukuran</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {["S", "M", "L", "XL", "XXL", "XXXL"].map((size) => (
                <input key={size} name={`tshirtPrice${size}`} value={form[`tshirtPrice${size}`]} onChange={handleChange} placeholder={`Rp`} type="number" className="w-full border border-[#B3B4B6] bg-transparent px-3 py-2 rounded-md text-white placeholder-[#B3B4B6] outline-none" />
              ))}
            </div>
          </div>
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 py-3 bg-[#E53935] text-white rounded font-semibold text-base flex items-center justify-center gap-2 hover:bg-[#c62828] transition cursor-pointer disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Menyimpan...' : (type === "add" ? "Buat Kegiatan" : "Simpan Perubahan")}
          </button>
        </form>
      </div>
    </div>
  );

  // ----------- MAIN DASHBOARD UI -----------
  return (
    <div className="min-h-screen bg-[#141415] p-8">
      <div className="max-w-5xl p-4">
        <h1 className="text-h2 text-white mb-6">Pengelolaan Kegiatan</h1>
        <form onSubmit={handleWaSubmit} className="mb-8">
          <label className="block text-b2 text-[#B3B4B6] mb-2">Nomor WA Konfirmasi Merchandise</label>
          <div className="flex flex-col md:flex-row gap-3">
            <input type="text" value={waKegiatan} onChange={e => setWaKegiatan(e.target.value)} className="border border-[#B3B4B6] bg-[#141415] text-white px-4 py-2 rounded-md w-full md:w-64 placeholder-[#B3B4B6] outline-none min-w-0" placeholder="+628xxxxxxxxxx" required disabled={waLoading} />
            <button type="submit" className="w-full md:w-auto px-5 py-2 bg-[#65666B] text-white rounded-md hover:bg-[#88898d] transition" disabled={waLoading}>
              {waLoading ? "..." : "Simpan"}
            </button>
          </div>
          {waMsg && <span className="text-sm ml-2 text-white">{waMsg}</span>}
        </form>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2 bg-[#222225] text-[#B3B4B6] rounded-md mb-6 shadow hover:bg-[#2d2d30] transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#B3B4B6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          Tambah Kegiatan Baru
        </button>
        <div className="w-full overflow-x-auto bg-[#141415]">
          <h2 className="block text-b2 text-[#B3B4B6] mb-2">Daftar Kegiatan</h2>
          <div className="min-w-[1000px] grid grid-cols-6 text-[#B3B4B6] bg-[#1E1E20] rounded-sm py-2 px-3 mb-2 font-medium text-b1">
            <p className="col-span-2">Kegiatan</p>
            <p className="col-span-2">Lokasi</p>
            <p className="col-span-1">Tanggal</p>
            <p className="col-span-1">Aksi</p>
          </div>
          {loading ? (
            <p className="text-white">Memuat data...</p>
          ) : activities.length > 0 ? (
            <ul className="min-w-[1000px] w-full">
              {activities.map((item) => (
                <li key={item.id} className="grid grid-cols-6 py-3 px-3 items-center border-b border-[#222225] last:border-none min-w-0">
                  <span className="col-span-2 text-white break-words min-w-0"><div className="font-medium">{item.title}</div></span>
                  <span className="col-span-2 text-white break-words min-w-0">{item.location}</span>
                  <span className="col-span-1 text-white min-w-0">{formatDate(item.dateStart)}</span>
                  <span className="col-span-1 flex justify-end gap-2">
                    <button onClick={() => openEditModal(item.slug)} className="flex items-center gap-1 px-3 py-2 bg-[#C4A254] text-white text-b2 rounded-sm font-medium hover:bg-[#b7964b] focus:outline-none">
                      <Image src={Edit} alt='icon' width={20} height={20} />
                      Edit
                    </button>
                    <button onClick={() => handleDelete(item.slug)} className="flex items-center gap-1 px-3 py-2 bg-[#E53935] text-white text-b2 rounded-sm font-medium hover:bg-[#c62828] focus:outline-none">
                      <Image src={Delete} alt='icon' width={20} height={20} />
                      Hapus
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white min-w-[1000px]">Tidak ada kegiatan.</p>
          )}
        </div>
      </div>
      {showAddModal && renderModal("add")}
      {showEditModal && renderModal("edit")}
    </div>
  );
};

export default ManajemenKegiatanPage;
