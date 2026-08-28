import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  Activity,
  AlertOctagon,
  Bot,
  Wrench,
  Globe2,
  Navigation,
  FlaskConical,
  Bell,
  User,
  ShieldCheck,
  Radio,
  Truck,
  FileCheck2,
  TrendingUp,
  Cpu,
  Smartphone,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  currentRole: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentRole }) => {
  const navigate = useNavigate();

  const navigationGroups = [
    {
      label: 'AUTHORITY CORE',
      items: [
        { name: 'Overview', path: '/authority', icon: LayoutDashboard, exact: true, badge: null },
        { name: 'AI Risk Smart System', path: '/authority/risk-intel', icon: Cpu, badge: 'SURGE' },
        { name: 'AI Repair Priority', path: '/authority/priority', icon: AlertOctagon, badge: 'P1 (07)' },
        { name: 'Complaints Priority Check', path: '/authority/complaints', icon: ClipboardList, badge: '14 New' },
        { name: 'Road Health Analytics', path: '/authority/road-health', icon: Activity, badge: null },
        { name: 'AI Copilot Assistant', path: '/authority/copilot', icon: Bot, badge: 'ONLINE' },
      ],
    },
    {
      label: 'OPERATIONS & EMERGENCY',
      items: [
        { name: 'Emergency Response Ops', path: '/authority/emergency-ops', icon: Radio, badge: '3 ACTIVE', highlight: true },
        { name: 'Emergency Routes', path: '/authority/emergency-routes', icon: Navigation, badge: null },
        { name: 'Incident Simulation', path: '/authority/simulation', icon: FlaskConical, badge: null },
        { name: 'Global Risk Map', path: '/authority/global-map', icon: Globe2, badge: null },
        { name: 'System Alerts', path: '/authority/alerts', icon: Bell, badge: '4' },
      ],
    },
    {
      label: 'FIELD OPERATIONS',
      items: [
        { name: 'Maintenance Command', path: '/authority/maintenance-command', icon: Wrench, badge: '42 Orders' },
        { name: 'Field Teams', path: '/authority/field-teams', icon: Truck, badge: '16 Live' },
        { name: 'Work Orders System', path: '/authority/work-orders', icon: FileCheck2, badge: null },
        { name: 'Field Worker Mobile App', path: '/authority/field-app', icon: Smartphone, badge: 'SQUAD' },
      ],
    },
    {
      label: 'INTELLIGENCE',
      items: [
        { name: 'Predictive Maintenance', path: '/authority/predictive', icon: TrendingUp, badge: '90d Curve' },
        { name: 'RoadGuard Smart System Loop', path: '/authority/smart system-loop', icon: Sparkles, badge: 'ECOSYSTEM' },
      ],
    },
  ];

  return (
    <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-64 xl:w-72 bg-[#0a0e17]/95 backdrop-blur-2xl border-r border-slate-800/80 z-40 flex-col justify-between">
      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-700">
        {/* Brand Watermark / Sub-header */}
        <div className="px-3 pb-2 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00e3fd] animate-pulse"></span>
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#00e3fd]">
              PRAHARI NETWORK v4.8
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-700">
            NHAI / PWD
          </span>
        </div>

        {navigationGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              {group.label}
            </div>

            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-blue-600/20 text-[#b3c5ff] font-semibold border-l-2 border-[#00e3fd] shadow-[0_0_15px_rgba(0,227,253,0.12)]'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    } ${item.highlight ? 'bg-red-950/20 text-red-300 border border-red-500/20' : ''}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`w-4 h-4 flex-shrink-0 transition-colors ${
                            isActive
                              ? 'text-[#00e3fd]'
                              : item.highlight
                              ? 'text-red-400'
                              : 'text-slate-400 group-hover:text-slate-200'
                          }`}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`ml-2 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                            item.highlight || item.badge.includes('P1') || item.badge.includes('ACTIVE')
                              ? 'bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse'
                              : item.badge === 'ONLINE' || item.badge === 'ECOSYSTEM'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : 'bg-slate-800 text-slate-300 border border-slate-700'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Profile Pod */}
      <div className="p-3 border-t border-slate-800 bg-[#080d17] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-[#001738] font-black text-xs shadow-[0_0_12px_rgba(0,227,253,0.3)]">
            NS
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">N. Srivastava</div>
            <div className="text-[10px] font-mono text-cyan-400 truncate flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-cyan-400 inline" />
              Authority Lead · PWD / NHAI
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/authority/copilot')}
          title="Open AI Copilot"
          className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-cyan-400 hover:text-white transition-colors border border-slate-700"
        >
          <Bot className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
