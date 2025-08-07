// skeleton
import { Navbar, Footer } from "../../components";

export default function ProfileLoading() {
  return (
    <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
      <Navbar />
      <div className="min-h-screen bg-black flex items-center justify-center px-2 pt-24 pb-12 animate-pulse">
        <div className="flex flex-col items-center w-full max-w-lg p-8 md:p-12">
          <div className="h-9 w-48 bg-gray-700 rounded-md mb-8"></div>
          <div className="flex flex-col gap-8 w-full">
            {/* Skeleton for Phone Number */}
            <div className="space-y-2">
              <div className="h-4 w-1/3 bg-gray-700 rounded"></div>
              <div className="h-8 w-full bg-gray-800 border-b border-gray-700 rounded"></div>
            </div>
            {/* Skeleton for Name */}
            <div className="space-y-2">
              <div className="h-4 w-1/3 bg-gray-700 rounded"></div>
              <div className="h-8 w-full bg-gray-800 border-b border-gray-700 rounded"></div>
            </div>
            {/* Skeleton for Nickname */}
            <div className="space-y-2">
              <div className="h-4 w-1/3 bg-gray-700 rounded"></div>
              <div className="h-8 w-full bg-gray-800 border-b border-gray-700 rounded"></div>
            </div>
            {/* Skeleton for Chapter */}
            <div className="space-y-2">
              <div className="h-4 w-1/3 bg-gray-700 rounded"></div>
              <div className="h-8 w-full bg-gray-800 border-b border-gray-700 rounded"></div>
            </div>
            {/* Skeleton for KTP Upload */}
            <div className="space-y-2">
              <div className="h-4 w-1/3 bg-gray-700 rounded"></div>
              <div className="h-10 w-40 bg-gray-700 rounded-md mt-2"></div>
            </div>
            {/* Skeleton for Button */}
            <div className="h-12 w-full bg-gray-700 rounded-md mt-4"></div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}