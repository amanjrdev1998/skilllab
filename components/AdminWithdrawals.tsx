"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownToLine,
  Check,
  Loader2,
  Wallet,
  X,
} from "lucide-react";

type Withdrawal = {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  amount: string | number;
  upi_id: string;
  status: "pending" | "approved" | "rejected" | "paid";
  admin_note: string | null;
  created_at: string;
};

const statusStyles: Record<Withdrawal["status"], string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-blue-50 text-blue-700",
  rejected: "bg-red-50 text-red-700",
  paid: "bg-emerald-50 text-emerald-700",
};

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [actingId, setActingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Your session expired. Please sign in again.");
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch("/api/v1/admin/withdrawals", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Unable to load withdrawals.");
      }
      setWithdrawals(payload.data.withdrawals ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Unable to load withdrawals.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleAction(id: number, action: "approve" | "reject" | "paid") {
    const messages = {
      approve: "Approve this withdrawal? Pay the user via UPI, then mark it Paid.",
      reject: "Reject this withdrawal? The amount will be refunded to the user's wallet.",
      paid: "Mark this withdrawal as paid? Do this only after sending the money via UPI.",
    };
    if (!window.confirm(messages[action])) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Your session expired. Please sign in again.");
      return;
    }
    setActingId(id);
    setError("");
    try {
      const response = await fetch(`/api/v1/admin/withdrawals/${id}/${action}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? `Unable to ${action} withdrawal.`);
      }
      await load();
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : `Unable to ${action} withdrawal.`,
      );
    } finally {
      setActingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col justify-between gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
            Affiliate payouts
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Withdrawal requests
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Approve requests, pay the user via UPI manually, then mark them{" "}
            <strong>Paid</strong>. Rejecting refunds the wallet instantly.
          </p>
        </div>
      </section>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">User</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">UPI ID</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Requested</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {withdrawals.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-4">
                    <p className="font-bold text-slate-900">{w.user_name}</p>
                    <p className="text-xs text-slate-500">{w.user_email}</p>
                  </td>
                  <td className="px-5 py-4 font-black text-slate-900">
                    ${Number(w.amount).toFixed(2)}
                  </td>
                  <td className="px-5 py-4">
                    <code className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold">
                      {w.upi_id}
                    </code>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[w.status]}`}>
                      {w.status}
                    </span>
                    {w.admin_note && (
                      <p className="mt-1 text-xs text-slate-500">{w.admin_note}</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">
                    {new Date(w.created_at).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      {w.status === "pending" && (
                        <>
                          <button
                            type="button"
                            disabled={actingId === w.id}
                            onClick={() => handleAction(w.id, "approve")}
                            className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-green-700 disabled:opacity-50"
                          >
                            {actingId === w.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={actingId === w.id}
                            onClick={() => handleAction(w.id, "reject")}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </>
                      )}
                      {w.status === "approved" && (
                        <>
                          <button
                            type="button"
                            disabled={actingId === w.id}
                            onClick={() => handleAction(w.id, "paid")}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                          >
                            <Wallet className="h-3.5 w-3.5" />
                            Mark paid
                          </button>
                          <button
                            type="button"
                            disabled={actingId === w.id}
                            onClick={() => handleAction(w.id, "reject")}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:border-red-400 hover:text-red-600 disabled:opacity-50"
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </>
                      )}
                      {(w.status === "rejected" || w.status === "paid") && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                          <ArrowDownToLine className="h-3.5 w-3.5" /> Done
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {withdrawals.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-14 text-center text-slate-500">
                    No withdrawal requests yet.
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
