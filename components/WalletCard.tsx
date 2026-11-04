"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownToLine,
  Check,
  Copy,
  Gift,
  History,
  Loader2,
  Wallet,
  X,
} from "lucide-react";

type WalletTransaction = {
  id: number;
  type: "credit" | "debit";
  amount: string | number;
  reason: string;
  reference: string | null;
  created_at: string;
};

type Withdrawal = {
  id: number;
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

export default function WalletCard() {
  const [balance, setBalance] = useState("0.00");
  const [referralCode, setReferralCode] = useState("");
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const loadWallet = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoadError("Please log in to view your wallet.");
      setIsLoading(false);
      return;
    }
    try {
      const [walletRes, withdrawalsRes] = await Promise.all([
        fetch("/api/v1/wallet", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }),
        fetch("/api/v1/wallet/withdrawals", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        }),
      ]);
      const walletPayload = await walletRes.json();
      const withdrawalsPayload = await withdrawalsRes.json();
      if (!walletRes.ok || !walletPayload.success) {
        throw new Error(walletPayload.message ?? "Unable to load wallet.");
      }
      setBalance(Number(walletPayload.data.balance ?? 0).toFixed(2));
      setReferralCode(walletPayload.data.referral_code ?? "");
      setTransactions(walletPayload.data.transactions ?? []);
      if (withdrawalsRes.ok && withdrawalsPayload.success) {
        setWithdrawals(withdrawalsPayload.data.withdrawals ?? []);
      }
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : "Unable to load wallet.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWallet();
  }, [loadWallet]);

  async function handleWithdraw(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setFormError("Your login session has expired. Please log in again.");
      return;
    }
    setIsSubmitting(true);
    setFormError("");
    try {
      const response = await fetch("/api/v1/wallet/withdraw", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: Number(amount), upi_id: upiId.trim() }),
        cache: "no-store",
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Unable to submit withdrawal request.");
      }
      setBalance(Number(payload.data.balance ?? 0).toFixed(2));
      setModalOpen(false);
      setAmount("");
      setUpiId("");
      await loadWallet();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to submit withdrawal request.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function copyReferralCode() {
    if (!referralCode) return;
    await navigator.clipboard.writeText(referralCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">
              <Wallet className="h-4 w-4" /> Referral wallet
            </p>
            {isLoading ? (
              <div className="mt-3 h-9 w-32 animate-pulse rounded-lg bg-white/20" />
            ) : (
              <p className="mt-2 text-4xl font-black tracking-tight">
                ${balance}
              </p>
            )}
            <p className="mt-1 text-xs text-emerald-100">
              Earned from referral commissions
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-emerald-700 shadow transition hover:bg-emerald-50"
          >
            <ArrowDownToLine className="h-4 w-4" /> Withdraw
          </button>
        </div>

        {referralCode && (
          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-white/10 p-3">
            <Gift className="h-4 w-4 text-emerald-100" />
            <span className="text-xs font-medium text-emerald-50">
              Your referral code:
            </span>
            <code className="rounded-md bg-slate-950/40 px-2.5 py-1 text-sm font-black tracking-widest">
              {referralCode}
            </code>
            <button
              type="button"
              onClick={copyReferralCode}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold text-white transition hover:bg-white/10"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        )}
      </div>

      <div className="p-6">
        {loadError ? (
          <p role="alert" className="text-sm font-medium text-red-700">
            {loadError}
          </p>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setShowHistory((v) => !v)}
              className="inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-slate-950"
            >
              <History className="h-4 w-4" />
              {showHistory ? "Hide" : "Show"} transaction history
            </button>

            {showHistory && (
              <div className="mt-4 space-y-2">
                {transactions.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                    No transactions yet. Share your referral code to start earning.
                  </p>
                ) : (
                  transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900">{tx.reason}</p>
                        <p className="text-xs text-slate-500">
                          {new Date(tx.created_at).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-black ${
                          tx.type === "credit" ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {tx.type === "credit" ? "+" : "-"}${Number(tx.amount).toFixed(2)}
                      </span>
                    </div>
                  ))
                )}

                {withdrawals.length > 0 && (
                  <div className="pt-2">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Withdrawal requests
                    </p>
                    {withdrawals.map((w) => (
                      <div
                        key={w.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            ${Number(w.amount).toFixed(2)} → {w.upi_id}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(w.created_at).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                            {w.admin_note ? ` · ${w.admin_note}` : ""}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${statusStyles[w.status]}`}
                        >
                          {w.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="withdraw-title"
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">
                  Referral wallet
                </p>
                <h2 id="withdraw-title" className="mt-1 text-2xl font-black text-slate-950">
                  Request withdrawal
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close withdrawal dialog"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleWithdraw} className="space-y-4 p-6">
              <div>
                <label htmlFor="withdraw-amount" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  Amount (USD)
                </label>
                <input
                  id="withdraw-amount"
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 150"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </div>
              <div>
                <label htmlFor="withdraw-upi" className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
                  UPI ID
                </label>
                <input
                  id="withdraw-upi"
                  type="text"
                  required
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
                <p className="mt-1.5 text-xs text-slate-500">
                  The amount is held from your wallet immediately and refunded if rejected.
                </p>
              </div>
              {formError && (
                <p role="alert" className="text-sm font-medium text-red-700">
                  {formError}
                </p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? "Submitting…" : "Send withdrawal request"}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
