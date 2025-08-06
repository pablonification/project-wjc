'use client';

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import KegiatanCard from './KegiatanCard';

// ----- Pindahkan komponen-komponen pembantu di sini -----
function KegiatanListSkeleton() {
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
// --------------------------------------------------------

export function KegiatanListClient({ activities }) {
  const [activeTab, setActiveTab] = useState("Semua");
  const [visibleCount, setVisibleCount] = useState(4);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleShowMore = () => {
    setVisibleCount((prevCount) => prevCount + 4);
  };

  const tabs = ["Semua", "Sedang Berlangsung", "Mendatang", "Selesai"];

  const statusMap = {
    UPCOMING: "Mendatang",
    ONGOING: "Sedang Berlangsung",
    COMPLETED: "Selesai",
  };

  const filteredActivities =
    activeTab === "Semua"
      ? activities
      : activities.filter((act) => statusMap[act.statusKegiatan] === activeTab);

  return (
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
                      activeTab === tab ? "bg-gray-700 text-white" : "text-gray-300"
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
                    activeTab === tab ? "font-semibold text-white border-b-2 border-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 font-manrope">
          {filteredActivities.length > 0 ? (
            filteredActivities
              .slice(0, visibleCount)
              .map((activity) => (
                <KegiatanCard
                  key={activity.id}
                  title={activity.title}
                  description={activity.description}
                  date={new Date(activity.dateStart).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  location={activity.location}
                  status={statusMap[activity.statusKegiatan]}
                  slug={activity.slug}
                  imageUrl={activity.image.url}
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
  );
}