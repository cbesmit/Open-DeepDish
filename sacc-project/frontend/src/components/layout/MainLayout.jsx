import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNavbar from './MobileNavbar';

export default function MainLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64 transition-all duration-300">
        
        {/* Mobile Navbar */}
        <MobileNavbar />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 pt-20 md:p-8 md:pt-8 scroll-smooth">
          <div className="max-w-5xl mx-auto">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
