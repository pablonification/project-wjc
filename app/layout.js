"use client";

import { Geist, Geist_Mono, Manrope } from "next/font/google";
import Navbar from "./components/Navbar";
import { SessionProvider } from "./context/SessionContext";
import { usePathname } from "next/navigation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isDashboardPage = pathname.startsWith('/dashboard');

  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} antialiased`}
      >
        <SessionProvider>
          <div className={isDashboardPage ? "flex h-screen" : ""}>
            {isDashboardPage ? "" : <Navbar />}

            <main className={isDashboardPage ? "flex-1 overflow-y-auto" : ""}>
              {children}
            </main>

          </div>
        </SessionProvider>
      </body>
    </html>
  );
}