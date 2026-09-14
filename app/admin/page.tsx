'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Truck,
  RotateCcw,
  Shield,
  ArrowRight,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!validateForm()) return;

    setIsLoading(true);

    setTimeout(() => {
      try {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem(
          'userData',
          JSON.stringify({
            name: formData.email.split('@')[0],
            email: formData.email,
          })
        );

        setIsLoading(false);
        setSuccessMessage('Login successful! Redirecting...');

        setTimeout(() => {
          router.push('/dashboard');
        }, 1200);
      } catch {
        setIsLoading(false);
      }
    }, 900);
  };

  const handleSocialLogin = async (provider: string) => {
    setSocialLoading(provider);
    setTimeout(() => {
      setSocialLoading(null);
      setSuccessMessage(`${provider} login coming soon!`);
      setTimeout(() => setSuccessMessage(''), 2500);
    }, 900);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const features = [
    { icon: <Truck className="h-5 w-5 sm:h-6 sm:w-6" />, title: 'Fast Delivery', text: '2-3 business days' },
    { icon: <RotateCcw className="h-5 w-5 sm:h-6 sm:w-6" />, title: 'Easy Returns', text: '30-day return policy' },
    { icon: <Shield className="h-5 w-5 sm:h-6 sm:w-6" />, title: 'Secure Payment', text: 'SSL encrypted' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f5f7] p-3 sm:p-4 lg:p-6">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-7xl overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[1.1fr_0.9fr]">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#0b1020] via-[#1a1124] to-[#111827] p-8 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-red-500/15 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-orange-500/15 blur-3xl" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 backdrop-blur-sm">
              <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-red-400 to-orange-400" />
              <span className="text-sm font-bold tracking-[0.2em] text-white">SKILLLAB</span>
            </div>
          </div>

          <div className="relative z-10 max-w-xl">
            <h1 className="text-5xl font-black leading-[0.95] tracking-[-0.06em] text-white xl:text-[5rem]">
              Elevate Your
              <span className="mt-2 block bg-gradient-to-r from-red-400 via-orange-400 to-red-500 bg-clip-text text-transparent">
                Shopping
              </span>
              <span className="mt-2 block">Experience</span>
            </h1>

            <p className="mt-7 max-w-lg text-lg leading-8 text-slate-300">
              Join thousands of happy customers shopping premium collections with exclusive deals, rewards, and premium support.
            </p>

            <div className="mt-10 space-y-5">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-center gap-4 rounded-2xl border border-white/8 bg-white/3 p-3 backdrop-blur-sm transition-transform duration-300 hover:translate-x-1">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 text-red-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{feature.title}</h2>
                    <p className="text-sm text-slate-300">{feature.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-3 gap-4 border-t border-slate-700/60 pt-8">
            <div className="text-center">
              <p className="text-3xl font-black text-transparent bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text">50K+</p>
              <p className="mt-2 text-xs text-slate-400">Customers</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-transparent bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text">500+</p>
              <p className="mt-2 text-xs text-slate-400">Products</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-black text-transparent bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text">4.9★</p>
              <p className="mt-2 text-xs text-slate-400">Rating</p>
            </div>
          </div>
        </aside>

        <div className="relative overflow-hidden bg-gradient-to-br from-[#070d1e] via-[#101827] to-[#1a1221] p-5 sm:p-6 lg:hidden">
          <div className="absolute -right-14 -top-14 h-32 w-32 rounded-full bg-red-500/15 blur-2xl" />
          <div className="absolute -bottom-16 -left-12 h-32 w-32 rounded-full bg-orange-500/15 blur-2xl" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-gradient-to-r from-red-400 to-orange-400" />
              <span className="text-xs font-bold tracking-[0.2em] text-white">SKILLLAB</span>
            </div>
            <h1 className="mt-6 text-3xl font-black tracking-[-0.05em] text-white">Welcome Back</h1>
            <p className="mt-2 text-sm text-slate-300">Sign in to access premium shopping deals and fast delivery.</p>
          </div>
        </div>

        <main className="flex items-center justify-center bg-[#f8fafc] p-5 sm:p-8 lg:p-12">
          <div className="w-full max-w-md">
            {successMessage && (
              <div className="mb-6 flex items-start gap-3 rounded-2xl border-2 border-green-200 bg-green-50 p-4 text-green-800 shadow-sm">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <p className="text-sm font-semibold">{successMessage}</p>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-3xl font-black tracking-[-0.05em] text-slate-900 sm:text-4xl">Welcome Back</h2>
              <p className="mt-2 text-sm text-slate-600 sm:text-base">Sign in to your account to continue shopping</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800 sm:text-base">
                  <Mail className="h-4 w-4 text-red-500 sm:h-5 sm:w-5" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="your@email.com"
                    className={`w-full rounded-xl border-2 bg-white px-4 py-3.5 text-base text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-100 sm:py-4 ${
                      errors.email
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-slate-300 focus:border-red-500 focus:ring-red-500/15 hover:border-slate-400'
                    }`}
                  />
                  {!errors.email && formData.email && (
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                  )}
                </div>
                {errors.email && (
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800 sm:text-base">
                  <Lock className="h-4 w-4 text-red-500 sm:h-5 sm:w-5" />
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="••••••••"
                    className={`w-full rounded-xl border-2 bg-white px-4 py-3.5 pr-12 text-base text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-100 sm:py-4 ${
                      errors.password
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-slate-300 focus:border-red-500 focus:ring-red-500/15 hover:border-slate-400'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition-colors hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 flex items-center gap-2 text-sm font-medium text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-red-500 focus:ring-red-500/20"
                  />
                  Remember me
                </label>
                <a href="/forgot-password" className="text-sm font-bold text-red-600 transition-colors hover:text-red-700 hover:underline">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 px-5 py-4 text-base font-bold text-white shadow-lg shadow-red-500/20 transition-all duration-200 hover:brightness-110 focus:outline-none focus:ring-4 focus:ring-red-500/25 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                      <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" className="opacity-75" />
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#f8fafc] px-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                disabled={isLoading || socialLoading === 'Google'}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-all duration-200 hover:border-red-500 hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {socialLoading === 'Google' ? (
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" className="opacity-75" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                <span className="hidden sm:inline">Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('GitHub')}
                disabled={isLoading || socialLoading === 'GitHub'}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-all duration-200 hover:border-red-500 hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {socialLoading === 'GitHub' ? (
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor" className="opacity-75" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="hidden sm:inline">GitHub</span>
              </button>
            </div>

            <p className="mt-7 text-center text-sm text-slate-600 sm:text-base">
              Don&apos;t have an account?{' '}
              <a href="/register" className="font-bold text-red-600 transition-colors hover:text-red-700 hover:underline">
                Create one
              </a>
            </p>

            <div className="mt-8 rounded-2xl border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-green-100 p-1.5 text-green-600">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-900 sm:text-base">Your data is secure</p>
                  <p className="mt-1 text-xs text-green-700 sm:text-sm">
                    We use industry-leading encryption and security protocols to protect your information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
