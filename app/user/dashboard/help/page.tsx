"use client";

import { FormEvent, useEffect, useState } from "react";
import { Mail, Send } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

type User = { name: string; email: string };

const supportEmail = "info.skilllab@gmail.com";
const defaultUser: User = { name: "Learner", email: "learner@example.com" };

export default function HelpPage() {
	const [user, setUser] = useState<User | null>(null);
	const [subject, setSubject] = useState("");
	const [message, setMessage] = useState("");

	useEffect(() => {
		const userData = localStorage.getItem("userData");
		try {
			setUser(userData ? { ...defaultUser, ...JSON.parse(userData) } : defaultUser);
		} catch {
			setUser(defaultUser);
		}
	}, []);

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const emailSubject = encodeURIComponent(subject || "Help with my SkillLab account");
		const emailBody = encodeURIComponent(message || `Hello SkillLab support,\n\nMy name is ${user?.name ?? "Learner"}.`);
		window.location.href = `mailto:${supportEmail}?subject=${emailSubject}&body=${emailBody}`;
	};

	if (!user) {
		return <div className="flex min-h-screen items-center justify-center bg-[#f5f7f9]"><div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-orange-600" /></div>;
	}

	return (
		<DashboardLayout user={user}>
			<div className="mx-auto max-w-3xl space-y-6">
				<header className="rounded-2xl bg-[#102a43] p-6 text-white shadow-lg sm:p-8">
					<p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Support</p>
					<h1 className="mt-2 text-3xl font-black tracking-tight">Help center</h1>
					<p className="mt-3 text-sm leading-6 text-slate-300">Have a question about your account or courses? Send us a message.</p>
				</header>

				<section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
					<div className="flex items-start gap-4 border-b border-slate-100 pb-6"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Mail className="h-5 w-5" /></div><div><h2 className="text-xl font-black text-slate-950">Contact support</h2><p className="mt-1 text-sm text-slate-500">Email us directly at <a href={`mailto:${supportEmail}`} className="font-bold text-orange-600 hover:text-orange-700">{supportEmail}</a></p></div></div>

					<form onSubmit={handleSubmit} className="mt-6 space-y-5">
						<label className="block"><span className="text-sm font-bold text-slate-700">Subject</span><input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="How can we help?" className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10" /></label>
						<label className="block"><span className="text-sm font-bold text-slate-700">Message</span><textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell us what you need help with..." rows={6} className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10" /></label>
						<button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-[#102a43] px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-100"><Send className="h-4 w-4" /> Send email</button>
					</form>
				</section>
			</div>
		</DashboardLayout>
	);
}
