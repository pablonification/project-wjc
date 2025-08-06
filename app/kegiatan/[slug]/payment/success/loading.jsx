// app/kegiatan/[slug]/payment/success/loading.jsx
import { Navbar, Footer } from "@/app/components";

const ActivityPaymentSuccessPageSkeleton = () => (
    <main className="flex-grow bg-black text-white animate-pulse">
      <div className="container mx-auto mt-20 px-4 sm:px-6 lg:px-28 py-16">
          <div className="max-w-2xl mx-auto text-center">
              <div className="mb-8">
                  <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4" />
                  <div className="h-10 w-3/4 bg-gray-700 rounded mx-auto mb-4" />
                  <div className="h-5 w-full bg-gray-700 rounded mx-auto" />
              </div>

              <div className="bg-gray-900 p-6 rounded-lg mb-8 text-left space-y-4">
                  <div className="h-8 w-1/3 bg-gray-700 rounded mb-4" />
                  <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-700 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                          <div className="h-5 w-full bg-gray-700 rounded" />
                          <div className="h-4 w-1/2 bg-gray-700 rounded" />
                          <div className="h-4 w-3/4 bg-gray-700 rounded" />
                      </div>
                  </div>
                   <div className="border-t border-gray-700 pt-4 space-y-2">
                      <div className="h-5 w-full bg-gray-700 rounded" />
                      <div className="h-5 w-full bg-gray-700 rounded" />
                      <div className="h-7 w-full bg-gray-700 rounded mt-2" />
                  </div>
              </div>

               <div className="space-y-4">
                  <div className="bg-gray-900/60 rounded-lg p-4">
                     <div className="h-5 w-full bg-gray-700 rounded" />
                     <div className="h-5 w-3/4 bg-gray-700 rounded mt-2" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <div className="h-12 w-48 bg-gray-700 rounded-lg" />
                      <div className="h-12 w-48 bg-gray-700 rounded-lg" />
                  </div>
              </div>
          </div>
      </div>
    </main>
);

export default function Loading() {
    return (
        <div className="bg-[#181818] min-h-screen flex flex-col font-manrope">
            <Navbar />
            <ActivityPaymentSuccessPageSkeleton />
            <Footer />
        </div>
    );
}