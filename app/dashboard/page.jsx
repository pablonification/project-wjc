"use server";
import {
  Users,
  Newspaper,
  Calendar,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";
import prisma from "@/lib/prisma";

const Card = ({ title, value, icon: Icon }) => {
  return (
    <div className="rounded-xl bg-[#181818] p-5 shadow-md border border-[#222225] flex items-center gap-4">
      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-lg bg-[#222225]">
        <Icon className="h-7 w-7 text-red-600" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-[#B3B4B6] mb-1">{title}</h3>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
};

export default async function DashboardPage() {
  const userCount = await prisma.user.count();
  const whitelistCount = await prisma.whitelist.count();
  const beritaCount = await prisma.berita.count();
  const kegiatanCount = await prisma.kegiatan.count();
  const merchandiseCount = await prisma.merchandise.count();

  return (
    <div className="min-h-screen bg-[#141415] px-8 py-19">
      <h1 className="mb-10 text-3xl font-bold text-white">Dashboard Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card title="Total Users" value={userCount} icon={Users} />
        <Card title="Whitelisted Numbers" value={whitelistCount} icon={ShieldCheck} />
        <Card title="Berita Articles" value={beritaCount} icon={Newspaper} />
        <Card title="Kegiatan Events" value={kegiatanCount} icon={Calendar} />
        <Card title="Merchandise Items" value={merchandiseCount} icon={ShoppingBag} />
      </div>
    </div>
  );
}