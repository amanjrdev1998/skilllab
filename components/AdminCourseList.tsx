'use client';

import { useState } from 'react';
import { BookOpen, MoreHorizontal, Plus, Search, Users } from 'lucide-react';

type Course = {
  id: number;
  title: string;
  category: string;
  lessons: string;
  students: string;
  price: string;
  status: string;
  tone: string;
};

const courses: Course[] = [
  { id: 1, title: 'Facebook Ads Mastery', category: 'Digital Marketing', lessons: '32 lessons', students: '2,400', price: '₹2,999', status: 'Published', tone: 'bg-emerald-50 text-emerald-700' },
  { id: 2, title: 'Instagram Ads Mastery', category: 'Digital Marketing', lessons: '28 lessons', students: '1,800', price: '₹2,499', status: 'Published', tone: 'bg-emerald-50 text-emerald-700' },
  { id: 3, title: 'AI Automation', category: 'Artificial Intelligence', lessons: '40 lessons', students: '3,100', price: '₹3,999', status: 'Published', tone: 'bg-emerald-50 text-emerald-700' },
  { id: 4, title: 'Cloud AI Agent Generation', category: 'Artificial Intelligence', lessons: '45 lessons', students: '1,200', price: '₹4,999', status: 'Published', tone: 'bg-emerald-50 text-emerald-700' },
  { id: 5, title: 'Flutter AI App Development Crash Course', category: 'Mobile Development', lessons: '24 lessons', students: '1,500', price: '₹3,499', status: 'Draft', tone: 'bg-amber-50 text-amber-700' },
];

export default function AdminCourseList() {
  const [query, setQuery] = useState('');
  const filteredCourses = courses.filter((course) => `${course.title} ${course.category}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Content management</p><h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">All courses</h1><p className="mt-2 text-sm text-slate-500">Manage your learning catalog, pricing, and publishing status.</p></div>
        <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600"><Plus className="h-4 w-4" /> Add course</button>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:p-6"><div><h2 className="text-lg font-black text-slate-950">Course catalog</h2><p className="mt-1 text-sm text-slate-500">{filteredCourses.length} of {courses.length} courses</p></div><label className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 sm:max-w-xs"><Search className="h-4 w-4 shrink-0 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses" className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" /></label></div>

        <div className="hidden grid-cols-[minmax(260px,1.5fr)_1fr_120px_120px_110px_40px] gap-4 border-b border-slate-200 bg-slate-50 px-6 py-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500 lg:grid"><span>Course</span><span>Category</span><span>Students</span><span>Price</span><span>Status</span><span /></div>
        <div className="divide-y divide-slate-100">
          {filteredCourses.map((course) => (
            <div key={course.id} className="grid gap-4 px-5 py-5 lg:grid-cols-[minmax(260px,1.5fr)_1fr_120px_120px_110px_40px] lg:items-center lg:px-6">
              <div className="flex items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><BookOpen className="h-5 w-5" /></div><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-950">{course.title}</p><p className="mt-1 text-xs text-slate-500">{course.lessons}</p></div></div>
              <p className="text-sm text-slate-600"><span className="mr-2 text-xs font-bold uppercase tracking-wider text-slate-400 lg:hidden">Category:</span>{course.category}</p>
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-700"><Users className="h-4 w-4 text-slate-400" />{course.students}</p>
              <p className="text-lg font-black text-slate-950"><span className="mr-2 text-xs font-bold uppercase tracking-wider text-slate-400 lg:hidden">Price:</span>{course.price}</p>
              <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${course.tone}`}>{course.status}</span>
              <button type="button" aria-label={`More options for ${course.title}`} className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 lg:ml-auto"><MoreHorizontal className="h-5 w-5" /></button>
            </div>
          ))}
          {filteredCourses.length === 0 && <div className="px-6 py-14 text-center"><BookOpen className="mx-auto h-10 w-10 text-slate-300" /><p className="mt-3 font-bold text-slate-700">No courses found</p><p className="mt-1 text-sm text-slate-500">Try a different search term.</p></div>}
        </div>
      </section>
    </div>
  );
}