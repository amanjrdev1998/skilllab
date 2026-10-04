
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Users,
  Check,
  X,
  Loader2,
} from "lucide-react";
import {
  approveAdminEnrollment,
  AdminDashboardData,
  formatRupees,
  loadAdminDashboard,
} from "@/lib/admin";

export default function AdminStudentList() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      await Promise.resolve();

      const token = localStorage.getItem("token");

      if (!token) {
        setError(
          "Please sign in as an administrator to view student records.",
        );
        return;
      }

      try {
        const result = await loadAdminDashboard(token);

        if (!cancelled) {
          setData(result);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load student records.",
          );
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const enrollments = useMemo(() => {
    const search = query.trim().toLowerCase();

    return (data?.enrollments ?? []).filter((enrollment) =>
      `${enrollment.order_id}
       ${enrollment.student_name}
       ${enrollment.student_email}
       ${enrollment.student_phone ?? ""}
       ${enrollment.course_name}
       ${enrollment.utr}
       ${enrollment.referral_code ?? ""}
       ${enrollment.utr ?? ""}`
        .toLowerCase()
        .includes(search),
    );
  }, [data, query]);

  /**
   * Approve enrollment
   */
  async function handleApprove(enrollmentId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to approve this enrollment?",
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Authentication token not found.");
      return;
    }

    try {
      setActionLoading(enrollmentId);
      setError("");

      await approveAdminEnrollment(token, enrollmentId);

      setData((previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          enrollments: previous.enrollments.map((enrollment) =>
            enrollment.id === enrollmentId
              ? {
                  ...enrollment,
                  status: "active",
                }
              : enrollment,
          ),
        };
      });
    } catch (approveError) {
      setError(
        approveError instanceof Error
          ? approveError.message
          : "Unable to approve enrollment.",
      );
    } finally {
      setActionLoading(null);
    }
  }

  /**
   * Reject enrollment
   */
  async function handleReject(enrollmentId: number) {
    const confirmed = window.confirm(
      "Are you sure you want to reject this enrollment?",
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Authentication token not found.");
      return;
    }

    try {
      setActionLoading(enrollmentId);
      setError("");

      const response = await fetch(
        `http://localhost:8000/api/v1/admin/enrollments/${enrollmentId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Unable to reject enrollment.",
        );
      }

      setData((previous) => {
        if (!previous) return previous;

        return {
          ...previous,
          enrollments: previous.enrollments.map((enrollment) =>
            enrollment.id === enrollmentId
              ? {
                  ...enrollment,
                  status: "rejected",
                }
              : enrollment,
          ),
        };
      });
    } catch (rejectError) {
      setError(
        rejectError instanceof Error
          ? rejectError.message
          : "Unable to reject enrollment.",
      );
    } finally {
      setActionLoading(null);
    }
  }

  if (!data && !error) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700"
      >
        {error}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-6">
      {/* Header */}
      <section className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
            User management
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Enrollment student list
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Student contact details, payment UTR and course enrollment status.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-700">
          <Users className="h-4 w-4" />
          {data?.statistics.total_enrollments ?? 0} enrollments
        </div>
      </section>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
        >
          {error}
        </div>
      )}

      {/* Table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Table header */}
        <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:p-6">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              All enrollments
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {enrollments.length} records shown ·{" "}
              {data?.users.length ?? 0} registered students
            </p>
          </div>

          {/* Search */}
          <label className="flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 sm:max-w-sm">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search students, UTR or courses"
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1450px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Order ID</th>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone</th>
                <th className="px-5 py-3">Course</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">UTR</th>
                <th className="px-5 py-3">Referral</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Enrolled</th>
                <th className="px-5 py-3">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {enrollments.map((enrollment) => {
                const isLoading = actionLoading === enrollment.id;

                return (
                  <tr
                    key={enrollment.id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Order ID */}
                    <td className="px-5 py-4 font-mono text-xs font-bold text-indigo-700">
                      {enrollment.order_id}
                    </td>

                    {/* Student */}
                    <td className="px-5 py-4 font-bold text-slate-900">
                      {enrollment.student_name}
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
                      {formatRupees(enrollment.price_paid)}
                    </td>

                    {/* UTR */}
                    <td className="px-5 py-4">
                      {enrollment.utr ? (
                        <span className="rounded-lg bg-blue-50 px-2.5 py-1.5 font-mono text-xs font-bold text-blue-700">
                          {enrollment.utr}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Referral */}
                    <td className="px-5 py-4 text-slate-600">
                      {enrollment.referral_code || "—"}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                          enrollment.status === "active"
                            ? "bg-green-50 text-green-700"
                            :                             enrollment.status === "cancelled"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {enrollment.status}
                      </span>
                    </td>

                    {/* Enrolled */}
                    <td className="px-5 py-4 text-slate-600">
                      {new Date(
                        enrollment.enrolled_at,
                      ).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4">
                      {enrollment.status === "pending" ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() =>
                              handleApprove(enrollment.id)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isLoading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Check className="h-3.5 w-3.5" />
                            )}
                            Approve
                          </button>

                          <button
                            type="button"
                            disabled={isLoading}
                            onClick={() =>
                              handleReject(enrollment.id)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isLoading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <X className="h-3.5 w-3.5" />
                            )}
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
                );
              })}

              {enrollments.length === 0 && (
                <tr>
                  <td
                    colSpan={11}
                    className="px-5 py-14 text-center text-slate-500"
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
