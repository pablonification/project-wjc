import { Geist, Geist_Mono, Manrope } from "next/font/google";
import { SessionProvider } from "./context/SessionContext";
import AlertProvider from "./components/AlertProvider";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const manrope = Manrope({ variable: "--font-manrope", subsets: ["latin"] });

export const metadata = {
  title: "Meddocs WJC",
  description: "Meddocs WJC adalah komunitas nirlaba resmi bagi para dokter yang memiliki hobi otomotif. Situs ini dibuat sebagai pusat informasi mengenai kegiatan dari Meddocs WJC",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} antialiased`}>
        <AlertProvider>
          <SessionProvider>
            {children}
          </SessionProvider>
        </AlertProvider>
      </body>
    </html>
  );
}