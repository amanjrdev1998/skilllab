"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  BarChart3,
  FileText,
  Calendar,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  Package,
  HelpCircle,
  Loader2,
  Globe,
} from "lucide-react";
import toast from "react-hot-toast";

interface SidebarProps {
  user: { id: number; name: string; email: string; role?: string };
  onLogout?: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({
  user,
  onLogout,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // 🔧 Change this to your website URL
  const SITE_URL = "http://localhost:3000/";

  const dashboardBase = pathname.startsWith("/user/")
    ? "/user/dashboard"
    : pathname.startsWith("/admin/")
      ? "/admin/dashboard"
      : "/dashboard";

  const menuSections = [
    {
      title: "Main",
      items: [
        { icon: LayoutDashboard, label: "Dashboard", href: dashboardBase },
        {
          icon: BarChart3,
          label: "Analytics",
          href: `${dashboardBase}/analytics`,
        },
        { icon: FileText, label: "Course", href: `${dashboardBase}/course` },
      ],
    },
    {
      title: "Management",
      items: [
        { icon: Users, label: "Users", href: `${dashboardBase}/users` },
        { icon: Package, label: "Products", href: `${dashboardBase}/products` },
      ],
    },
    {
      title: "Other",
      items: [
        {
          icon: Calendar,
          label: "Calendar",
          href: `${dashboardBase}/calendar`,
        },
        {
          icon: Settings,
          label: "Settings",
          href: `${dashboardBase}/settings`,
        },
        { icon: HelpCircle, label: "Help", href: `${dashboardBase}/help` },
      ],
    },
  ];

  const isActive = (href: string) => {
    if (href === dashboardBase) {
      return pathname === dashboardBase;
    }
    return pathname.startsWith(href);
  };

  // Logout function - send user_id to API
  const handleLogout = async () => {
    // ✅ FIXED: SweetAlert now properly blocks execution until user responds
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
    });

    if (!result.isConfirmed) return;

    setIsLoggingOut(true);

    const loadingToast = toast.loading("Logging out...");

    try {
      // Get authentication data
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      const expiresAt = localStorage.getItem("expires_at");

      // User ID comes from Sidebar user prop
      const userId = user?.id;

      console.log("Logout - Token:", token);
      console.log("Logout - User Data:", userData);
      console.log("Logout - User ID:", userId);
      console.log("Logout - Expires At:", expiresAt);

      // Check user ID
      if (!userId) {
        toast.dismiss(loadingToast);
        toast.error("No active session found.");

        // Clear localStorage
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("user_id");
        localStorage.removeItem("secret_key");
        localStorage.removeItem("expires_at");
        localStorage.removeItem("isAuthenticated");

        router.push("/user");

        return;
      }

      // Send logout request
      const response = await fetch("http://localhost:8000/api/v1/auth/logout", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          ...(token && {
            Authorization: `Bearer ${token}`,
          }),
        },

        body: JSON.stringify({
          user_id: userId,
        }),
      });

      const data = await response.json();

      console.log("Logout API Response:", data);

      toast.dismiss(loadingToast);

      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("user_id");
      localStorage.removeItem("secret_key");
      localStorage.removeItem("expires_at");
      localStorage.removeItem("isAuthenticated");

      if (response.ok && data.success) {
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-sm w-full bg-white shadow-2xl rounded-2xl pointer-events-auto ring-1 ring-black/5 overflow-hidden`}
          >
            <div className="p-4">
              <div className="flex items-start gap-4">
                {/* Success Icon */}
                <div className="flex-shrink-0">
                  <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Message */}
                <div className="flex-1 pt-0.5">
                  <p className="text-sm font-bold text-slate-900">
                    Logout Successful
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {data.message || "You have been logged out successfully."}
                  </p>
                </div>

                {/* Close */}
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-green-500 animate-[shrink_4s_linear_forwards]" />
          </div>
        ));
      } else {
        toast.custom((t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-sm w-full bg-white shadow-2xl rounded-2xl pointer-events-auto ring-1 ring-black/5 overflow-hidden`}
          >
            <div className="p-4">
              <div className="flex items-start gap-4">
                {/* Success Icon */}
                <div className="flex-shrink-0">
                  <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                </div>

