import { Navbar, Footer } from "@/app/components";

function KegiatanDetailSkeleton() {
  return (
    <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-28 py-16 font-manrope translate-y-28 mb-60 text-white animate-pulse">
      {/* Back link skeleton */}
      <div className="w-32 h-6 bg-gray-700 rounded mb-4" />

      {/* Top section: left info, right image */}
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 pr-0 lg:pr-8">
          <div className="h-12 w-2/3 bg-gray-700 rounded mb-4" /> {/* Title */}
          <div className="flex gap-6 mb-4">
            <div className="h-6 w-24 bg-gray-700 rounded" /> {/* Location */}
            <div className="h-6 w-32 bg-gray-700 rounded" /> {/* Status */}
          </div>
          <div className="h-6 w-1/3 bg-gray-700 rounded mb-4" /> {/* Date */}
          <div className="h-10 w-40 bg-gray-700 rounded mb-8" /> {/* Button */}
        </div>
        <div className="w-full lg:w-1/3 h-60 bg-gray-700 rounded mb-6 lg:mb-0" />
      </div>

      {/* Description section */}
      <div className="mt-12">
        <div className="h-8 w-48 bg-gray-700 rounded mb-6" /> {/* Section title */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-4 w-full bg-gray-700 rounded" />
          ))}
          <div className="h-4 w-5/6 bg-gray-700 rounded" />
          <div className="h-4 w-2/3 bg-gray-700 rounded" />
        </div>
      </div>

      {/* Attachments section */}
      <div className="mt-16">
        <div className="h-8 w-40 bg-gray-700 rounded mb-6" /> {/* Section title */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-700 rounded" />
          ))}
        </div>
      </div>
    </main>
  );
}

export default function Loading() {
  return (
    <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
      <Navbar />
      <KegiatanDetailSkeleton />
      <Footer />
    </div>
  );
}