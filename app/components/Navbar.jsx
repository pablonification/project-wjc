"use client";

import Image from "next/image";
import Link from "next/link";
import { Logo } from "../../public/assets/image"; // Pastikan path ini benar
import Button from "./Button"; // Pastikan path ini benar
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef(null);

  // Fetch Session Data
  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        console.log('Session fetch failed:', res.status);
        setUser(null);
      }
    } catch (error) {
      console.error("Gagal mengambil sesi:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh Session
  const refreshSession = async () => {
    setIsLoading(true);
    await fetchSession();
  };

  // Fetch awal
  useEffect(() => {
    fetchSession();
  }, []);

  // Close Dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setIsOpen(false);
      setIsDropdownOpen(false);
      router.push('/');
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  };

  const closeSidebar = () => setIsOpen(false);

  const isAdmin = (userRole) => {
    if (!userRole) return false;
    const role = userRole.toString().toLowerCase();
    return role === 'admin';
  };

  // Komponen kecil untuk merender link otentikasi
  const AuthLinks = ({ isMobile = false }) => {
    if (isLoading) {
      return <div className="h-6 w-24 bg-gray-700 rounded animate-pulse"></div>;
    }

    if (user) {
      // Tampilan kalo udah login
      return (
        <div className={`flex items-center gap-4 ${isMobile ? 'flex-col items-start w-full' : ''}`}>
          <div className="flex items-center gap-2 text-white">
            <span>Hello, {user.name}!</span>
          
            
            {/* Dropdown untuk Desktop */}
            {!isMobile && (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                  className="p-1 rounded-full hover:bg-gray-700 flex items-center gap-1"
                >
                  {/* Icon dropdown */}
                  <svg 
                    className={`w-4 h-4 text-white transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20">
                    <Link 
                      href="/profile" 
                      onClick={() => setIsDropdownOpen(false)} 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    {isAdmin(user.role) && (
                      <Link 
                        href="/dashboard" 
                        onClick={() => setIsDropdownOpen(false)} 
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Dashboard
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout} 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tampilan untuk Mobile */}
          {isMobile && (
            <>
              <Link 
                href="/profile" 
                onClick={closeSidebar} 
                className="p-2 w-full text-left rounded-md hover:text-red-600 hover:bg-gray-800 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Profile
              </Link>
              {isAdmin(user.role) && (
                <Link 
                  href="/dashboard" 
                  onClick={closeSidebar} 
                  className="p-2 w-full text-left rounded-md hover:text-red-600 hover:bg-gray-800 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2z"></path>
                  </svg>
                  Dashboard
                </Link>
              )}
              <button 
                onClick={handleLogout} 
                className="p-2 w-full text-left text-red-500 rounded-md hover:bg-gray-800 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                Logout
              </button>
            </>
          )}
        </div>
      );
    }

    // Tampilan belum login
    return (
      <div className={`flex items-center gap-6 ${isMobile ? 'flex-col items-start w-full gap-4' : ''}`}>
        <Link href="/register" onClick={closeSidebar} className={isMobile ? 'p-2 w-full text-left rounded-md hover:text-red-600 hover:bg-gray-800' : 'hover:text-red-500'}>Daftar</Link>
        <div className={isMobile ? 'w-full' : ''}>
          <Button label="Login" href="/login" onClick={isMobile ? closeSidebar : undefined} />
        </div>
      </div>
    );
  };

  return (
    <>
      <header className="fixed top-0 z-[1000] w-full px-8 lg:px-18 py-3 flex justify-between items-center bg-transparent backdrop-blur-lg">
        <Link href="/" className={`${isOpen ? "invisible" : "visible"} lg:visible`}>
          <div className="relative w-10 h-10 lg:w-12 lg:h-12">
            <Image
              src={Logo}
              alt="logo"
              fill
              priority
            />
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
          <AuthLinks />
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

      {/* Sidebar */}
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
          <AuthLinks isMobile={true} />
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