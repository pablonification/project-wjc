"use client";
import { Navbar, Footer, Button } from "../components";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

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
    "Sedang Berlangsung": "bg-[#F5CB58] text-black",
    Selesai: "bg-[#97D077] text-black",
  };

  return (
    <div className="flex font-manrope">
      <div className="w-1/3 bg-[#D9D9D9] relative overflow-hidden">
        {imageUrl && (
          <Image src={imageUrl} alt={title} fill className="object-cover" />
        )}
      </div>
      <div className="p-8 flex flex-col flex-grow">
        <div>
          {status && (
            <div className="mb-4">
              {status !== "Mendatang" && (
                <span
                  className={`inline-block px-3 py-1 text-sm font-semibold ${statusStyles[status]}`}
                >
                  {status}
                </span>
              )}
            </div>
          )}
          <h3 className="text-h1 font-bold text-white mb-4">{title}</h3>
          <p className="text-gray-400 leading-relaxed text-b1">{description}</p>
        </div>

        <div className="mt-auto pt-6 flex justify-between items-end">
          <div className="flex items-center text-gray-400 text-b2">
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

          <Link
            href={`/kegiatan/${slug}`}
            className="text-white font-semibold flex items-center group text-sh1"
          >
            Daftar Sekarang
            <Image
              src="/assets/image/ArrowOutward.png"
              alt="arrow"
              width={24}
              height={24}
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

  useEffect(() => {
    const fetchActivities = async () => {
      try {
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

  return (
    <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-[#1F1F1F]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-28 py-24">
          <h1 className="text-display font-manrope font-bold text-white translate-y-16">
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
                  className={`pb-2 cursor-pointer text-sh1 font-manrope transition-colors ${
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
            {loading ? (
              <p className="text-white">Memuat...</p>
            ) : filteredActivities.length ? (
              filteredActivities.map((activity, index) => (
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
              <p className="text-white">Tidak ada kegiatan.</p>
            )}
          </div>

          <div className="text-center mt-12 flex justify-center">
            <Link href="/kegiatan">
              <button className="py-2 px-48 bg-[#403E3D] flex items-center gap-2 cursor-pointer font-manrope">
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
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
