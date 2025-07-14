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
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-7 w-7 text-gray-400" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
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
    <div>
      <h1 className="mb-8 text-3xl font-bold text-gray-800">
        Dashboard Overview
      </h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card title="Total Users" value={userCount} icon={Users} />
        <Card
          title="Whitelisted Numbers"
          value={whitelistCount}
          icon={ShieldCheck}
        />
        <Card title="Berita Articles" value={beritaCount} icon={Newspaper} />
        <Card title="Kegiatan Events" value={kegiatanCount} icon={Calendar} />
        <Card
          title="Merchandise Items"
          value={merchandiseCount}
          icon={ShoppingBag}
        />
      </div>
    </div>
  );
}
