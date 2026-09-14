"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, Check, Copy, Eye, FileText, Gift, X } from "lucide-react";

type Course = {
  id: number;
  title: string;
  category: string;
  lessons: string;
  duration: string;
  price: string;
  pdfUrl?: string;
};

const courses: Course[] = [
  { id: 1, title: "Facebook Ads Mastery", category: "Digital Marketing", lessons: "32 Lessons", duration: "8 Hours", price: "₹2,999" },
  { id: 2, title: "Instagram Ads Mastery", category: "Digital Marketing", lessons: "28 Lessons", duration: "7 Hours", price: "₹2,499" },
  { id: 3, title: "AI Automation", category: "Artificial Intelligence", lessons: "40 Lessons", duration: "12 Hours", price: "₹3,999" },
  { id: 4, title: "Cloud AI Agent Generation", category: "Artificial Intelligence", lessons: "45 Lessons", duration: "15 Hours", price: "₹4,999" },
  { id: 5, title: "Flutter AI App Development Crash Course", category: "Mobile Development", lessons: "24 Lessons", duration: "6 Hours", price: "₹3,499" },
];

const referralCodeFor = (name: string, courseId = 0) => {
  const normalizedName = name.trim().toUpperCase() || "LEARNER";
  let hash = 0;

  for (const character of normalizedName) {
    hash = (hash * 31 + character.charCodeAt(0)) % 10000;
  }

  const uniqueSuffix = ((hash % 1000) * 10 + courseId).toString().padStart(4, "0");
  return `LERN${uniqueSuffix}`;
};

export default function CourseList({ userName = "Learner" }: { userName?: string }) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [referralOpen, setReferralOpen] = useState(false);
  const [referralCopied, setReferralCopied] = useState(false);
  const [copiedCourseId, setCopiedCourseId] = useState<number | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const referralCode = referralCodeFor(userName);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const openReader = (course: Course) => {
    setSelectedCourse(course);
    setPdfUrl(course.pdfUrl ?? "");
  };

  const closeReader = () => {
    setSelectedCourse(null);
    setPdfUrl("");
  };

  const handlePdfFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = URL.createObjectURL(file);
    setPdfUrl(objectUrlRef.current);
  };

  const copyReferralCode = async () => {
    await navigator.clipboard.writeText(referralCode);
    setReferralCopied(true);
    window.setTimeout(() => setReferralCopied(false), 2500);
  };

  const copyCourseReferralCode = async (courseId: number) => {
    await navigator.clipboard.writeText(referralCodeFor(userName, courseId));
    setCopiedCourseId(courseId);
    window.setTimeout(() => setCopiedCourseId(null), 2500);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-indigo-800 p-6 text-white shadow-lg sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Learning library</p>
        <div className="mt-2 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Course List</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100">Review your available courses and open the course PDF when you are ready to study.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3"><button type="button" onClick={() => { setReferralOpen(true); setReferralCopied(false); }} className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-300/30"><Gift className="h-4 w-4" /> Refer &amp; earn</button><div className="flex items-center gap-2 text-sm font-semibold text-indigo-100"><BookOpen className="h-5 w-5" /> {courses.length} courses</div></div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden grid-cols-[1fr_170px_130px_110px_90px] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 md:grid">
          <span>Course</span><span>Access</span><span>Progress</span><span>Amount</span><span className="text-right">View</span>
        </div>
        <div className="divide-y divide-slate-200">
          {courses.map((course) => (
            <div key={course.id} className="grid gap-4 px-5 py-5 md:grid-cols-[1fr_170px_130px_110px_90px] md:items-center md:px-6">
              <div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><BookOpen className="h-5 w-5" /></div><div><h2 className="font-bold text-slate-950">{course.title}</h2><p className="mt-1 text-xs text-slate-500">{course.category} · {course.lessons} · {course.duration}</p><div className="mt-2 flex w-fit items-center gap-1 rounded-md bg-orange-50 py-1 pl-2 pr-1 text-[11px] font-bold tracking-[0.12em] text-orange-700"><span>Referral: {referralCodeFor(userName, course.id)}</span><button type="button" onClick={() => copyCourseReferralCode(course.id)} aria-label={`Copy referral code for ${course.title}`} title="Copy referral code" className="rounded p-1 transition hover:bg-orange-100"><span className="sr-only">Copy referral code</span>{copiedCourseId === course.id ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}</button></div>{copiedCourseId === course.id && <p className="mt-1 text-[11px] font-semibold tracking-normal text-emerald-600">Copied</p>}</div></div>
              <span className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">Pending Approval</span>
              <div><div className="flex items-center justify-between text-xs font-semibold text-slate-500"><span>Not started</span><span>0%</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-full w-0 rounded-full bg-indigo-600" /></div></div>
              <span className="text-lg font-black text-slate-950">{course.price}</span>
              <button type="button" onClick={() => openReader(course)} aria-label={`View PDF for ${course.title}`} title="Open PDF reader" className="inline-flex w-fit items-center justify-center rounded-lg border border-slate-300 p-2.5 text-slate-600 transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 md:ml-auto"><Eye className="h-5 w-5" /></button>
            </div>
          ))}
        </div>
      </section>

      {selectedCourse && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="course-pdf-title">
          <div className="flex h-[min(760px,calc(100vh-2rem))] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Course PDF</p><h2 id="course-pdf-title" className="text-xl font-black text-slate-950">{selectedCourse.title}</h2></div><button type="button" onClick={closeReader} aria-label="Close PDF reader" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
            <div className="grid gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_auto]"><input type="url" value={pdfUrl} onChange={(event) => setPdfUrl(event.target.value)} placeholder="Paste a public PDF URL" className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" /><label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-indigo-400 hover:text-indigo-600"><FileText className="h-4 w-4" /> Choose PDF<input type="file" accept="application/pdf" onChange={handlePdfFile} className="sr-only" /></label></div>
            <div className="min-h-0 flex-1 bg-slate-100 p-3">{pdfUrl ? <iframe src={pdfUrl} title={`${selectedCourse.title} PDF reader`} className="h-full w-full rounded-lg border border-slate-200 bg-white" /> : <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white p-8 text-center"><div><FileText className="mx-auto h-12 w-12 text-slate-300" /><p className="mt-4 font-bold text-slate-700">No PDF selected</p><p className="mt-1 text-sm text-slate-500">Choose a PDF file or paste a public URL above.</p></div></div>}</div>
          </div>
        </div>
      )}

      {referralOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="referral-title">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Share the learning</p><h2 id="referral-title" className="mt-1 text-2xl font-black text-slate-950">Your referral code</h2></div><button type="button" onClick={() => setReferralOpen(false)} aria-label="Close referral dialog" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"><X className="h-5 w-5" /></button></div>
            <div className="p-6"><div className="rounded-xl bg-orange-50 p-5 text-center"><p className="text-sm text-slate-600">Invite a friend to SkillLab with</p><p className="mt-3 text-4xl font-black tracking-[0.16em] text-[#102a43]">{referralCode}</p></div><p className="mt-4 text-sm leading-6 text-slate-500">Share this code with someone who wants to build practical digital skills.</p><button type="button" onClick={copyReferralCode} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#102a43] px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-100">{referralCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{referralCopied ? "Referral code copied" : "Copy referral code"}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
