
import { useState } from "react";
import { Outlet } from "react-router-dom";
import TransporterSidebar from "../transporterSidebar/transporterSidebar";
import TransporterNavbar from "../transporterNavbar/transporterNavbar";

export default function transporterLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen); 

  return (
    <div className="flex">
      {/* Sidebar */}
      <TransporterSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content (Takes full screen when sidebar is closed) */}
      <div
        className={`flex-1 min-h-screen transition-all duration-300 
        ${sidebarOpen ? "ml-0 md:ml-0 lg:ml-64" : "ml-0 md:ml-0 lg:ml-64"}`}
      >
        <TransporterNavbar
          toggleSidebar={toggleSidebar}
          isSidebarOpen={sidebarOpen}
        />

        <main className="mt-16 p-5">{children || <Outlet />}</main>
      </div>
    </div>
  );
}
