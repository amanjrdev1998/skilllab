
"use client";

import { useEffect, useRef, useState } from "react";
import {
  Menu,
  Search,
  ShoppingCart,
  X,
  User,
  LayoutDashboard,
  LogOut,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

const courses = [
  "Facebook Ads Mastery",
  "Instagram Ads Growth Lab",
  "AI Automation for Business",
  "Cloud AI Agent Blueprint",
];

interface UserData {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export default function SiteHeader() {
  const router = useRouter();

  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // User session
  const [user, setUser] = useState<UserData | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  const searchResults = courses.filter((course) =>
    course.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // =========================================================
  // CHECK USER SESSION
  // =========================================================

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Invalid user session:", error);
        setUser(null);
      }
    }
  }, []);

  // =========================================================
  // CLOSE USER DROPDOWN WHEN CLICKING OUTSIDE
  // =========================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = async () => {
    setUserMenuOpen(false);

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      return;
    }

    const loadingToast = toast.loading("Logging out...");

    try {
      const token = localStorage.getItem("token");
      const userId = user?.id;

      // =====================================================
      // CALL LOGOUT API
      // =====================================================

      if (userId) {
        const response = await fetch(
          "http://localhost:8000/api/v1/auth/logout",
          {
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
          }
        );

        const data = await response.json();

        console.log("Logout API Response:", data);
      }

      // =====================================================
      // CLEAR SESSION
      // =====================================================

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("user_id");
      localStorage.removeItem("secret_key");
      localStorage.removeItem("expires_at");
      localStorage.removeItem("isAuthenticated");

      setUser(null);

      toast.dismiss(loadingToast);

      // =====================================================
      // SUCCESS TOAST
      // =====================================================

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5`}
          >
            <div className="p-4">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-6 w-6 text-green-600"
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

                {/* Message */}
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">
                    Logout Successful
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    You have been logged out successfully.
                  </p>
                </div>

                {/* Close */}
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="text-slate-400 transition hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Progress */}
            <div className="h-1 w-full bg-green-500 animate-[shrink_4s_linear_forwards]" />
          </div>
        ),
        {
          duration: 4000,
        }
      );

      router.push("/user");
    } catch (error) {
      console.error("Logout API Error:", error);

      toast.dismiss(loadingToast);

      // Clear local session anyway
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("user_id");
      localStorage.removeItem("secret_key");
      localStorage.removeItem("expires_at");
      localStorage.removeItem("isAuthenticated");

      setUser(null);

      toast.error("Logout failed. Please try again.");

      router.push("/user");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">

          {/* =================================================
              LOGO
          ================================================= */}

          <a
            href="/"
            className="text-2xl font-black tracking-[-0.07em] text-zinc-950"
          >
            SKILL<span className="text-indigo-600">LAB.</span>
          </a>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================= */}

          <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">
            <a
              href="/"
              className="transition hover:text-indigo-600"
            >
              Home
            </a>

            <a
              href="/#courses"
              className="transition hover:text-indigo-600"
            >
              Courses
            </a>

            <a
              href="/#why-us"
              className="transition hover:text-indigo-600"
            >
              Why Us
            </a>

            <a
              href="/#process"
              className="transition hover:text-indigo-600"
            >
              How It Works
            </a>

            <a
              href="/#reviews"
              className="transition hover:text-indigo-600"
            >
              Reviews
            </a>

            <a
              href="/#faq"
              className="transition hover:text-indigo-600"
            >
              FAQ
            </a>
          </nav>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div className="flex items-center gap-2 sm:gap-3">

            {/* Search */}
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search courses"
              className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 transition hover:bg-zinc-100 hover:text-indigo-600"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Cart */}
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label="Open course cart"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-950 text-white transition hover:bg-indigo-600"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>

            {/* =================================================
                USER SESSION MENU
            ================================================= */}

            {user ? (
              <div
                ref={userMenuRef}
                className="relative hidden sm:block"
              >
                {/* User Button */}
                <button
                  type="button"
                  onClick={() =>
                    setUserMenuOpen((open) => !open)
                  }
                  className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white p-1.5 pr-3 shadow-sm transition hover:border-indigo-300 hover:shadow-md"
                >
                  {/* User Icon */}
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
                    <User className="h-5 w-5" />
                  </div>

                  {/* Name */}
                  <div className="hidden text-left md:block">
                    <p className="max-w-[100px] truncate text-sm font-bold text-zinc-900">
                      {user.name}
                    </p>
                  </div>

                  <ChevronDown
                    className={`h-4 w-4 text-zinc-500 transition-transform ${
                      userMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* =================================================
                    DROPDOWN
                ================================================= */}

                {userMenuOpen && (
                  <div className="absolute right-0 top-full z-[70] mt-3 w-64 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl">

                    {/* User Info */}
                    <div className="border-b border-zinc-100 bg-zinc-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
                          <User className="h-5 w-5" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-zinc-900">
                            {user.name}
                          </p>

                          <p className="truncate text-xs text-zinc-500">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="p-2">

                      {/* Dashboard */}
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          router.push("/user/dashboard");
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-zinc-700 transition hover:bg-indigo-50 hover:text-indigo-600"
                      >
                        <LayoutDashboard className="h-5 w-5" />
                        Dashboard
                      </button>

                      {/* Buy Course */}
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          router.push("/#courses");
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-zinc-700 transition hover:bg-purple-50 hover:text-purple-600"
                      >
                        <BookOpen className="h-5 w-5" />
                        Buy Course
                      </button>

                      {/* Divider */}
                      <div className="my-2 border-t border-zinc-100" />

                      {/* Logout */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <LogOut className="h-5 w-5" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* =================================================
                 LOGIN
              ================================================= */

              <a
                href="/user"
                className="hidden rounded-full px-4 py-2.5 text-sm font-semibold transition hover:bg-zinc-100 sm:inline-flex"
              >
                Login/Register
              </a>
            )}

            {/* Start Learning */}
            <a
              href="/#courses"
              className="hidden rounded-full bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-indigo-600 md:inline-flex"
            >
              Start Learning
            </a>

            {/* Mobile Menu */}
            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen((open) => !open)
              }
              aria-label={
                mobileMenuOpen
                  ? "Close menu"
                  : "Open menu"
              }
              className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-700 transition hover:bg-zinc-100 lg:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* =====================================================
            MOBILE MENU
        ===================================================== */}

        {mobileMenuOpen && (
          <nav className="border-t border-zinc-200 bg-white px-5 py-5 lg:hidden">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm font-semibold">

              <a
                href="/"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </a>

              <a
                href="/#courses"
                onClick={() => setMobileMenuOpen(false)}
              >
                Courses
              </a>

              <a
                href="/#why-us"
                onClick={() => setMobileMenuOpen(false)}
              >
                Why Us
              </a>

              <a
                href="/#process"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>

              <a
                href="/#reviews"
                onClick={() => setMobileMenuOpen(false)}
              >
                Reviews
              </a>

              <a
                href="/#faq"
                onClick={() => setMobileMenuOpen(false)}
              >
                FAQ
              </a>

              <div className="border-t border-zinc-200 pt-4">

                {user ? (
                  <div className="space-y-2">

                    {/* Mobile User */}
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
                        <User className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="font-bold text-zinc-900">
                          {user.name}
                        </p>

                        <p className="text-xs text-zinc-500">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Dashboard */}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        router.push("/user/dashboard");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-indigo-600 hover:bg-indigo-50"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      Dashboard
                    </button>

                    {/* Buy Course */}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        router.push("/#courses");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-purple-600 hover:bg-purple-50"
                    >
                      <BookOpen className="h-5 w-5" />
                      Buy Course
                    </button>

                    {/* Logout */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-red-500 hover:bg-red-50"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <a
                    href="/user"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-indigo-600"
                  >
                    Login / Register
                  </a>
                )}
              </div>
            </div>
          </nav>
        )}
      </header>

      {/* =======================================================
          SEARCH MODAL
      ======================================================= */}

      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] bg-slate-950/40 p-4 backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="mx-auto mt-20 max-w-xl rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <Search className="h-5 w-5 text-slate-400" />

              <input
                autoFocus
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Search courses..."
                className="min-w-0 flex-1 text-base text-slate-900 outline-none"
              />

              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 border-t border-slate-200 pt-4">
              {searchResults.length > 0 ? (
                searchResults.map((course) => (
                  <a
                    key={course}
                    href="/#courses"
                    onClick={() => setSearchOpen(false)}
                    className="block rounded-lg px-3 py-3 font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    {course}
                  </a>
                ))
              ) : (
                <p className="px-3 py-3 text-sm text-slate-500">
                  No courses found.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          CART
      ======================================================= */}

      {cartOpen && (
        <div
          className="fixed inset-0 z-[60] bg-slate-950/40 p-4 backdrop-blur-sm"
          onClick={() => setCartOpen(false)}
        >
          <div
            className="ml-auto flex h-full max-w-sm flex-col rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-xl font-black text-slate-900">
                Course Cart
              </h2>

              <button
                type="button"
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <ShoppingCart className="h-14 w-14 text-slate-300" />

              <p className="mt-4 font-semibold text-slate-700">
                Your course cart is empty
              </p>

              <a
                href="/#courses"
                onClick={() => setCartOpen(false)}
                className="mt-5 rounded-lg bg-slate-900 px-5 py-3 text-sm font-bold text-white"
              >
                Browse Courses
              </a>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          TOAST ANIMATIONS
      ======================================================= */}

      <style jsx global>{`
        @keyframes enter {
          from {
            transform: translateX(100%);
            opacity: 0;
          }

          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes leave {
          from {
            transform: translateX(0);
            opacity: 1;
          }

          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        @keyframes shrink {
          from {
            width: 100%;
          }

          to {
            width: 0%;
          }
        }

        .animate-enter {
          animation: enter 0.3s ease-out;
        }

        .animate-leave {
          animation: leave 0.3s ease-in;
        }
      `}</style>
    </>
  );
}

