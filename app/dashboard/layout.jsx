import Sidebar from "./components/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-[#141415] flex">
      <div className="fixed top-0 h-screen z-100">
        <Sidebar />
      </div>
      <div className="ml-20 md:ml-64 flex-1 bg-[#141415] min-h-screen">{children}</div>
    </div>
  );
}
