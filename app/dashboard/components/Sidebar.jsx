"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Newspaper,
  Calendar,
  ShoppingBag,
  Camera,
  ShieldCheck,
  LayoutDashboard,
  ShoppingCart,
  ClipboardList, // Icon baru
} from "lucide-react";

const links = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    name: "Whitelist",
    href: "/dashboard/manajemen-whitelist",
    icon: ShieldCheck,
  },
  { name: "Users", href: "/dashboard/manajemen-user", icon: Users },
  { name: "Berita", href: "/dashboard/manajemen-berita", icon: Newspaper },
  { name: "Kegiatan", href: "/dashboard/manajemen-kegiatan", icon: Calendar },
  {
    name: "Pendaftaran Kegiatan",
    href: "/dashboard/manajemen-pendaftaran-kegiatan",
    icon: ClipboardList,
  },
  {
    name: "Merchandise",
    href: "/dashboard/manajemen-merchandise",
    icon: ShoppingBag,
  },
  {
    name: "Manajemen Pesanan",
    href: "/dashboard/manajemen-order",
    icon: ShoppingCart,
  },
  {
    name: "Dokumentasi",
    href: "/dashboard/manajemen-dokumentasi",
    icon: Camera,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2 bg-gray-800 text-white">
      <div className="mb-2 flex h-20 items-end justify-start rounded-md bg-gray-700 p-4 md:h-40">
        <Link href="/" className="text-2xl font-bold">
          MedDocs WJC
        </Link>
      </div>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        {links.map((link) => {
          const LinkIcon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex h-[48px] grow items-center justify-center gap-2 rounded-md p-3 text-sm font-medium hover:bg-sky-500 hover:text-white md:flex-none md:justify-start md:p-2 md:px-3
                ${pathname === link.href ? "bg-sky-600 text-white" : ""}
              `}
            >
              <LinkIcon className="w-6" />
              <p className="hidden md:block">{link.name}</p>
            </Link>
          );
        })}
        <div className="hidden h-auto w-full grow rounded-md bg-gray-800 md:block"></div>
      </div>
    </div>
  );
}