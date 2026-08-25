import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, FileText, Plus, Compass, Bot } from 'lucide-react';

export const MobileNav: React.FC = () => {
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '/citizen', icon: Home, exact: true },
    { name: 'Reports', path: '/citizen/my-reports', icon: FileText },
    { name: 'Report', path: '/citizen/report-defect', isCenter: true },
    { name: 'Risk', path: '/citizen/risk-map', icon: Compass },
    { name: 'AI Assistant', path: '/citizen/assistant', icon: Bot },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-[#0d1322]/90 backdrop-blur-2xl border-t border-white/10 pb-safe">
      <div className="flex justify-around items-center h-16 px-2 max-w-md mx-auto relative">
        {navItems.map((item, idx) => {
          if (item.isCenter) {
            return (
              <div key={idx} className="relative -mt-6">
                <button
                  onClick={() => navigate('/citizen/report-defect')}
                  className="flex items-center justify-center w-14 h-14 rounded-full bg-[#b3c5ff] text-[#002b75] shadow-[0_0_20px_rgba(179,197,255,0.6)] active:scale-95 hover:scale-105 transition-all focus:outline-none border-2 border-[#0d1322]"
                  aria-label="Report Road Hazard"
                >
                  <Plus className="w-8 h-8 stroke-[2.5]" />
                </button>
              </div>
            );
          }

          const Icon = item.icon!;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 w-14 py-1 transition-colors ${
                  isActive ? 'text-[#b3c5ff]' : 'text-[#8c90a1] hover:text-[#c2c6d8]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#b3c5ff] drop-shadow-[0_0_8px_rgba(179,197,255,0.6)]' : ''}`} />
                  <span className="font-mono text-[9px] uppercase tracking-wider font-semibold">
                    {item.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
