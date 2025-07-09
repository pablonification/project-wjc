"use client"
import { Navbar, Footer, Button } from "../components";
import { useState } from "react";
import Image from "next/image";

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

const KegiatanCard = ({ title, description, date, location, status }) => {
  const statusStyles = {
    "Sedang Berlangsung": "bg-[#F5CB58] text-black",
    "Selesai": "bg-[#97D077] text-black",
  };

  return (
    <div className="flex font-manrope">
      <div className="w-1/3 bg-[#D9D9D9]" />
      <div className="p-8 flex flex-col flex-grow">
        <div>
          {status && (
            <div className="mb-4">
              <span
                className={`inline-block px-3 py-1 text-sm font-semibold ${statusStyles[status]}`}
              >
                {status}
              </span>
            </div>
          )}
          <h3 className="text-3xl font-bold text-white mb-4">{title}</h3>
          <p className="text-gray-400 leading-relaxed">{description}</p>
        </div>

        <div className="mt-auto pt-6 flex justify-between items-end">
          <div className="flex items-center text-gray-400 text-sm">
            <span className="flex items-center mr-6">
              <CalendarIcon className="mr-2" />
              {date}
            </span>
            <span className="flex items-center">
              <Image
                src="/assets/image/Location.png"
                alt="location"
                width={16}
                height={16}
                className="mr-2"
              />
              {location}
            </span>
          </div>

          <a
            href="#"
            className="text-white font-semibold flex items-center group text-lg"
          >
            Daftar Sekarang
            <Image
              src="/assets/image/ArrowOutward.png"
              alt="arrow"
              width={24}
              height={24}
              className="ml-2 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default function Kegiatan() {
  const [activeTab, setActiveTab] = useState("Semua");

  const activities = [
    {
      title: "Judul Kegiatan",
      description:
        "Lorem ipsum dolor sit amet consectetur. In facilisis dolor ut at non. Ultrices pharetra consectetur tempus iaculis consequat amet phasellus ac.",
      date: "12-15 Jul 2025",
      location: "Alamat lokasi",
      status: "Mendatang",
    },
    {
      title: "Judul Kegiatan",
      description:
        "Lorem ipsum dolor sit amet consectetur. In facilisis dolor ut at non. Ultrices pharetra consectetur tempus iaculis consequat amet phasellus ac.",
      date: "12-15 Jul 2025",
      location: "Alamat lokasi",
      status: "Mendatang",
    },
    {
      title: "Judul Kegiatan",
      description:
        "Lorem ipsum dolor sit amet consectetur. In facilisis dolor ut at non. Ultrices pharetra consectetur tempus iaculis consequat amet phasellus ac.",
      date: "12-15 Jul 2025",
      location: "Alamat lokasi",
      status: "Sedang Berlangsung",
    },
    {
      title: "Judul Kegiatan",
      description:
        "Lorem ipsum dolor sit amet consectetur. In facilisis dolor ut at non. Ultrices pharetra consectetur tempus iaculis consequat amet phasellus ac.",
      date: "12-15 Jul 2025",
      location: "Alamat lokasi",
      status: "Selesai",
    },
  ];

  const tabs = ["Semua", "Sedang Berlangsung", "Mendatang", "Selesai"];

  const filteredActivities =
    activeTab === "Semua"
      ? activities
      : activities.filter((act) => act.status === activeTab);

  return (
    <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-[#1F1F1F]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-28 py-24">
          <h1 className="text-5xl lg:text-6xl font-manrope font-bold text-white translate-y-16">
            Kegiatan
          </h1>
        </div>
      </section>

      {/* Main Content */}
      <section className="bg-black flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-28 py-24">
          <div className="border-b border-gray-700 mb-12 font-manrope">
            <div className="flex space-x-8 font-manrope">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 cursor-pointer text-lg font-manrope transition-colors ${
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

          <div className="grid grid-cols-1 gap-12 font-manrope">
            {filteredActivities.map((activity, index) => (
              <KegiatanCard key={index} {...activity} />
            ))}
          </div>

          <div className="text-center mt-12 font-manrope">
            <Button label="Show More" href="/kegiatan" />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