                {/* Message */}
                <div className="flex-1 pt-0.5">
                  <p className="text-sm font-bold text-slate-900">
                    Logout Successful
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {data.message || "You have been logged out successfully."}
                  </p>
                </div>

                {/* Close */}
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="text-slate-400 hover:text-slate-600 transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-green-500 animate-[shrink_4s_linear_forwards]" />
          </div>
        ));
      }

      // Parent callback
      if (onLogout) {
        onLogout();
      }

      // Redirect
      router.push("/user");
    } catch (error) {
      console.error("❌ Logout API Error:", error);

      toast.dismiss(loadingToast);

      if (error instanceof TypeError) {
        console.error("Possible CORS / Network Error");
      }

      // Clear local session
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("user_id");
      localStorage.removeItem("secret_key");
      localStorage.removeItem("expires_at");
      localStorage.removeItem("isAuthenticated");

      toast.error("Logout API failed. Check browser console.");

      router.push("/user");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar top-0 left-0 z-50 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 ease-in-out border-r border-slate-700/50 flex flex-col ${
          isCollapsed ? "w-20" : "w-72"
        } lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  SkillLab
                </h1>
                <p className="text-xs text-slate-400">v2.0</p>
              </div>
            </div>
          )}
          {isCollapsed && (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
              <Home className="w-6 h-6" />
            </div>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`hidden lg:flex p-2 rounded-lg hover:bg-slate-700/50 transition-all duration-200 hover:scale-110 ${
              isCollapsed ? "mx-auto" : ""
            }`}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-slate-400" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
          {menuSections.map((section) => (
            <div key={section.title}>
              {!isCollapsed && (
                <h3 className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      router.push(item.href);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                      isActive(item.href)
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                        : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                    } ${isCollapsed ? "justify-center" : ""}`}
                  >
                    <item.icon
                      className={`w-5 h-5 ${
                        isActive(item.href)
                          ? "text-white"
                          : "text-slate-400 group-hover:text-white"
                      }`}
                    />
                    {!isCollapsed && (
                      <span className="font-medium">{item.label}</span>
                    )}
                    {isActive(item.href) && !isCollapsed && (
                      <div className="absolute right-2 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    )}
                    {/* Tooltip for collapsed mode */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {item.label}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/30">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user?.email || "user@example.com"}
                  </p>
                  {user?.role && (
                    <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                      {user.role}
                    </span>
                  )}
                </div>
              </div>

              {/* 🌐 NEW: Visit Website Button (expanded) */}
              <a
                href={SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 border bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white border-blue-500/20 hover:border-blue-500"
              >
                <Globe className="w-4 h-4" />
                <span className="font-medium">Visit Website</span>
              </a>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl transition-all duration-200 border ${
                  isLoggingOut
                    ? "bg-slate-700/50 text-slate-400 border-slate-600/50 cursor-not-allowed"
                    : "bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border-red-500/20 hover:border-red-500"
                }`}
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="font-medium">Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Logout</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold mx-auto shadow-lg shadow-purple-500/30">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              {/* 🌐 NEW: Visit Website Button (collapsed) */}
              <a
                href={SITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center p-2 rounded-xl transition-all duration-200 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white"
                title="Visit Website"
              >
                <Globe className="w-5 h-5" />
              </a>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={`w-full flex items-center justify-center p-2 rounded-xl transition-all duration-200 ${
                  isLoggingOut
                    ? "bg-slate-700/50 text-slate-400 cursor-not-allowed"
                    : "bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white"
                }`}
                title="Logout"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <LogOut className="w-5 h-5" />
                )}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Custom scrollbar styles */}
      <style jsx global>{`
        .sidebar {
          box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(100, 116, 139, 0.5);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(100, 116, 139, 0.7);
        }
        .sidebar.collapsed {
          width: 80px;
        }
      `}</style>
    </>
  );
}