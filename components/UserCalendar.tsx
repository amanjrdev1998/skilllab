"use client";

import { useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Plus } from "lucide-react";

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const events = [
  { date: "2026-09-04", title: "Facebook Ads lesson", time: "10:00 AM", color: "bg-indigo-600" },
  { date: "2026-09-09", title: "Campaign practice", time: "02:00 PM", color: "bg-orange-500" },
  { date: "2026-09-15", title: "AI Automation lesson", time: "11:30 AM", color: "bg-cyan-600" },
  { date: "2026-09-22", title: "Weekly review", time: "04:00 PM", color: "bg-emerald-500" },
];

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function UserCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 3));
  const [selectedDate, setSelectedDate] = useState(new Date(2026, 8, 3));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarDays = Array.from({ length: firstDay + daysInMonth }, (_, index) => index < firstDay ? null : index - firstDay + 1);
  const selectedEvents = events.filter((event) => event.date === dateKey(selectedDate));

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(year, month + offset, 1));
  };

  const selectDay = (day: number) => {
    setSelectedDate(new Date(year, month, day));
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-slate-950 via-indigo-950 to-indigo-800 p-6 text-white shadow-lg sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">Learning schedule</p>
        <div className="mt-2 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><h1 className="text-3xl font-black tracking-tight sm:text-4xl">Calendar</h1><p className="mt-3 max-w-xl text-sm leading-6 text-indigo-100">Plan lessons, practice sessions, and important learning milestones.</p></div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/15 bg-white/10"><CalendarDays className="h-6 w-6" /></div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-5"><button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month" className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><ChevronLeft className="h-5 w-5" /></button><div className="text-center"><h2 className="text-xl font-black text-slate-950">{currentDate.toLocaleString("en-US", { month: "long", year: "numeric" })}</h2><p className="mt-1 text-xs font-medium text-slate-500">Select a day to view your schedule</p></div><button type="button" onClick={() => changeMonth(1)} aria-label="Next month" className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"><ChevronRight className="h-5 w-5" /></button></div>
          <div className="mt-5 grid grid-cols-7 gap-1 sm:gap-2">{weekDays.map((day) => <div key={day} className="py-2 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400">{day}</div>)}{calendarDays.map((day, index) => { const cellDate = day ? new Date(year, month, day) : null; const key = cellDate ? dateKey(cellDate) : `empty-${index}`; const hasEvent = cellDate ? events.some((event) => event.date === key) : false; const isSelected = cellDate && dateKey(selectedDate) === key; return <button key={key} type="button" disabled={!day} onClick={() => day && selectDay(day)} className={`relative aspect-square rounded-xl p-1 text-sm font-bold transition sm:p-2 ${!day ? "cursor-default" : isSelected ? "bg-indigo-600 text-white shadow-md" : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-700"}`}>{day && <>{day}{hasEvent && <span className={`absolute bottom-2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${isSelected ? "bg-white" : "bg-orange-500"}`} />}</>}</button>; })}</div>
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Selected day</p><h2 className="mt-1 text-xl font-black text-slate-950">{selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</h2></div><button type="button" aria-label="Add calendar event" title="Add event" className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600 hover:bg-indigo-100"><Plus className="h-5 w-5" /></button></div><div className="mt-6 space-y-3">{selectedEvents.length > 0 ? selectedEvents.map((event) => <div key={event.title} className="flex gap-3 rounded-xl border border-slate-200 p-3"><span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${event.color}`} /><div><p className="text-sm font-bold text-slate-800">{event.title}</p><p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Clock3 className="h-3.5 w-3.5" /> {event.time}</p></div></div>) : <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center"><CalendarDays className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-600">No events scheduled</p><p className="mt-1 text-xs text-slate-500">Take a break or add a study session.</p></div>}</div></aside>
      </div>
    </div>
  );
}
