"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import UserCalendar from "@/components/UserCalendar";
import { readAuthenticatedUser, type AuthenticatedUser } from "@/lib/auth";

export default function UserCalendarPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthenticatedUser | null>(null);

  useEffect(() => {
    const authenticatedUser = readAuthenticatedUser();
    if (!authenticatedUser) {
      router.replace("/user");
      return;
    }

    const timeoutId = window.setTimeout(() => setUser(authenticatedUser), 0);
    return () => window.clearTimeout(timeoutId);
  }, [router]);

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
