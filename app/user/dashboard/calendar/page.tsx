"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import UserCalendar from "@/components/UserCalendar";

type User = { name: string; email: string };

export default function UserCalendarPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const userData = localStorage.getItem("userData");

    // if (!isAuthenticated) {
    //   router.push("/user");
    //   return;
    // }

    const timeoutId = window.setTimeout(() => {
      setUser(userData ? JSON.parse(userData) : { name: "Learner", email: "learner@example.com" });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [router]);

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50"><div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" /></div>;
  }

  return <DashboardLayout user={user}><UserCalendar /></DashboardLayout>;
}
