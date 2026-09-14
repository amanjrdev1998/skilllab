'use client';

import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';

interface AdminSidebarProps {
  user: { name: string; email: string };
  onLogout: () => void;
}

const menuItems = [
  { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Students', href: '/admin/student', icon: Users },
  { label: 'Courses', href: '/admin/course', icon: BookOpen },
  { label: 'Analytics', href: '/admin/dashboard/analytics', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminSidebar({ user, onLogout }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-800 bg-[#111827] text-white">
      <div className="flex h-20 items-center gap-3 border-b border-slate-800 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 shadow-lg shadow-orange-500/20">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <p className="text-base font-black tracking-tight">SkillLab</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300">Admin console</p>
        </div>
      </div>

      <div className="border-b border-slate-800 px-5 py-5">
        <button type="button" className="flex w-full items-center gap-3 rounded-xl bg-slate-800/70 p-3 text-left transition hover:bg-slate-800">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-sm font-black">{user.name.charAt(0).toUpperCase()}</div>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold">{user.name}</p><p className="truncate text-xs text-slate-400">Administrator</p></div>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </button>
      </div>

      <nav className="flex-1 px-4 py-6">
        <p className="px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Workspace</p>
        <div className="mt-3 space-y-1">
          {menuItems.map(({ label, href, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href));
            return (
              <button
                key={label}
                type="button"
                onClick={() => router.push(href)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold transition ${active ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {label}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-slate-800 p-4">
        <button type="button" onClick={onLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-bold text-slate-400 transition hover:bg-red-500/10 hover:text-red-300">
          <LogOut className="h-[18px] w-[18px]" /> Sign out
        </button>
      </div>
    </aside>
  );
}