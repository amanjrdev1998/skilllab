"use client";

import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  Flame,
  PlayCircle,
  Share2,
  Target,
  Trophy,
  X,
} from "lucide-react";
import Link from "next/link";

type User = { name: string; email: string };

type Course = {
  id: number;
  title: string;
  price: string;
  progress: number;
  lessons: string;
  color: string;
};

const courses: Course[] = [
  { id: 1, title: "Facebook Ads Mastery", price: "₹2,999", progress: 72, lessons: "23 of 32 lessons", color: "bg-indigo-600" },
  { id: 3, title: "AI Automation", price: "₹3,999", progress: 38, lessons: "15 of 40 lessons", color: "bg-cyan-600" },
];

const stats = [
  { label: "Courses enrolled", value: "4", icon: BookOpen, tone: "text-indigo-600 bg-indigo-50" },
  { label: "Lessons completed", value: "38", icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
  { label: "Learning hours", value: "24.5", icon: Clock3, tone: "text-orange-600 bg-orange-50" },
  { label: "Current streak", value: "7 days", icon: Trophy, tone: "text-cyan-600 bg-cyan-50" },
];

export default function UserDashboard({ user }: { user: User }) {
  const [pdfOpen, setPdfOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const handlePdfFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = URL.createObjectURL(file);
    setPdfUrl(objectUrlRef.current);
  };

  const openPdfReader = () => {
    setPdfOpen(true);
    setShareMessage("");
  };

  const shareCourse = async (course: Course) => {
    const shareData = {
      title: course.title,
      text: `Continue learning ${course.title} on SkillLab.`,
      url: `${window.location.origin}/product-details?id=${course.id}`,
    };

    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(shareData.url);
    setShareMessage("Course link copied");
    window.setTimeout(() => setShareMessage(""), 2500);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="overflow-hidden rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-indigo-800 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Student dashboard</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Keep your momentum, {user.name}.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100">You are making steady progress. Pick up where you left off and finish one lesson today.</p>
          </div>
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10"><Flame className="h-10 w-10 text-orange-300" /></div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></div>
            <div><p className="text-2xl font-black text-slate-950">{value}</p><p className="text-xs font-medium text-slate-500">{label}</p></div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Continue learning</p><h2 className="mt-1 text-2xl font-black text-slate-950">Your courses</h2></div><Link href="/#courses" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Browse courses</Link></div>
          <div className="mt-6 space-y-5">
            {courses.map((course) => (
              <div key={course.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div><h3 className="font-bold text-slate-950">{course.title}</h3><p className="mt-1 text-xs text-slate-500">{course.lessons}</p></div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={`/product-details?id=${course.id}&title=${encodeURIComponent(course.title)}&price=${encodeURIComponent(course.price)}`} className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-indigo-600"><PlayCircle className="h-4 w-4" /> View Course</Link>
                    <button type="button" onClick={() => shareCourse(course)} aria-label={`Share ${course.title}`} className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2.5 text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600"><Share2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${course.color}`} style={{ width: `${course.progress}%` }} /></div><span className="text-xs font-bold text-slate-600">{course.progress}%</span></div>
              </div>
            ))}
          </div>
          {shareMessage && <p className="mt-4 text-right text-xs font-bold text-emerald-600">{shareMessage}</p>}
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Target className="h-5 w-5" /></div><h2 className="mt-5 text-xl font-black text-slate-950">Weekly goal</h2><p className="mt-2 text-sm leading-6 text-slate-500">Complete 5 lessons this week to keep your streak alive.</p><div className="mt-6 flex items-end justify-between"><span className="text-3xl font-black text-slate-950">3/5</span><span className="text-xs font-bold text-emerald-600">60% complete</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-3/5 rounded-full bg-orange-500" /></div><p className="mt-4 text-xs font-medium text-slate-500">2 lessons left this week</p></aside>
      </section>

      <section className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Study resources</p><h2 className="mt-1 text-xl font-black text-slate-950">Read your course PDF</h2><p className="mt-2 text-sm text-slate-500">Open a local PDF or paste a public PDF link in the reader.</p></div>
        <button type="button" onClick={openPdfReader} className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"><FileText className="h-4 w-4" /> Open PDF Reader</button>
      </section>

      {pdfOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="pdf-reader-title">
          <div className="flex h-[min(760px,calc(100vh-2rem))] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Study resource</p><h2 id="pdf-reader-title" className="text-xl font-black text-slate-950">PDF Reader</h2></div><button type="button" onClick={() => setPdfOpen(false)} aria-label="Close PDF reader" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
            <div className="grid gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_auto]"><input type="url" value={pdfUrl} onChange={(event) => setPdfUrl(event.target.value)} placeholder="Paste a public PDF URL" className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /><label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-indigo-400 hover:text-indigo-600"><FileText className="h-4 w-4" /> Choose PDF<input type="file" accept="application/pdf" onChange={handlePdfFile} className="sr-only" /></label></div>
            <div className="min-h-0 flex-1 bg-slate-100 p-3">{pdfUrl ? <iframe src={pdfUrl} title="Course PDF reader" className="h-full w-full rounded-lg border border-slate-200 bg-white" /> : <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white p-8 text-center"><div><FileText className="mx-auto h-12 w-12 text-slate-300" /><p className="mt-4 font-bold text-slate-700">No PDF selected</p><p className="mt-1 text-sm text-slate-500">Choose a PDF file or paste a public URL above.</p></div></div>}</div>
          </div>
        </div>
      )}
    </div>
  );
}
