"use client";

import { useEffect, useMemo, useState } from "react";
import { BookOpen, FileText, Pencil, Plus, Search, Trash2, Upload, X } from "lucide-react";
import {
  AdminCourse,
  AdminCourseInput,
  createAdminCourse,
  deleteAdminCourse,
  listStoragePdfs,
  loadAdminCourses,
  updateAdminCourse,
  uploadCoursePdf,
} from "@/lib/admin";
import { formatUsd } from "@/lib/currency";

const emptyForm: AdminCourseInput = {
  title: "",
  category: "",
  description: "",
  lessons_count: 0,
  duration_hours: 0,
  price: 0,
  old_price: null,
  level: "Beginner",
  badge: "",
  status: "draft",
  pdf_url: "",
};

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    published: "bg-emerald-50 text-emerald-700",
    draft: "bg-amber-50 text-amber-700",
    archived: "bg-slate-100 text-slate-500",
  };
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${styles[status] ?? styles.draft}`}>
      {status}
    </span>
  );
}

export default function AdminCourseList() {
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCourse | null>(null);
  const [form, setForm] = useState<AdminCourseInput>(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [storagePdfs, setStoragePdfs] = useState<string[]>([]);
  const [pendingPdf, setPendingPdf] = useState<File | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function reload() {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please sign in as an administrator to view courses.");
      setIsLoading(false);
      return;
    }
    try {
      const data = await loadAdminCourses(token);
      setCourses(data);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load courses.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await Promise.resolve();
      if (!cancelled) await reload();
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredCourses = useMemo(() => {
    const search = query.trim().toLowerCase();
    return courses.filter((course) =>
      `${course.title} ${course.category}`.toLowerCase().includes(search),
    );
  }, [courses, query]);

  useEffect(() => {
    if (!modalOpen) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    listStoragePdfs(token).then(setStoragePdfs).catch(() => setStoragePdfs([]));
  }, [modalOpen]);

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setPendingPdf(null);
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(course: AdminCourse) {
    setEditing(course);
    setForm({
      title: course.title,
      category: course.category,
      description: "",
      lessons_count: Number(course.lessons_count) || 0,
      duration_hours: 0,
      price: Number(course.price) || 0,
      old_price: null,
      level: "Beginner",
      badge: "",
      status: course.status === "published" ? "published" : "draft",
      pdf_url: course.pdf_url ?? "",
    });
    setPendingPdf(null);
    setFormError("");
    setModalOpen(true);
  }

  async function handleSave() {
    const token = localStorage.getItem("token");
    if (!token) {
      setFormError("Your session expired. Please sign in again.");
      return;
    }
    if (!form.title.trim() || !form.category.trim()) {
      setFormError("Title and category are required.");
      return;
    }
    if (!(form.price >= 0)) {
      setFormError("Price must be 0 or more.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      let savedId: number;
      if (editing) {
        const updated = await updateAdminCourse(token, editing.id, {
          ...form,
          title: form.title.trim(),
          category: form.category.trim(),
        });
        savedId = updated.id;
        setCourses((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...updated } : c)));
      } else {
        const created = await createAdminCourse(token, {
          ...form,
          title: form.title.trim(),
          category: form.category.trim(),
        });
        savedId = created.id;
        setCourses((prev) => [created, ...prev]);
      }
      if (pendingPdf) {
        const { course: withPdf } = await uploadCoursePdf(token, savedId, pendingPdf);
        setCourses((prev) => prev.map((c) => (c.id === savedId ? { ...c, ...withPdf } : c)));
      }
      setModalOpen(false);
      setPendingPdf(null);
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : "Unable to save course.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(course: AdminCourse) {
    const confirmed = window.confirm(
      `Delete "${course.title}" permanently? Enrollments linked to it will also be removed.`,
    );
    if (!confirmed) return;
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Your session expired. Please sign in again.");
      return;
    }
    setDeletingId(course.id);
    try {
      await deleteAdminCourse(token, course.id);
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete course.");
    } finally {
      setDeletingId(null);
    }
  }

  function setField<K extends keyof AdminCourseInput>(key: K, value: AdminCourseInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />
      </div>
    );
  }

  if (error && courses.length === 0) {
    return <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">{error}</div>;
  }

  const inputCls =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20";

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">Content management</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Courses</h1>
          <p className="mt-2 text-sm text-slate-500">Create, publish, edit and remove courses. Only <strong>published</strong> courses appear in the store.</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700"
        >
          <Plus className="h-4 w-4" /> Add course
        </button>
      </section>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <h2 className="text-lg font-black text-slate-950">Course catalog</h2>
            <p className="mt-1 text-sm text-slate-500">{filteredCourses.length} courses</p>
          </div>
          <label className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 sm:max-w-xs">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search courses" className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
          </label>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr><th className="px-5 py-3">Course</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Lessons</th><th className="px-5 py-3">Students</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCourses.map((course) => (
                <tr key={course.id}>
                  <td className="px-5 py-4 font-bold text-slate-900"><span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4 text-orange-500" />{course.title}{course.pdf_url ? <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700"><FileText className="h-3 w-3" />PDF</span> : null}</span></td>
                  <td className="px-5 py-4 text-slate-600">{course.category}</td>
                  <td className="px-5 py-4 text-slate-600">{course.lessons_count}</td>
                  <td className="px-5 py-4 text-slate-600">{course.students_count}</td>
                  <td className="px-5 py-4 font-semibold text-slate-800">{formatUsd(course.price)}</td>
                  <td className="px-5 py-4">{statusBadge(course.status)}</td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(course)}
                        title="Edit course"
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-orange-400 hover:text-orange-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(course)}
                        disabled={deletingId === course.id}
                        title="Delete course"
                        className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-red-400 hover:text-red-600 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCourses.length === 0 && <tr><td colSpan={7} className="px-5 py-14 text-center text-slate-500">No courses found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onClick={() => setModalOpen(false)}>
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-950">{editing ? "Edit course" : "Add new course"}</h2>
              <button onClick={() => setModalOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{formError}</div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Title *</label>
                <input className={inputCls} value={form.title} onChange={(e) => setField("title", e.target.value)} placeholder="e.g. Facebook Ads Mastery" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Category *</label>
                <input className={inputCls} value={form.category} onChange={(e) => setField("category", e.target.value)} placeholder="e.g. Digital Marketing" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Level</label>
                <select className={inputCls} value={form.level} onChange={(e) => setField("level", e.target.value as AdminCourseInput["level"])}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Description</label>
                <textarea className={inputCls} rows={3} value={form.description ?? ""} onChange={(e) => setField("description", e.target.value)} placeholder="What will students learn?" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Price (USD) *</label>
                <input type="number" min={0} step="0.01" className={inputCls} value={form.price} onChange={(e) => setField("price", Number(e.target.value))} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Old price (USD, optional)</label>
                <input type="number" min={0} step="0.01" className={inputCls} value={form.old_price ?? ""} onChange={(e) => setField("old_price", e.target.value === "" ? null : Number(e.target.value))} placeholder="For strikethrough pricing" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Lessons</label>
                <input type="number" min={0} className={inputCls} value={form.lessons_count} onChange={(e) => setField("lessons_count", Number(e.target.value))} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Duration (hours)</label>
                <input type="number" min={0} step="0.5" className={inputCls} value={form.duration_hours} onChange={(e) => setField("duration_hours", Number(e.target.value))} />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Badge (optional)</label>
                <input className={inputCls} value={form.badge ?? ""} onChange={(e) => setField("badge", e.target.value)} placeholder="BESTSELLER / NEW / TRENDING" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Status</label>
                <select className={inputCls} value={form.status} onChange={(e) => setField("status", e.target.value as AdminCourseInput["status"])}>
                  <option value="draft">Draft (hidden from store)</option>
                  <option value="published">Published (visible in store)</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">Course PDF (protected)</label>
              <p className="mb-3 text-xs leading-5 text-slate-500">Students read it in a protected viewer where downloading and printing are disabled. Pick an uploaded PDF or upload a new one.</p>
              <select className={inputCls} value={form.pdf_url ?? ""} onChange={(e) => { setField("pdf_url", e.target.value || null); setPendingPdf(null); }}>
                <option value="">No PDF attached</option>
                {storagePdfs.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-orange-400 hover:text-orange-600">
                <Upload className="h-4 w-4" /> {pendingPdf ? "Change file" : "Upload new PDF"}
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    setPendingPdf(file);
                    if (file) setField("pdf_url", null);
                  }}
                />
              </label>
              {pendingPdf && <p className="mt-2 text-xs text-slate-500">Will upload on save: <span className="font-bold text-slate-700">{pendingPdf.name}</span></p>}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl bg-orange-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 disabled:opacity-60"
              >
                {saving ? "Saving..." : editing ? "Save changes" : "Create course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
