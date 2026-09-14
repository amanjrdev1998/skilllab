"use client";

import { FormEvent, useEffect, useState } from "react";
import { Bell, BookOpen, Check, ChevronRight, CircleHelp, LockKeyhole, Mail, UserRound } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

type User = { name: string; email: string };
type PreferenceKey = "courseUpdates" | "weeklyDigest" | "streakReminders";
type Preferences = Record<PreferenceKey, boolean>;

const defaultUser: User = { name: "Learner", email: "learner@example.com" };
const defaultPreferences: Preferences = {
	courseUpdates: true,
	weeklyDigest: true,
	streakReminders: false,
};

const preferences: Array<{
	key: PreferenceKey;
	label: string;
	description: string;
	icon: typeof BookOpen;
}> = [
	{ key: "courseUpdates", label: "Course updates", description: "New lessons, resources, and announcements", icon: BookOpen },
	{ key: "weeklyDigest", label: "Weekly learning digest", description: "A summary of your progress every Monday", icon: Mail },
	{ key: "streakReminders", label: "Streak reminders", description: "A gentle nudge when your learning streak is at risk", icon: Bell },
];

export default function UserSettingsPage() {
	const [user, setUser] = useState<User | null>(null);
	const [fullName, setFullName] = useState("");
	const [saved, setSaved] = useState(false);
	const [error, setError] = useState("");
	const [settings, setSettings] = useState<Preferences>(defaultPreferences);

	useEffect(() => {
		const userData = localStorage.getItem("userData");
		const storedPreferences = localStorage.getItem("learningPreferences");
		let storedUser = defaultUser;

		try {
			if (userData) storedUser = { ...defaultUser, ...JSON.parse(userData) };
		} catch {
			localStorage.removeItem("userData");
		}

		setUser(storedUser);
		setFullName(storedUser.name);

		try {
			if (storedPreferences) setSettings({ ...defaultPreferences, ...JSON.parse(storedPreferences) });
		} catch {
			localStorage.removeItem("learningPreferences");
		}
	}, []);

	const saveProfile = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!user) return;
		const trimmedName = fullName.trim();
		if (!trimmedName) {
			setError("Please enter your full name.");
			setSaved(false);
			return;
		}

		const updatedUser = { ...user, name: trimmedName };
		localStorage.setItem("userData", JSON.stringify(updatedUser));
		setUser(updatedUser);
		setFullName(trimmedName);
		setError("");
		setSaved(true);
		window.setTimeout(() => setSaved(false), 2500);
	};

	const togglePreference = (key: PreferenceKey) => {
		setSettings((current) => {
			const updatedSettings = { ...current, [key]: !current[key] };
			localStorage.setItem("learningPreferences", JSON.stringify(updatedSettings));
			return updatedSettings;
		});
	};

	if (!user) {
		return <div className="flex min-h-screen items-center justify-center bg-[#f5f7f9]"><div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-orange-600" /></div>;
	}

	const initials = user.name.trim().charAt(0).toUpperCase() || "L";

	return (
		<DashboardLayout user={user}>
			<div className="mx-auto max-w-6xl space-y-7">
				<header className="relative overflow-hidden rounded-2xl bg-[#102a43] px-6 py-7 text-white shadow-lg sm:px-8">
					<div className="absolute -right-16 -top-24 h-64 w-64 rounded-full border-[28px] border-cyan-400/10" />
					<div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
						<div>
							<p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">Account center</p>
							<h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Settings</h1>
							<p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Shape your profile and learning experience around the way you learn best.</p>
						</div>
						<div className="flex items-center gap-3 sm:min-w-52">
							<div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-500 text-sm font-black text-white">{initials}</div>
							<div><p className="text-sm font-bold text-white">{user.name}</p><p className="text-xs text-slate-300">Active learner</p></div>
						</div>
					</div>
				</header>

				<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
					<div className="space-y-6">
						<section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
							<div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><UserRound className="h-5 w-5" /></div><div><h2 className="text-lg font-black text-slate-950">Profile details</h2><p className="mt-1 text-sm text-slate-500">This information appears across your learner account.</p></div></div>
							<form onSubmit={saveProfile} className="mt-7 space-y-5">
								<label className="block"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Full name</span><input value={fullName} onChange={(event) => { setFullName(event.target.value); setError(""); }} autoComplete="name" className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10" />{error && <span className="mt-2 block text-xs font-semibold text-red-600">{error}</span>}</label>
								<label className="block"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Email address</span><input value={user.email} readOnly aria-describedby="email-note" className="mt-2 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-500 outline-none" /><span id="email-note" className="mt-2 block text-xs text-slate-400">Email changes are managed by support.</span></label>
								<div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5"><p className={`text-sm font-bold text-emerald-600 transition-opacity ${saved ? "opacity-100" : "opacity-0"}`} aria-live="polite"><Check className="mr-1 inline h-4 w-4" />Changes saved</p><button type="submit" className="rounded-lg bg-[#102a43] px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-4 focus:ring-orange-100">Save changes</button></div>
							</form>
						</section>

						<section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
							<div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600"><Bell className="h-5 w-5" /></div><div><h2 className="text-lg font-black text-slate-950">Learning preferences</h2><p className="mt-1 text-sm text-slate-500">Choose the updates that help you keep moving.</p></div></div>
							<div className="mt-7 divide-y divide-slate-100">{preferences.map(({ key, label, description, icon: Icon }) => <div key={key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"><div className="flex min-w-0 items-center gap-3"><div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 sm:flex"><Icon className="h-4 w-4" /></div><div><p className="text-sm font-bold text-slate-900">{label}</p><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div></div><button type="button" role="switch" aria-checked={settings[key]} aria-label={label} onClick={() => togglePreference(key)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-orange-100 ${settings[key] ? "bg-orange-500" : "bg-slate-300"}`}><span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${settings[key] ? "translate-x-6" : "translate-x-1"}`} /></button></div>)}</div>
						</section>
					</div>

					<aside className="space-y-6"><section className="rounded-2xl bg-slate-950 p-6 text-white shadow-lg"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-cyan-300"><LockKeyhole className="h-5 w-5" /></div><h2 className="mt-5 text-xl font-black">Account security</h2><p className="mt-2 text-sm leading-6 text-slate-300">Your account is protected with your registered email address.</p><button type="button" className="mt-6 flex w-full items-center justify-between rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-left text-sm font-bold text-white transition hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-cyan-400/20"><span>Change password</span><ChevronRight className="h-4 w-4 text-slate-400" /></button></section><section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><CircleHelp className="h-6 w-6 text-orange-500" /><p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Need a hand?</p><h2 className="mt-2 text-lg font-black text-slate-950">We are here to help</h2><p className="mt-2 text-sm leading-6 text-slate-500">Questions about your courses or account? Our support team can help.</p><button type="button" className="mt-5 text-sm font-bold text-orange-600 transition hover:text-orange-700 focus:outline-none">Visit help center <ChevronRight className="ml-1 inline h-4 w-4" /></button></section></aside>
				</div>
			</div>
		</DashboardLayout>
	);
}
