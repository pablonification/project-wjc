import { Sidebar } from "../components";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
