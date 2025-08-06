// app/kegiatan/[slug]/page.jsx
import { performRequest } from '../../../lib/datocms';
import { KEGIATAN_DETAIL_QUERY } from '../../../lib/queries';
import KegiatanDetailClient from './KegiatanDetailClient';

export default async function KegiatanDetailPage({ params }) {
  const { slug } = await params;
  
  try {
    // Perbaiki pemanggilan di sini.
    // Argumen pertama adalah string query, argumen kedua adalah objek options.
    const { kegiatan } = await performRequest(KEGIATAN_DETAIL_QUERY, {
      variables: { slug: slug }
    });

    if (!kegiatan) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          Kegiatan tidak ditemukan.
        </div>
      );
    }

    return <KegiatanDetailClient data={kegiatan} />;
  } catch (error) {
    console.error("Gagal mengambil data dari DatoCMS:", error);
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Terjadi kesalahan saat memuat kegiatan.
      </div>
    );
  }
}