'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Scissors, Calendar, Users, Settings, BarChart3, LogOut, Sparkles, Home, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSupabaseClient } from '@/lib/supabase';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin#calendar', label: 'Calendar', icon: Calendar },
  { href: '/admin#services', label: 'Services', icon: Sparkles },
  { href: '/admin#staff', label: 'Staff', icon: Users },
  { href: '/admin#analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin#settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onClose?: () => void;
}

export default function Sidebar({ activeSection, onSectionChange, onClose }: SidebarProps) {
  const handleLogout = async () => {
    await getSupabaseClient().auth.signOut();
    window.location.href = '/admin/login';
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col fixed left-0 top-0 shadow-lg lg:shadow-none">
      {/* Logo */}
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
            <Scissors className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900">SalonBooker</span>
        </Link>
        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const section = item.href.split('#')[1] || 'dashboard';
          const isActive = activeSection === section;

          return (
            <button
              key={item.label}
              onClick={() => onSectionChange(section)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200',
                isActive
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
