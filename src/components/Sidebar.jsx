import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Filter, PhoneCall, Building2, Activity, 
  Clock, User, CheckCircle2, LogOut, Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/screening-queue', label: 'Lead Screening Queue', icon: Filter, badge: 'New' },
    { path: '/reminders', label: 'Reminders & Callbacks', icon: Clock },
    { path: '/assigned-leads', label: 'Handed Over Leads', icon: CheckCircle2 },
    { path: '/my-calls', label: 'Daily Calls Tracking', icon: PhoneCall },
    { path: '/branch-distribution', label: 'Branch & Map Engine', icon: Building2 },
    { path: '/performance-analytics', label: 'Tracking & Analytics', icon: Activity },
    { path: '/profile', label: 'My Profile & Incentives', icon: User },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col justify-between p-4 fixed left-0 top-0 bottom-0 z-40 shadow-2xl">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-4 border-b border-slate-800 mb-6">
          <div className="w-10 h-10 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
            <Phone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white">Telecaller Panel</h1>
            <p className="text-[11px] text-amber-400 font-bold uppercase tracking-wider">Lucknow Central Team</p>
          </div>
        </div>

        {/* User Card */}
        <div className="bg-slate-800/60 backdrop-blur rounded-2xl p-3 border border-slate-700/50 mb-6 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-bold text-white text-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'T'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-200 truncate">{user?.name || 'Lucknow Telecaller'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email || 'telecaller@crm.com'}</p>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold bg-amber-400 text-slate-950 rounded-full">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <button
        onClick={logout}
        className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition"
      >
        <LogOut className="w-4 h-4" />
        <span>Logout Session</span>
      </button>
    </aside>
  );
}
