"use client";

import { useEffect, useState } from "react";
import { BookOpen, Check, GraduationCap, Loader2, Users } from "lucide-react";
import {
  approveAdminEnrollment,
  AdminDashboardData,
  loadAdminDashboard,
} from "@/lib/admin";
import { formatUsd } from "@/lib/currency";

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: AdminDashboardData };

export default function AdminDashboard() {
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      await Promise.resolve();
      const token = localStorage.getItem("token");
      if (!token) {
        setState({ status: "error", message: "Please sign in as an administrator to view this data." });
        return;
      }

      try {
        const data = await loadAdminDashboard(token);
        if (!cancelled) {
          setState({ status: "ready", data });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: "error",
            message: error instanceof Error ? error.message : "Unable to load admin data.",
          });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleApprove(enrollmentId: number) {
    const token = localStorage.getItem("token");
    if (!token) {
      setActionError("Authentication token not found. Please sign in again.");
      return;
    }

    try {
      setActionLoadingId(enrollmentId);
      setActionError("");
      await approveAdminEnrollment(token, enrollmentId);
      setState((current) => {
        if (current.status !== "ready") {
          return current;
        }

        return {
          ...current,
          data: {
            ...current.data,
            enrollments: current.data.enrollments.map((enrollment) =>
              enrollment.id === enrollmentId
                ? { ...enrollment, status: "active" }
                : enrollment,
            ),
          },
        };
      });
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to approve enrollment.",
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  if (state.status === "loading") {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
        {state.message}
      </div>
    );
  }

  const { data } = state;
  const stats = [
    { label: "Students", value: data.statistics.total_users, icon: Users, tone: "bg-orange-50 text-orange-600" },
    { label: "Published courses", value: data.statistics.total_courses, icon: BookOpen, tone: "bg-indigo-50 text-indigo-600" },
    { label: "Enrollments", value: data.statistics.total_enrollments, icon: GraduationCap, tone: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-[#101827] via-[#19233b] to-[#334155] p-6 text-white shadow-lg sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">Admin overview</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">SkillLab dashboard</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">Live student, published course, and enrollment data.</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
            </div>
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></div>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-black text-slate-950">Published courses</h2>
          <p className="mt-1 text-sm text-slate-500">Only courses currently published are shown.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr><th className="px-5 py-3">Course</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Lessons</th><th className="px-5 py-3">Price</th><th className="px-5 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.courses.map((course) => (
                <tr key={course.id}>
                  <td className="px-5 py-4 font-bold text-slate-900">{course.title}</td>
                  <td className="px-5 py-4 text-slate-600">{course.category}</td>
                  <td className="px-5 py-4 text-slate-600">{course.lessons_count}</td>
                  <td className="px-5 py-4 font-semibold text-slate-800">{formatUsd(course.price)}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold capitalize text-emerald-700">{course.status}</span></td>
                </tr>
              ))}
              {data.courses.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">No published courses found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h2 className="text-lg font-black text-slate-950">Students</h2>
          <p className="mt-1 text-sm text-slate-500">Registered student account details.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Phone</th><th className="px-5 py-3">Referral code</th><th className="px-5 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.users.map((user) => (
                <tr key={user.id}>
                  <td className="px-5 py-4 font-bold text-slate-900">{user.name}</td>
                  <td className="px-5 py-4 text-slate-600">{user.email}</td>
                  <td className="px-5 py-4 text-slate-600">{user.phone || "—"}</td>
                  <td className="px-5 py-4 text-slate-600">{user.referral_code || "—"}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700">{user.status}</span></td>
                </tr>
              ))}
              {data.users.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">No students found.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>


      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-black text-slate-950">
                Enrollment student list
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Every enrollment, including pending and completed records.
              </p>
            </div>

            <div className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700">
              {data.enrollments.length} enrollments
            </div>
          </div>
        </div>

        {actionError && (
          <p role="alert" className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700">
            {actionError}
          </p>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1250px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Order ID</th>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">UTR</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Enrolled at</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {data.enrollments.map((enrollment) => (
                <tr
                  key={enrollment.id}
                  className="transition hover:bg-slate-50"
                >
                  {/* Order ID */}
                  <td className="px-5 py-4">
                    <span className="font-mono text-xs font-bold text-indigo-700">
                      {enrollment.order_id}
                    </span>
                  </td>

                  {/* Student */}
                  <td className="px-5 py-4">
                    <span className="font-bold text-slate-900">
                      {enrollment.student_name}
                    </span>
                  </td>

                  {/* Email */}
                  <td className="px-5 py-4 text-slate-600">
                    {enrollment.student_email}
                  </td>

                  {/* Phone */}
                  <td className="px-5 py-4 text-slate-600">
                    {enrollment.student_phone || "—"}
                  </td>

                  {/* Course */}
                  <td className="px-5 py-4 text-slate-700">
                    {enrollment.course_name}
                  </td>

                  {/* Amount */}
                  <td className="px-5 py-4 font-semibold text-slate-800">
                    {formatUsd(enrollment.price_paid)}
                  </td>

                  {/* UTR */}
                  <td className="px-5 py-4">
                    {enrollment.utr ? (
                      <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 font-mono text-xs font-bold text-blue-700">
                        {enrollment.utr}
                      </span>
                    ) : (
                      <span className="text-slate-400">
                        Not submitted
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${enrollment.status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : enrollment.status === "cancelled"
                            ? "bg-red-50 text-red-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                    >
                      {enrollment.status}
                    </span>
                  </td>

                  {/* Enrolled At */}
                  <td className="px-5 py-4 text-slate-600">
                    {new Date(
                      enrollment.enrolled_at
                    ).toLocaleString()}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    {enrollment.status === "pending" ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={actionLoadingId === enrollment.id}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => void handleApprove(enrollment.id)}
                        >
                          {actionLoadingId === enrollment.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Check className="h-3.5 w-3.5" />}
                          Approve
                        </button>

                        <button
                          type="button"
                          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700"
                          onClick={() => {
                            console.log(
                              "Reject enrollment:",
                              enrollment.id
                            );
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400">
                        No action
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {data.enrollments.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    No enrollments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
}
