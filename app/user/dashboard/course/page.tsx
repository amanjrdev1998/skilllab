"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CourseList from "@/components/CourseList";
import DashboardLayout from "@/components/DashboardLayout";

type User = { name: string; email: string };

export default function UserCoursePage() {
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

  return (
    <DashboardLayout user={user}>
      <CourseList userName={user.name} />
    </DashboardLayout>
  );
}
