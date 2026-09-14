'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
	Bell,
	Check,
	Clock3,
	LockKeyhole,
	MonitorCog,
	Save,
	ShieldCheck,
	SlidersHorizontal,
	TriangleAlert,
} from 'lucide-react';

type User = { name: string; email: string };

type AdminSettings = {
	emailAlerts: boolean;
	weeklyDigest: boolean;
	quietHours: boolean;
	maintenanceMode: boolean;
};

const defaultSettings: AdminSettings = {
	emailAlerts: true,
	weeklyDigest: true,
	quietHours: false,
	maintenanceMode: false,
};

function readUser(): User {
	try {
		const savedUser = localStorage.getItem('userData');
		const parsedUser = savedUser ? JSON.parse(savedUser) : null;
		return parsedUser?.name && parsedUser?.email ? parsedUser : { name: 'Admin', email: 'admin@skilllab.com' };
	} catch {
		return { name: 'Admin', email: 'admin@skilllab.com' };
	}
}

export default function AdminSettingsPage() {
	const [user, setUser] = useState<User | null>(null);
	const [settings, setSettings] = useState<AdminSettings>(defaultSettings);
	const [saved, setSaved] = useState(false);

	useEffect(() => {
		const timeoutId = window.setTimeout(() => {
			setUser(readUser());
			try {
				const savedSettings = localStorage.getItem('skilllab-admin-settings');
				if (savedSettings) setSettings({ ...defaultSettings, ...JSON.parse(savedSettings) });
			} catch {
				setSettings(defaultSettings);
			}
		}, 0);

		return () => window.clearTimeout(timeoutId);
	}, []);

	const updateSetting = (key: keyof AdminSettings, value: boolean) => {
		setSettings((current) => ({ ...current, [key]: value }));
		setSaved(false);
	};

	const saveSettings = () => {
		localStorage.setItem('skilllab-admin-settings', JSON.stringify(settings));
		setSaved(true);
		window.setTimeout(() => setSaved(false), 2800);
	};

	if (!user) {
		return <div className="flex min-h-screen items-center justify-center bg-slate-50"><div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" /></div>;
	}

	return (
		<AdminLayout user={user}>
			<div className="mx-auto max-w-6xl space-y-6">
				<section className="flex flex-col justify-between gap-5 rounded-2xl bg-gradient-to-br from-[#101827] via-[#19233b] to-[#334155] p-6 text-white shadow-lg sm:flex-row sm:items-end sm:p-8">
					<div><p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">Control center</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Admin settings</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Shape how your team receives updates and how the learning workspace behaves.</p></div>
					<div className="flex items-center gap-3 text-xs font-bold text-slate-300"><span className="h-2.5 w-2.5 rounded-full bg-emerald-400" /> Workspace operational</div>
				</section>

				<section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
					<div className="space-y-6">
						<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
							<div className="flex items-start gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><Bell className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-600">Notifications</p><h2 className="mt-1 text-xl font-black text-slate-950">Keep the team in sync</h2><p className="mt-1 text-sm text-slate-500">Choose which operational updates reach your inbox.</p></div></div>
							<div className="mt-6 divide-y divide-slate-100"><SettingToggle label="Operational email alerts" description="New enrollments, refunds, and support requests" checked={settings.emailAlerts} onChange={(value) => updateSetting('emailAlerts', value)} /><SettingToggle label="Weekly performance digest" description="A Monday summary of course and student health" checked={settings.weeklyDigest} onChange={(value) => updateSetting('weeklyDigest', value)} /></div>
						</div>

						<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
							<div className="flex items-start gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600"><Clock3 className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">Team focus</p><h2 className="mt-1 text-xl font-black text-slate-950">Quiet hours</h2><p className="mt-1 text-sm text-slate-500">Pause non-critical alerts between 10:00 PM and 7:00 AM.</p></div></div>
							<SettingToggle label="Enable quiet hours" description="Critical security and payment alerts will still come through" checked={settings.quietHours} onChange={(value) => updateSetting('quietHours', value)} />
						</div>
					</div>

					<div className="space-y-6">
						<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
							<div className="flex items-start gap-4"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><MonitorCog className="h-5 w-5" /></div><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Workspace mode</p><h2 className="mt-1 text-xl font-black text-slate-950">Maintenance access</h2><p className="mt-1 text-sm text-slate-500">Temporarily pause student access while you make changes.</p></div></div>
							<div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4"><div className="flex gap-3"><TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" /><p className="text-xs leading-5 text-amber-800">Use this only during scheduled updates. Active learners will see a maintenance notice.</p></div></div>
							<SettingToggle label="Maintenance mode" description="Student-facing pages become temporarily unavailable" checked={settings.maintenanceMode} onChange={(value) => updateSetting('maintenanceMode', value)} warning />
						</div>

						<div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm"><div className="flex items-start gap-4"><ShieldCheck className="h-6 w-6 text-orange-400" /><div><h2 className="font-black">Admin-only controls</h2><p className="mt-2 text-sm leading-6 text-slate-400">Your workspace settings are stored locally on this device and only available to the administrator session.</p></div></div><div className="mt-5 flex items-center gap-2 text-xs font-bold text-emerald-300"><LockKeyhole className="h-4 w-4" /> Protected configuration</div></div>
					</div>
				</section>

				<div className="sticky bottom-4 flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur sm:px-6"><div className="flex items-center gap-2 text-sm font-semibold text-slate-500"><SlidersHorizontal className="h-4 w-4" /> {saved ? 'Settings saved successfully' : 'Unsaved changes stay on this page'}</div><button type="button" onClick={saveSettings} className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-orange-400"><Save className="h-4 w-4" /> Save changes</button></div>
			</div>
		</AdminLayout>
	);
}

function SettingToggle({ label, description, checked, onChange, warning = false }: { label: string; description: string; checked: boolean; onChange: (value: boolean) => void; warning?: boolean }) {
	return <div className="mt-5 flex items-center justify-between gap-4"><div><p className={`text-sm font-bold ${warning && checked ? 'text-red-700' : 'text-slate-900'}`}>{label}</p><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div><button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={`relative h-7 w-12 shrink-0 rounded-full p-1 transition ${checked ? (warning ? 'bg-red-500' : 'bg-orange-500') : 'bg-slate-200'}`}><span className={`flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`}>{checked && <Check className="h-3 w-3 text-slate-700" />}</span></button></div>;
}
