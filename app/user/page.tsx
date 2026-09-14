"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import toast, { Toaster } from "react-hot-toast";

export default function UserLogin() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Custom error toast
	const showErrorToast = (message: string) => {
		toast.custom((t) => (
			<div className={`max-w-md w-full bg-red-50 border border-red-200 shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 transition-all duration-300 ${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
				<div className="flex-1 w-0 p-4">
					<div className="flex items-start">
						<div className="flex-shrink-0 pt-0.5">
							<div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
								<svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
								</svg>
							</div>
						</div>
						<div className="ml-3 flex-1">
							<p className="text-sm font-semibold text-red-800">Login Failed</p>
							<p className="mt-1 text-sm text-red-700">{message}</p>
						</div>
					</div>
				</div>
				<div className="flex border-l border-red-200">
					<button
						onClick={() => toast.dismiss(t.id)}
						className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 hover:bg-red-50 focus:outline-none"
					>
						Close
					</button>
				</div>
			</div>
		), {
			duration: 5000,
			position: "top-center",
		});
	};

	// Custom success toast
	const showSuccessToast = (userName?: string) => {
		toast.custom((t) => (
			<div className={`max-w-md w-full bg-green-50 border border-green-200 shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 transition-all duration-300 ${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
				<div className="flex-1 w-0 p-4">
					<div className="flex items-start">
						<div className="flex-shrink-0 pt-0.5">
							<div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
								<svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
							</div>
						</div>
						<div className="ml-3 flex-1">
							<p className="text-sm font-semibold text-green-800">Welcome Back! 🎉</p>
							<p className="mt-1 text-sm text-green-700">
								{userName ? `Hello ${userName}, glad to see you again!` : "Successfully logged in!"}
							</p>
							<p className="mt-1 text-xs text-green-600">Redirecting to dashboard...</p>
						</div>
					</div>
				</div>
				<div className="flex border-l border-green-200">
					<button
						onClick={() => {
							toast.dismiss(t.id);
							router.push("/user/dashboard");
						}}
						className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-green-600 hover:text-green-500 hover:bg-green-50 focus:outline-none"
					>
						Go to Dashboard
					</button>
				</div>
			</div>
		), {
			duration: 6000,
			position: "top-center",
		});
	};

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		if (!email || !password) {
			showErrorToast("Please enter your email and password to continue.");
			return;
		}

		if (!/^\S+@\S+\.\S+$/.test(email)) {
			showErrorToast("Please enter a valid email address.");
			return;
		}

		if (password.length < 8) {
			showErrorToast("Password must be at least 8 characters long.");
			return;
		}

		setIsLoading(true);
		const loadingToast = toast.loading('Signing you in...');

		try {
			const response = await fetch("http://localhost:8000/api/v1/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: email.trim(),
					password: password,
				}),
			});

			const payload = await response.json();

			toast.dismiss(loadingToast);

			if (!response.ok || !payload.success) {
				showErrorToast(payload.message || "Invalid email or password. Please try again.");
				setIsLoading(false);
				return;
			}

			// Store token, secret_key, and user data
			if (payload.data?.token && payload.data?.secret_key) {
				localStorage.setItem('token', payload.data.token);
				localStorage.setItem('secret_key', payload.data.secret_key);
				localStorage.setItem('user', JSON.stringify(payload.data.user));
				
				// Store expiration time
				if (payload.data?.expires_in) {
					const expiresAt = Date.now() + (payload.data.expires_in * 1000);
					localStorage.setItem('expires_at', expiresAt.toString());
				}
			}

			const userName = payload.data?.user?.name?.split(' ')[0] || '';
			showSuccessToast(userName);

			setTimeout(() => {
				toast.dismiss();
				router.push("/user/dashboard");
			}, 3000);

		} catch (error) {
			toast.dismiss(loadingToast);
			showErrorToast("Unable to reach the login service. Please check your connection.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			<Toaster 
				position="top-center"
				toastOptions={{
					duration: 5000,
					style: {
						background: 'transparent',
						boxShadow: 'none',
						padding: 0,
					},
				}}
			/>
			<SiteHeader />
			<main className="min-h-screen bg-[#f5f7f9] px-4 py-5 text-slate-900 sm:px-6 lg:px-10">
				<div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-6xl overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.12)] lg:grid-cols-[1.05fr_0.95fr]">
					<section className="relative hidden overflow-hidden bg-[#102a43] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
						<div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
						<div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-orange-400/20 blur-3xl" />
						<div className="absolute right-16 top-36 h-24 w-24 rotate-12 border border-white/10" />

						<a href="/" className="relative z-10 flex w-fit items-center gap-3 text-xl font-black tracking-[0.18em]">
							<span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#102a43]">
								<BookOpen className="h-5 w-5" />
							</span>
							SKILLLAB
						</a>

						<div className="relative z-10 max-w-lg">
							<p className="mb-5 text-sm font-bold uppercase tracking-[0.25em] text-cyan-300">Your next chapter starts here</p>
							<h1 className="text-5xl font-black leading-[0.98] tracking-[-0.06em] xl:text-6xl">
								Learn skills that move your career forward.
							</h1>
							<p className="mt-6 max-w-md text-base leading-7 text-slate-300">
								Access practical courses in Facebook Ads, Instagram Ads, AI Automation, and Cloud AI Agents from one focused learning space.
							</p>

							<div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/15 pt-6">
								<div>
									<p className="text-2xl font-black">18K+</p>
									<p className="mt-1 text-xs text-slate-300">Learners</p>
								</div>
								<div>
									<p className="text-2xl font-black">4.9/5</p>
									<p className="mt-1 text-xs text-slate-300">Course rating</p>
								</div>
								<div>
									<p className="text-2xl font-black">24/7</p>
									<p className="mt-1 text-xs text-slate-300">Access</p>
								</div>
							</div>
						</div>

						<p className="relative z-10 text-xs text-slate-400">Build momentum. Practice daily. Grow with confidence.</p>
					</section>

					<section className="flex items-center justify-center bg-white px-5 py-10 sm:px-10 lg:px-14">
						<div className="w-full max-w-md">
							<div className="mb-8 lg:hidden">
								<a href="/" className="flex w-fit items-center gap-2 text-lg font-black tracking-[0.18em] text-[#102a43]">
									<span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#102a43] text-white"><BookOpen className="h-4 w-4" /></span>
									SKILLLAB
								</a>
							</div>

							<div className="mb-8">
								<p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-orange-600">Student portal</p>
								<h2 className="text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">Welcome back.</h2>
								<p className="mt-3 text-sm leading-6 text-slate-500">Sign in to continue your learning journey.</p>
							</div>

							<form onSubmit={handleSubmit} className="space-y-5">
								<div>
									<label htmlFor="user-email" className="mb-2 block text-sm font-bold text-slate-700">Email address</label>
									<div className="relative">
										<Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
										<input
											id="user-email"
											type="email"
											value={email}
											onChange={(event) => setEmail(event.target.value)}
											placeholder="you@example.com"
											autoComplete="email"
											disabled={isLoading}
											className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60"
										/>
									</div>
								</div>

								<div>
									<div className="mb-2 flex items-center justify-between gap-3">
										<label htmlFor="user-password" className="block text-sm font-bold text-slate-700">Password</label>
										<a href="/forgot-password" className="text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline">Forgot password?</a>
									</div>
									<div className="relative">
										<LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
										<input
											id="user-password"
											type={showPassword ? "text" : "password"}
											value={password}
											onChange={(event) => setPassword(event.target.value)}
											placeholder="Enter your password"
											autoComplete="current-password"
											disabled={isLoading}
											className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3.5 pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-500 focus:bg-white focus:ring-4 focus:ring-orange-500/10 disabled:opacity-60"
										/>
										<button 
											type="button" 
											onClick={() => setShowPassword((value) => !value)} 
											aria-label={showPassword ? "Hide password" : "Show password"} 
											className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:text-slate-700"
											disabled={isLoading}
										>
											{showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
										</button>
									</div>
								</div>

								<label className="flex items-center gap-3 text-sm text-slate-600">
									<input 
										type="checkbox" 
										checked={rememberMe} 
										onChange={(event) => setRememberMe(event.target.checked)} 
										disabled={isLoading}
										className="h-4 w-4 rounded border-slate-300 accent-orange-500" 
									/>
									Remember me on this device
								</label>

								<button 
									type="submit" 
									disabled={isLoading}
									className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#102a43] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-slate-900/15 transition hover:bg-[#183d5d] focus:outline-none focus:ring-4 focus:ring-[#102a43]/20 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{isLoading ? (
										<>
											<svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
												<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
											</svg>
											Signing in...
										</>
									) : (
										<>
											Sign in to SkillLab <ArrowRight className="h-4 w-4" />
										</>
									)}
								</button>
							</form>

							<div className="mt-8 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
								<ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
								<p className="text-xs leading-5 text-emerald-800">Your account and course progress are protected with secure sign-in.</p>
							</div>

							<p className="mt-7 text-center text-sm text-slate-500">New to SkillLab? <a href="/register" className="font-bold text-orange-600 hover:text-orange-700 hover:underline">Create an account</a></p>
						</div>
					</section>
				</div>
			</main>
			<SiteFooter />
		</>
	);
}