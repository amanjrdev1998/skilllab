'use client';

import { useState } from 'react';
import { BookOpen, DollarSign, Mail, MoreHorizontal, Phone, Search, Users } from 'lucide-react';

type Student = {
  id: number;
  name: string;
  email: string;
  mobile: string;
  course: string;
  amount: string;
  referralCode: string;
  initials: string;
  tone: string;
};

const students: Student[] = [
  { id: 1, name: 'Ananya Sharma', email: 'ananya.sharma@example.com', mobile: '+91 98765 43210', course: 'Facebook Ads Mastery', amount: '₹2,999', referralCode: 'ANSH4821', initials: 'AS', tone: 'bg-orange-100 text-orange-700' },
  { id: 2, name: 'Rohan Mehta', email: 'rohan.mehta@example.com', mobile: '+91 98123 45678', course: 'AI Automation', amount: '₹3,999', referralCode: 'ROME7314', initials: 'RM', tone: 'bg-indigo-100 text-indigo-700' },
  { id: 3, name: 'Priya Nair', email: 'priya.nair@example.com', mobile: '+91 99887 66554', course: 'Instagram Ads Mastery', amount: '₹2,499', referralCode: 'PRNA2058', initials: 'PN', tone: 'bg-emerald-100 text-emerald-700' },
  { id: 4, name: 'Kabir Singh', email: 'kabir.singh@example.com', mobile: '+91 97654 32109', course: 'Cloud AI Agent Generation', amount: '₹4,999', referralCode: 'KASI6190', initials: 'KS', tone: 'bg-sky-100 text-sky-700' },
  { id: 5, name: 'Meera Patel', email: 'meera.patel@example.com', mobile: '+91 98989 12121', course: 'Flutter AI App Development Crash Course', amount: '₹3,499', referralCode: 'MEPA3486', initials: 'MP', tone: 'bg-rose-100 text-rose-700' },
];

export default function AdminStudentList() {
  const [query, setQuery] = useState('');
  const filteredStudents = students.filter((student) =>
    `${student.name} ${student.email} ${student.mobile} ${student.course} ${student.referralCode}`.toLowerCase().includes(query.toLowerCase())
  );
  const totalRevenue = students.reduce((total, student) => total + Number(student.amount.replace(/[^0-9]/g, '')), 0);
  const uniqueCourses = new Set(students.map((student) => student.course)).size;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">User management</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Student list</h1><p className="mt-2 text-sm text-slate-500">Keep track of learner contact details, purchases, and referrals.</p></div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-700"><Users className="h-4 w-4" /> {students.length} active students</div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Users className="h-5 w-5" /></div><div><p className="text-2xl font-black text-slate-950">{students.length}</p><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Total students</p></div></div>
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><DollarSign className="h-5 w-5" /></div><div><p className="text-2xl font-black text-slate-950">₹{(totalRevenue / 1000).toFixed(1)}K</p><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Catalog revenue</p></div></div>
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><BookOpen className="h-5 w-5" /></div><div><p className="text-2xl font-black text-slate-950">{uniqueCourses}</p><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Courses purchased</p></div></div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:p-6"><div><h2 className="text-lg font-black text-slate-950">All students</h2><p className="mt-1 text-sm text-slate-500">{filteredStudents.length} of {students.length} records</p></div><label className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 sm:max-w-sm"><Search className="h-4 w-4 shrink-0 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search students or courses" className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" /></label></div>

        <div className="hidden grid-cols-[minmax(200px,1.2fr)_minmax(210px,1.3fr)_155px_minmax(190px,1.2fr)_100px_120px_40px] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 xl:grid"><span>Student</span><span>Email</span><span>Mobile</span><span>Course</span><span>Amount</span><span>Referral code</span><span /></div>
        <div className="divide-y divide-slate-100">
          {filteredStudents.map((student) => (
            <div key={student.id} className="grid gap-4 px-5 py-5 xl:grid-cols-[minmax(200px,1.2fr)_minmax(210px,1.3fr)_155px_minmax(190px,1.2fr)_100px_120px_40px] xl:items-center xl:px-6">
              <div className="flex items-center gap-3"><div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-black ${student.tone}`}>{student.initials}</div><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-950">{student.name}</p><p className="mt-1 text-xs text-slate-500">Student #{String(student.id).padStart(3, '0')}</p></div></div>
              <p className="flex min-w-0 items-center gap-2 truncate text-sm text-slate-600"><Mail className="h-4 w-4 shrink-0 text-slate-400" /><span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 xl:hidden">Email</span><span className="truncate">{student.email}</span></p>
              <p className="flex items-center gap-2 text-sm text-slate-600"><Phone className="h-4 w-4 shrink-0 text-slate-400" /><span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 xl:hidden">Mobile</span>{student.mobile}</p>
              <p className="flex items-start gap-2 text-sm font-semibold text-slate-700"><BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" /><span className="mr-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 xl:hidden">Course</span><span>{student.course}</span></p>
              <p className="text-lg font-black text-slate-950"><span className="mr-2 text-xs font-bold uppercase tracking-wider text-slate-400 xl:hidden">Amount:</span>{student.amount}</p>
              <span className="w-fit rounded-md bg-orange-50 px-2.5 py-1.5 text-xs font-black tracking-wider text-orange-700"><span className="mr-2 font-bold tracking-normal text-slate-400 xl:hidden">Referral:</span>{student.referralCode}</span>
              <button type="button" aria-label={`More options for ${student.name}`} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 xl:ml-auto"><MoreHorizontal className="h-5 w-5" /></button>
            </div>
          ))}
          {filteredStudents.length === 0 && <div className="px-6 py-14 text-center"><Users className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 font-bold text-slate-700">No students found</p><p className="mt-1 text-sm text-slate-500">Try a different name, course, or referral code.</p></div>}
        </div>
      </section>
    </div>
  );
}