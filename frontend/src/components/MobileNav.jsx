import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, Utensils, BookOpen, User } from 'lucide-react';

const MobileNav = () => {
  const location = useLocation();
  const path = location.pathname;

  // Don't show on public pages
  if (['/', '/login', '/signup', '/setup'].includes(path)) return null;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-lg border-t border-white/10 z-50 pb-safe">
      <div className="flex justify-around items-center p-3">
        
        <NavItem to="/dashboard" icon={<LayoutDashboard size={24} />} active={path === '/dashboard'} label="Home" />
        
        <NavItem to="/workout-plan" icon={<Dumbbell size={24} />} active={path === '/workout-plan'} label="Workout" />
        
        {/* Floating Action Button (Center) */}
        <Link to="/log" className="relative -top-5">
          <div className="w-14 h-14 rounded-full bg-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.5)] flex items-center justify-center border-4 border-slate-900 text-slate-900">
             <div className="w-6 h-6 bg-slate-900 rounded-sm transform rotate-45" /> {/* Plus Icon Fake */}
             <div className="absolute w-1 h-6 bg-slate-900 rounded-full" />
             <div className="absolute w-6 h-1 bg-slate-900 rounded-full" />
          </div>
        </Link>

        <NavItem to="/nutrition" icon={<Utensils size={24} />} active={path === '/nutrition'} label="Diet" />
        
        <NavItem to="/library" icon={<BookOpen size={24} />} active={path === '/library'} label="Wiki" />
        
      </div>
    </div>
  );
};

const NavItem = ({ to, icon, active, label }) => (
  <Link to={to} className={`flex flex-col items-center gap-1 transition ${active ? 'text-teal-400' : 'text-slate-500'}`}>
    {icon}
    <span className="text-[10px] font-bold">{label}</span>
  </Link>
);

export default MobileNav;