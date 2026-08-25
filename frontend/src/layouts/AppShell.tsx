import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';
import { MobileNav } from '../components/common/MobileNav';
import { UserRole } from '../types';

export const AppShell: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Detect current role based on URL path
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    if (location.pathname.startsWith('/authority')) return 'authority';
    if (location.pathname.startsWith('/maintenance')) return 'maintenance';
    if (location.pathname.startsWith('/emergency')) return 'emergency';
    return 'citizen';
  });

  useEffect(() => {
    if (location.pathname.startsWith('/authority')) setCurrentRole('authority');
    else if (location.pathname.startsWith('/maintenance')) setCurrentRole('maintenance');
    else if (location.pathname.startsWith('/emergency')) setCurrentRole('emergency');
    else if (location.pathname.startsWith('/citizen')) setCurrentRole('citizen');
  }, [location.pathname]);

  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
  };

  const isCitizenMode = currentRole === 'citizen';
  const showSidebar = !isCitizenMode;

  return (
    <div className="min-h-screen bg-[#0d1322] text-[#dde2f8] flex flex-col selection:bg-[#00e3fd]/30 selection:text-[#00e3fd]">
      {/* Top Header */}
      <Header currentRole={currentRole} onRoleChange={handleRoleChange} />

      {/* Main Container */}
      <div className="flex-1 flex pt-16">
        {/* Sidebar for Authority / Ops */}
        {showSidebar && <Sidebar currentRole={currentRole} />}

        {/* Content Viewport */}
        <main
          className={`flex-1 p-4 md:p-6 lg:p-8 transition-all w-full max-w-7xl mx-auto ${
            showSidebar ? 'lg:pl-72 xl:pl-80' : ''
          }`}
        >
          <Outlet />
        </main>
      </div>

      {/* Mobile Nav for Citizen & compact screens */}
      <div className="lg:hidden">
        <MobileNav />
      </div>
      {isCitizenMode && (
        <div className="hidden lg:block">
          <MobileNav />
        </div>
      )}
    </div>
  );
};
