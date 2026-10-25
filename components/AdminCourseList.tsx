"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, Search } from "lucide-react";
import { AdminCourse, loadAdminDashboard } from "@/lib/admin";
import { formatUsd } from "@/lib/currency";

export default function AdminCourseList() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      await Promise.resolve();
      const token = localStorage.getItem("token");
      if (!token) {
        if (!cancelled) {
          setError("Please sign in as an administrator to view courses.");
          setIsLoading(false);
        }
        return;
      }

      try {
        const data = await loadAdminDashboard(token);
        if (!cancelled) {
          setCourses(data.courses);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load courses.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCourses = useMemo(() => {
    const search = query.trim().toLowerCase();
    return courses.filter((course) =>
      `${course.title} ${course.category}`.toLowerCase().includes(search),
    );
  }, [courses, query]);

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />
      </div>
    );
  }

  if (error) {
    return <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">{error}</div>;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Content management</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Published courses</h1>
          <p className="mt-2 text-sm text-slate-500">Only courses with published status are listed here.</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <h2 className="text-lg font-black text-slate-950">Course catalog</h2>
            <p className="mt-1 text-sm text-slate-500">{filteredCourses.length} published courses</p>
          </div>
          <label className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 sm:max-w-xs">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses" className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr><th className="px-5 py-3">Course</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Lessons</th><th className="px-5 py-3">Students</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCourses.map((course) => (
                <tr key={course.id}>
                  <td className="px-5 py-4 font-bold text-slate-900"><span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4 text-orange-500" />{course.title}</span></td>
                  <td className="px-5 py-4 text-slate-600">{course.category}</td>
                  <td className="px-5 py-4 text-slate-600">{course.lessons_count}</td>
                  <td className="px-5 py-4 text-slate-600">{course.students_count}</td>
                  <td className="px-5 py-4 font-semibold text-slate-800">{formatUsd(course.price)}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold capitalize text-emerald-700">{course.status}</span></td>
                </tr>
              ))}
              {filteredCourses.length === 0 && <tr><td colSpan={6} className="px-5 py-14 text-center text-slate-500">No published courses found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
