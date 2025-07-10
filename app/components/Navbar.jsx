"use client";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "../../public/assets/image";
import Button from "./Button";
import { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      <header className="fixed top-0 z-[1000] w-full px-8 lg:px-18 py-3 flex justify-between items-center bg-black">
        <Link
          href="/"
          className={`${isOpen ? "invisible" : "visible"} lg:visible`}
        >
          <Image src={Logo} alt="logo" width={64} height={64} />
        </Link>

        {/* Desktop */}
        <div className="font-manrope hidden lg:flex items-center gap-6 text-white">
          <Link href="/" className="hover:text-gray-400 transition-colors">
            Home
          </Link>
          <Link href="/kegiatan" className="hover:text-gray-400 transition-colors">
            Kegiatan
          </Link>
          <Link href="/berita" className="hover:text-gray-400 transition-colors">
            Berita
          </Link>
          <Link href="/dokumentasi" className="hover:text-gray-400 transition-colors">
            Dokumentasi
          </Link>
          <Link href="/merchandise" className="hover:text-gray-400 transition-colors">
            Merchandise
          </Link>
          <div className="border-l-2 border-white self-stretch"></div>
          <Link href="/register" className="hover:text-gray-400 transition-colors">
            Daftar
          </Link>
          <Button label="Login" href="/login"/>
        </div>

        {/* Hamburger */}
        <div className="lg:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white p-2 cursor-pointer"
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
      </header>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1001] lg:hidden"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-black p-6
                    flex flex-col gap-8
                    transform transition-transform duration-300 ease-in-out z-[1002] lg:hidden
                    ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center">
          <Link href="/" onClick={closeSidebar}>
            <Image src={Logo} alt="logo" width={48} height={48} />
          </Link>
          <button
            onClick={closeSidebar}
            className="text-white p-2 cursor-pointer"
            aria-label="Close menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Sideber (styling) */}
        <div className="flex flex-col gap-4 text-white ">
          <Link
            href="/"
            onClick={closeSidebar}
            className="p-2 w-full text-left rounded-md hover:text-red-600 hover:bg-gray-800 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/kegiatan"
            onClick={closeSidebar}
            className="p-2 w-full text-left hover:text-red-600 hover:bg-gray-800 transition-colors"
          >
            Kegiatan
          </Link>
          <Link
            href="/berita"
            onClick={closeSidebar}
            className="p-2 w-full text-left hover:text-red-600 hover:bg-gray-800 transition-colors"
          >
            Berita
          </Link>
          <Link
            href="/dokumentasi"
            onClick={closeSidebar}
            className="p-2 w-full text-left hover:text-red-600 hover:bg-gray-800 transition-colors"
          >
            Dokumentasi
          </Link>
          <Link
            href="/merchandise"
            onClick={closeSidebar}
            className="p-2 w-full text-left hover:text-red-600 hover:bg-gray-800 transition-colors"
          >
            Merchandise
          </Link>

          <div className="border-b-2 border-gray-600 my-2"></div>

          <Link
            href="/register"
            onClick={closeSidebar}
            className="p-2 w-full text-left rounded-md hover:text-red-600 hover:bg-gray-800 transition-colors"
          >
            Daftar
          </Link>
          <div onClick={closeSidebar} className="w-full">
            <Button label="Login" href="/login" className="flex" />
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
