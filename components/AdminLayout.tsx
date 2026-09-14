'use client';

import { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, LogOut, Menu, Search, X } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: ReactNode;
  user: { name: string; email: string };
}

export default function AdminLayout({ children, user }: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userData');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-950 lg:flex">
      {mobileMenuOpen && <div className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" onClick={() => setMobileMenuOpen(false)} />}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transition-transform lg:hidden ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col bg-[#111827]">
          <div className="flex justify-end p-4"><button type="button" onClick={() => setMobileMenuOpen(false)} aria-label="Close admin menu" className="text-slate-400"><X className="h-5 w-5" /></button></div>
          <AdminSidebar user={user} onLogout={handleLogout} />
        </div>
      </div>
      <div className="hidden lg:flex">
        <AdminSidebar user={user} onLogout={handleLogout} />
      </div>

      <div className="min-w-0 flex-1">
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
          <button type="button" onClick={() => setMobileMenuOpen(true)} aria-label="Open admin menu" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"><Menu className="h-5 w-5" /></button>
          <div className="hidden items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 md:flex md:w-80"><Search className="h-4 w-4 text-slate-400" /><input aria-label="Search admin dashboard" placeholder="Search workspace" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" /></div>
          <div className="ml-auto flex items-center gap-3 sm:gap-4"><button type="button" aria-label="View notifications" className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Bell className="h-5 w-5" /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-orange-500" /></button><div className="hidden h-8 w-px bg-slate-200 sm:block" /><p className="hidden text-sm font-bold text-slate-700 sm:block">Operations team</p><button type="button" onClick={handleLogout} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:text-sm"><LogOut className="h-4 w-4" /><span className="hidden sm:inline">Logout</span></button></div>
        </header>
        <main className="p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}