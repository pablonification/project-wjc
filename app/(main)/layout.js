"use client";

import Navbar from "@/app/components/Navbar";
import { usePathname } from "next/navigation";

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const isDashboardPage = pathname.startsWith('/dashboard');

  return (
    <div className={isDashboardPage ? "flex h-screen" : ""}>
      {isDashboardPage ? "" : <Navbar />}
      <main className={isDashboardPage ? "flex-1 overflow-y-auto" : ""}>
        {children}
      </main>
    </div>
  );
}