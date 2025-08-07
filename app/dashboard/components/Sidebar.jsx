"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from 'next/image';
import {
      MedDocs,
      SidebarBanner,
      SidebarDashboard,
      SidebarDokumentasi,
      SidebarBerita,
      SidebarKegiatan,
      SidebarMerchandise,
      SidebarPendaftaranKegiatan,
      SidebarUser,
      SidebarPesananMerchandise,
      SidebarWhitelist,
} from '../../../public/assets/image';

const dashboard = [
  { name: "Dashboard", href: "/dashboard", icon: SidebarDashboard },
];
const konten = [
  { name: "Halaman Utama", href: "/dashboard/manajemen-landing-page", icon: SidebarBerita },
  { name: "Berita", href: "/dashboard/manajemen-berita", icon: SidebarBerita },
  { name: "Kegiatan", href: "/dashboard/manajemen-kegiatan", icon: SidebarKegiatan },
  { name: "Merchandise", href: "/dashboard/manajemen-merchandise", icon: SidebarMerchandise },
  { name: "Dokumentasi", href: "/dashboard/manajemen-dokumentasi", icon: SidebarDokumentasi },
];
const aktivitas = [
  { name: "Pendaftaran Kegiatan", href: "/dashboard/manajemen-pendaftaran-kegiatan", icon: SidebarPendaftaranKegiatan },
  { name: "Manajemen Pesanan", href: "/dashboard/manajemen-order", icon: SidebarPesananMerchandise },
];
const anggota = [
  { name: "Whitelist", href: "/dashboard/manajemen-whitelist", icon: SidebarWhitelist },
  { name: "Users", href: "/dashboard/manajemen-user", icon: SidebarUser },
];
const promosi = [
  { name: "Banner Ads", href: "/dashboard/banner-ads", icon: SidebarBanner },
];

// render semua konten
const sidebarSections = [
  { title: "Anggota", shortTitle: "Anggota", links: anggota },
  { title: "Konten dan Produk", shortTitle: "Konten", links: konten },
  { title: "Aktivitas Pengguna", shortTitle: "Aktivitas", links: aktivitas },
  { title: "Promosi dan Iklan", shortTitle: "Promosi", links: promosi },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-[90px] md:w-3xs flex-col py-11 px-4 md:px-6 bg-black text-white">
      <div className="mb-11 flex justify-center md:justify-start">
        <Link href="/">
          <Image
            src={MedDocs}
            width={64}
            height={64}
            alt="logo"
          />
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {/* Link Dashboard*/}
        <Link
          href={dashboard[0].href}
          className={`flex h-[36px] grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium hover:bg-[#1E1E20] hover:text-white md:flex-none md:justify-start md:p-2 md:px-3
            ${pathname === dashboard[0].href ? "bg-[#1E1E20] text-white" : ""}
          `}
        >
          <Image src={dashboard[0].icon} alt="icon"/>
          <p className="hidden md:block">{dashboard[0].name}</p>
        </Link>

        {sidebarSections.map((section) => (
          <div key={section.title} className="flex flex-col space-y-1">
            <h1 className="px-2 text-center text-b2 text-[#B3B4B6] pb-1 md:text-left">
              <span className="md:hidden">{section.shortTitle}</span>
              <span className="hidden md:inline">{section.title}</span>
            </h1>
            {section.links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex h-[36px] grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium hover:bg-[#1E1E20] hover:text-white md:flex-none md:justify-start md:p-2 md:px-3
                    ${isActive ? "bg-[#1E1E20] text-white" : ""}
                  `}
                >
                  <Image src={link.icon} alt={`${link.name} icon`}/>
                  <p className="hidden md:block">{link.name}</p>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}