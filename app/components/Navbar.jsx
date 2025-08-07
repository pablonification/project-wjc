"use client";

import Image from "next/image";
import Link from "next/link";
import { Logo } from "../../public/assets/image";
import Button from "./Button";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../context/SessionContext";

const AuthLinks = ({
  isMobile = false,
  user,
  isLoading,
  isAdmin,
  isDropdownOpen,
  setIsDropdownOpen,
  dropdownRef,
  handleLogout,
  closeSidebar,
}) => {
  if (isLoading) {
    return <div className="h-6 w-24 bg-gray-700 rounded animate-pulse"></div>;
  }

  if (user) {
    // Tampilan jika sudah login
    return (
      <div className={`flex items-center gap-4 ${isMobile ? "flex-col items-start w-full" : ""}`}>
        {/* Dropdown hanya untuk desktop */}
        {!isMobile && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1 rounded-sm cursor-pointer hover:bg-gray-700 transition-colors"
            >
              <span>Hello, {user.nickname || user.name}!</span>
              <svg className={`w-4 h-4 text-white transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                <Link href="/profile" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                {isAdmin(user.role) && (
                  <Link href="/dashboard" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dashboard</Link>
                )}
                <Link href="/profile/my-orders" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Pesanan Saya</Link>
                <Link href="/profile/my-activities" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Kegiatan Saya</Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
              </div>
            )}
          </div>
        )}

        {/* Link untuk mobile */}
        {isMobile && (
          <>
            <div className="text-lg font-semibold">Hello, {user.nickname || user.name}!</div>
            <Link href="/profile" onClick={closeSidebar} className="p-2 w-full text-left rounded-md hover:text-red-600 hover:bg-gray-800 flex items-center gap-2">Profile</Link>
            <Link href="/profile/my-orders" onClick={closeSidebar} className="p-2 w-full text-left rounded-md hover:text-red-600 hover:bg-gray-800 flex items-center gap-2">Pesanan Saya</Link>
            <Link href="/profile/my-activities" onClick={closeSidebar} className="p-2 w-full text-left rounded-md hover:text-red-600 hover:bg-gray-800 flex items-center gap-2">Kegiatan Saya</Link>
            {isAdmin(user.role) && (
              <Link href="/dashboard" onClick={closeSidebar} className="p-2 w-full text-left rounded-md hover:text-red-600 hover:bg-gray-800 flex items-center gap-2">Dashboard</Link>
            )}
            <button onClick={handleLogout} className="p-2 w-full text-left text-red-500 rounded-md hover:bg-gray-800 flex items-center gap-2">Logout</button>
          </>
        )}
      </div>
    );
  }

  // Tampilan jika belum login
  return (
    <div className={`flex items-center gap-6 ${isMobile ? "flex-col items-start w-full gap-4" : ""}`}>
      <Link href="/register" onClick={closeSidebar} className={isMobile ? "p-2 w-full text-left rounded-md hover:text-red-600 hover:bg-gray-800" : "hover:text-red-500"}>Daftar</Link>
      <div className={isMobile ? "w-full" : ""}>
        <Button label="Login" href="/login" onClick={isMobile ? closeSidebar : undefined} />
      </div>
    </div>
  );
};


const Navbar = () => {
  const router = useRouter();
  const { user, isLoading, setUser, fetchSession } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setIsDropdownOpen(false); 
      setIsOpen(false);
      await fetchSession();
      router.push("/");
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  };

  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isDropdownOpen]);

  const closeSidebar = () => setIsOpen(false);

  const isAdmin = (userRole) => {
    if (!userRole) return false;
    return userRole.toString().toLowerCase() === "admin";
  };
  
  const authLinksProps = {
    user, isLoading, isAdmin, isDropdownOpen, setIsDropdownOpen, dropdownRef, handleLogout, closeSidebar,
  };

  return (
    <>
      <header className="fixed top-0 z-[1000] w-full px-8 lg:px-18 py-3 flex justify-between items-center bg-transparent backdrop-blur-sm">
        <Link href="/" className={`${isOpen ? "invisible" : "visible"} lg:visible`}>
          <div className="relative w-10 h-10 lg:w-12 lg:h-12">
            <Image src={Logo} alt="logo" fill priority />
          </div>
        </Link>
        
        {/* Desktop */}
        <div className="font-manrope hidden lg:flex gap-8 text-white max-h-[40px] items-center">
          <Link href="/">Home</Link>
          <Link href="/kegiatan">Kegiatan</Link>
          <Link href="/berita">Berita</Link>
          <Link href="/dokumentasi">Dokumentasi</Link>
          <Link href="/merchandise">Merchandise</Link>
          <div className="border-l-2 border-white self-stretch"></div>
          <AuthLinks {...authLinksProps} isMobile={false} />
        </div>

        {/* Hamburger */}
        <div className="lg:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-white p-2 cursor-pointer" aria-label="Toggle menu">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
            </button>
        </div>
      </header>

      {/* Sidebar Mobile */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-black p-6 flex flex-col gap-8 transform transition-transform duration-300 ease-in-out z-[1002] lg:hidden ${isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex justify-between items-center">
          <Link href="/" onClick={closeSidebar}>
            <Image src={Logo} alt="logo" width={48} height={48} />
          </Link>
          <button onClick={closeSidebar} className="text-white p-2 cursor-pointer" aria-label="Close menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col gap-4 text-white">
          <Link href="/" onClick={closeSidebar} className="p-2 w-full text-left rounded-md hover:text-red-600 hover:bg-gray-800 transition-colors">Home</Link>
          <Link href="/kegiatan" onClick={closeSidebar} className="p-2 w-full text-left hover:text-red-600 hover:bg-gray-800 transition-colors">Kegiatan</Link>
          <Link href="/berita" onClick={closeSidebar} className="p-2 w-full text-left hover:text-red-600 hover:bg-gray-800 transition-colors">Berita</Link>
          <Link href="/dokumentasi" onClick={closeSidebar} className="p-2 w-full text-left hover:text-red-600 hover:bg-gray-800 transition-colors">Dokumentasi</Link>
          <Link href="/merchandise" onClick={closeSidebar} className="p-2 w-full text-left hover:text-red-600 hover:bg-gray-800 transition-colors">Merchandise</Link>
          <div className="border-b-2 border-gray-600 my-2"></div>
          <AuthLinks {...authLinksProps} isMobile={true} />
        </div>
      </div>
      
      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1001] lg:hidden" onClick={closeSidebar}></div>
      )}
    </>
  );
};

export default Navbar;