"use client";
import { Navbar, Footer, Button } from "../../components";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import BannerAd from "../../components/BannerAd";

// Skeleton loader for the activities list
function KegiatanListSkeleton() {
  // Show 4 skeleton cards as placeholders
  return (
    <>
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="flex flex-col md:flex-row animate-pulse font-manrope rounded-lg overflow-hidden"
        >
          <div className="w-full md:w-1/3 h-48 md:h-auto bg-gray-700" />
          <div className="p-4 md:p-6 flex-1">
            <div className="h-5 w-1/4 bg-gray-700 rounded-full mb-2" />
            <div className="h-8 w-3/4 bg-gray-700 rounded mb-2" />
            <div className="h-4 w-full bg-gray-700 rounded mb-1" />
            <div className="h-4 w-5/6 bg-gray-700 rounded" />
            <div className="mt-6 pt-4 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-700 rounded" />
                <div className="h-4 w-32 bg-gray-700 rounded" />
              </div>
              <div className="h-6 w-32 bg-gray-700 rounded" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

const CalendarIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
    className={`font-manrope ${props.className || ""}`}
  >
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const KegiatanCard = ({
  title,
  description,
  date,
  location,
  status,
  slug,
  imageUrl,
}) => {
  const statusStyles = {
    Mendatang: "bg-blue-200 text-blue-800",
    "Sedang Berlangsung": "bg-[#F5CB58] text-black",
    Selesai: "bg-[#97D077] text-black",
  };

  return (
    // Updated main container: flex-col on mobile, md:flex-row for larger screens
    <div className="flex flex-col md:flex-row font-manrope overflow-hidden">
      {/* Updated Image container: w-full on mobile, h-48 for consistent height */}
      <div className="w-full md:w-1/3 flex-shrink-0 bg-[#D9D9D9] relative h-48 md:h-auto">
        {imageUrl && (
          <Image src={imageUrl} alt={title} fill className="object-cover" />
        )}
      </div>
      {/* Updated Content container: Adjusted padding and structure for responsiveness */}
      <div className="p-4 md:p-6 flex flex-col flex-grow font-manrope">
        <div>
          {status && (
            <div className="mb-2">
              <span
                className={`inline-block px-3 py-1 text-xs font-semibold font-manrope ${statusStyles[status]}`}
              >
                {status}
              </span>
            </div>
          )}
          <h3 className="text-xl lg:text-2xl font-bold text-white mb-2 font-manrope">
            {title}
          </h3>
          <p className="text-gray-400 leading-relaxed text-sm lg:text-b1 line-clamp-2 font-manrope">
            {description}
          </p>
        </div>

        {/* Updated Details container: Stacks on mobile, responsive spacing */}
        <div className="mt-6 pt-4  flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center text-gray-400 text-b2 gap-x-4 gap-y-2 font-manrope">
            <span className="flex items-center font-manrope">
              <CalendarIcon className="mr-2 flex-shrink-0" />
              {date}
            </span>
            <span className="flex items-center font-manrope">
              <Image
                src="/assets/image/Location.png"
                alt="location"
                width={16}
                height={16}
                className="mr-2 flex-shrink-0"
              />
              {location}
            </span>
          </div>

          <Link
            href={`/kegiatan/${slug}`}
            className="text-white font-semibold flex items-center group text-base lg:text-sh1 font-manrope flex-shrink-0"
          >
            {status === "Mendatang" ? "Daftar Sekarang" : "Lihat Detail"}
            <Image
              src="/assets/image/ArrowOutward.png"
              alt="arrow"
              width={20}
              height={20}
              className="ml-2 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default function Kegiatan() {
  const [activeTab, setActiveTab] = useState("Semua");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(4); // Show 4 activities initially

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/kegiatan");
        if (!res.ok) throw new Error("Gagal mengambil data kegiatan");
        const data = await res.json();
        setActivities(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 4);
  };

  const tabs = ["Semua", "Sedang Berlangsung", "Mendatang", "Selesai"];

  const filteredActivities =
    activeTab === "Semua"
      ? activities
      : activities.filter((act) => {
          const statusMap = {
            UPCOMING: "Mendatang",
            ONGOING: "Sedang Berlangsung",
            COMPLETED: "Selesai",
          };
          return statusMap[act.status] === activeTab;
        });

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  return (
    <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-[#1F1F1F] font-manrope">
        <div className="container mx-auto px-4 sm:px-6 lg:px-28 py-24">
          <h1 className="text-display font-manrope font-bold text-white translate-y-16">
            Kegiatan
          </h1>
        </div>
      </section>
      {/* Banner Ad after Hero */}
      <BannerAd page="kegiatan" />
      {/* Main Content */}
      <section className="bg-black flex-grow font-manrope">
        <div className="container mx-auto px-4 sm:px-6 lg:px-28 py-24">
          <div className="mb-12 font-manrope">
            {/* Dropdown for mobile screens */}
            <div className="sm:hidden relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex justify-between items-center px-4 py-2 text-white border border-gray-700"
              >
                <span>{activeTab}</span>
                <svg
                  className={`w-5 h-5 transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-black shadow-lg z-10 border border-gray-700">
                  {tabs.map((tab) => (
                    <a
                      key={tab}
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab(tab);
                        setIsDropdownOpen(false);
                      }}
                      className={`block px-4 py-2 ${
                        activeTab === tab
                          ? "bg-gray-700 text-white"
                          : "text-gray-300"
                      }`}
                    >
                      {tab}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs for larger screens */}
            <div className="hidden sm:block border-b border-gray-700">
              <div className="flex space-x-8 font-manrope">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-2 cursor-pointer text-sh1 font-manrope transition-colors whitespace-nowrap ${
                      activeTab === tab
                        ? "font-semibold text-white border-b-2 border-white"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-12 font-manrope">
            {loading ? (
              <KegiatanListSkeleton />
            ) : filteredActivities.length > 0 ? (
              filteredActivities
                .slice(0, visibleCount)
                .map((activity, index) => (
                  <KegiatanCard
                    key={index}
                    title={activity.title}
                    description={activity.description}
                    date={new Date(activity.dateStart).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                    location={activity.location}
                    status={
                      activity.status === "UPCOMING"
                        ? "Mendatang"
                        : activity.status === "ONGOING"
                        ? "Sedang Berlangsung"
                        : "Selesai"
                    }
                    slug={activity.slug}
                    imageUrl={activity.imageUrl}
                  />
                ))
            ) : (
              <p className="text-white font-manrope">Tidak ada kegiatan.</p>
            )}
          </div>

          {filteredActivities.length > visibleCount && (
            <div className="text-center mt-12 flex justify-center font-manrope">
              <button
                onClick={handleShowMore}
                className="py-2 px-8 sm:px-24 md:px-36 lg:px-48 bg-[#403E3D] flex items-center gap-2 cursor-pointer font-manrope w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl justify-center"
              >
                <p className="text-white font-manrope text-lg">Show More</p>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={20}
                  height={20}
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M10 5v10M5 10h10"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
}
