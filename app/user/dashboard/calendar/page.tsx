"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import UserCalendar from "@/components/UserCalendar";

type User = {
  name: string;
  email: string;
};

export default function UserCalendarPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("isAuthenticated");
    const userData = localStorage.getItem("userData");

    // Redirect to login if user is unauthenticated
    // Remove comments below if authentication check is required
    /*
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    */

    setUser(
      userData
        ? JSON.parse(userData)
        : { name: "Learner", email: "learner@example.com" }
    );
  }, [router]);

  // Loading spinner during hydration/auth check
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" />
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <UserCalendar />
    </DashboardLayout>
  );
}