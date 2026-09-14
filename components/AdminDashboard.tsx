"use client";

import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  MoreHorizontal,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";

const stats = [
  { label: "Total students", value: "12,480", change: "+12.8%", icon: Users, tone: "bg-orange-50 text-orange-600" },
  { label: "Active courses", value: "38", change: "+4.2%", icon: BookOpen, tone: "bg-indigo-50 text-indigo-600" },
  { label: "Monthly revenue", value: "₹8.42L", change: "+18.6%", icon: TrendingUp, tone: "bg-emerald-50 text-emerald-600" },
  { label: "Completion rate", value: "74.6%", change: "+6.4%", icon: CheckCircle2, tone: "bg-sky-50 text-sky-600" },
];

const activity = [
  { name: "Ananya Sharma", action: "completed Facebook Ads Mastery", time: "8 min ago", initials: "AS", tone: "bg-orange-100 text-orange-700" },
  { name: "Rohan Mehta", action: "enrolled in AI Automation", time: "24 min ago", initials: "RM", tone: "bg-indigo-100 text-indigo-700" },
  { name: "Priya Nair", action: "submitted a course review", time: "1 hr ago", initials: "PN", tone: "bg-emerald-100 text-emerald-700" },
  { name: "Kabir Singh", action: "requested a refund", time: "2 hrs ago", initials: "KS", tone: "bg-sky-100 text-sky-700" },
];

const courses = [
  { name: "Facebook Ads Mastery", students: "2,840 students", revenue: "₹2.16L", progress: 82, color: "bg-orange-500" },
  { name: "AI Automation", students: "1,920 students", revenue: "₹1.74L", progress: 64, color: "bg-indigo-500" },
  { name: "Content Creation Pro", students: "1,384 students", revenue: "₹1.18L", progress: 48, color: "bg-emerald-500" },
];

export default function AdminDashboard() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col justify-between gap-5 rounded-2xl bg-gradient-to-br from-[#101827] via-[#19233b] to-[#334155] p-6 text-white shadow-lg sm:flex-row sm:items-end sm:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">Admin overview</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Good morning, Admin.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Here is what is happening across SkillLab today.</p>
        </div>
        <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-400">
          <Plus className="h-4 w-4" /> Add course
        </button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, change, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p><p className="mt-3 text-2xl font-black text-slate-950">{value}</p></div>
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></div>
            </div>
            <p className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600"><ArrowUpRight className="h-3.5 w-3.5" /> {change} <span className="font-medium text-slate-400">vs last month</span></p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Performance</p><h2 className="mt-1 text-2xl font-black text-slate-950">Course health</h2></div><button type="button" aria-label="Course health options" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><MoreHorizontal className="h-5 w-5" /></button></div>
          <div className="mt-6 space-y-5">
            {courses.map((course) => (
              <div key={course.name}>
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center"><div><p className="text-sm font-bold text-slate-900">{course.name}</p><p className="mt-1 text-xs text-slate-500">{course.students}</p></div><div className="flex items-center gap-4 text-xs"><span className="font-bold text-slate-700">{course.revenue}</span><span className="font-bold text-slate-400">{course.progress}%</span></div></div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${course.color}`} style={{ width: `${course.progress}%` }} /></div>
              </div>
            ))}
          </div>
          <button type="button" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-indigo-600 transition hover:text-indigo-800">View all courses <ArrowUpRight className="h-4 w-4" /></button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Live feed</p><h2 className="mt-1 text-2xl font-black text-slate-950">Recent activity</h2></div><Clock3 className="h-5 w-5 text-slate-400" /></div>
          <div className="mt-6 divide-y divide-slate-100">
            {activity.map((item) => (
              <div key={`${item.name}-${item.time}`} className="flex gap-3 py-4 first:pt-0 last:pb-0"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black ${item.tone}`}>{item.initials}</div><div className="min-w-0"><p className="text-sm leading-5 text-slate-700"><span className="font-bold text-slate-950">{item.name}</span> {item.action}</p><p className="mt-1 text-xs font-medium text-slate-400">{item.time}</p></div></div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}