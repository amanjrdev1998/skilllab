"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import AdminDashboard from "@/components/AdminDashboard";

type User = { name: string; email: string };

export default function AdminDashboardPage() {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const userData = localStorage.getItem("userData");
		const timeoutId = window.setTimeout(() => {
			try {
				const parsedUser = userData ? JSON.parse(userData) : null;
				setUser(parsedUser?.name && parsedUser?.email ? parsedUser : { name: "Admin", email: "admin@skilllab.com" });
			} catch {
				setUser({ name: "Admin", email: "admin@skilllab.com" });
			}
		}, 0);

		return () => window.clearTimeout(timeoutId);
	}, []);

	if (!user) {
		return <div className="flex min-h-screen items-center justify-center bg-slate-50"><div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-orange-500" /></div>;
	}

	return (
		<AdminLayout user={user}>
			<AdminDashboard />
		</AdminLayout>
	);
}
