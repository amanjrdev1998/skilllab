"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CourseList from "@/components/CourseList";
import DashboardLayout from "@/components/DashboardLayout";

type User = { id: number; name: string; email: string; role?: string };

export default function UserCoursePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.replace("/user");
      return;
    }

    try {
      const parsedUser: User = JSON.parse(userData);
      if (!parsedUser.id || !parsedUser.name || !parsedUser.email) {
        throw new Error("Invalid user data");
      }
      const timeoutId = window.setTimeout(() => setUser(parsedUser), 0);
      return () => window.clearTimeout(timeoutId);
    } catch (error) {
      console.error("Failed to load user session:", error);
      router.replace("/user");
    }
  }, [router]);

  if (!user) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50"><div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-100 border-t-indigo-600" /></div>;
  }

  return (
    <DashboardLayout user={user}>
      <CourseList userName={user.name} />
    </DashboardLayout>
  );
}
