import Sidebar from "./components/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="h-screen w-full bg-[#141415] flex">
      <aside className="w-[90px] md:w-3xs flex-shrink-0">
        <div className="sticky top-0 h-screen">
          <Sidebar />
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-[#141415]">
        {children}
      </main>
    </div>
  );
}
