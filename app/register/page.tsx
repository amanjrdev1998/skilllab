"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  ArrowRight,
  Check,
  Code2,
  Copy,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

type FormErrors = Partial<Record<"firstName" | "lastName" | "email" | "phone" | "password" | "confirmPassword" | "agreeToTerms", string>>;

type FieldProps = {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  error?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  inputClass: string;
  type?: string;
  icon?: React.ReactNode;
};

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ 
    firstName: "", 
    lastName: "", 
    email: "", 
    phone: "",
    password: "", 
    confirmPassword: "", 
    agreeToTerms: false 
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength = [
    formData.password.length >= 8,
    formData.password.length >= 12,
    /[A-Z]/.test(formData.password),
    /[0-9!@#$%^&*]/.test(formData.password),
  ].filter(Boolean).length * 25;

  const validateForm = () => {
    const nextErrors: FormErrors = {};
    if (!formData.firstName.trim()) nextErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) nextErrors.lastName = "Last name is required";
    if (!formData.email) nextErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) nextErrors.email = "Enter a valid email address";
    
    // Indian phone number validation
    if (!formData.phone.trim()) {
      nextErrors.phone = "Phone number is required";
    } else {
      const cleaned = formData.phone.replace(/\D/g, '');
      if (cleaned.length !== 10) {
        nextErrors.phone = "Enter a valid 10-digit Indian phone number";
      } else if (!/^[6-9]\d{9}$/.test(cleaned)) {
        nextErrors.phone = "Indian phone number must start with 6, 7, 8, or 9";
      }
    }
    
    if (!formData.password) nextErrors.password = "Password is required";
    else if (formData.password.length < 8) nextErrors.password = "Use at least 8 characters";
    else if (passwordStrength < 50) nextErrors.password = "Add uppercase letters, numbers, or symbols";
    if (!formData.confirmPassword) nextErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword) nextErrors.confirmPassword = "Passwords do not match";
    if (!formData.agreeToTerms) nextErrors.agreeToTerms = "Please accept the terms to continue";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    
    if (name === "phone") {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 10) {
        let formatted = cleaned;
        if (cleaned.length > 6) {
          formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        } else if (cleaned.length > 3) {
          formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
        } else {
          formatted = `(${cleaned}`;
        }
        setFormData((current) => ({ ...current, phone: formatted }));
      }
    } else {
      setFormData((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    }
    
    if (errors[name as keyof FormErrors]) {
      setErrors((current) => ({ ...current, [name]: undefined }));
    }
  };

  // Custom toast components
  const showErrorToast = (message: string) => {
    toast.custom((t) => (
      <div className={`max-w-md w-full bg-red-50 border border-red-200 shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 transition-all duration-300 ${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <X className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-red-800">Error</p>
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

  const showSuccessToast = (referralCode?: string) => {
    toast.custom((t) => (
      <div className={`max-w-md w-full bg-green-50 border border-green-200 shadow-lg rounded-xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 transition-all duration-300 ${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-semibold text-green-800">Registration Successful! 🎉</p>
              <p className="mt-1 text-sm text-green-700">Welcome to SkillLab!</p>
              {referralCode && (
                <div className="mt-3 bg-green-100 rounded-lg p-3">
                  <p className="text-xs font-medium text-green-700 uppercase tracking-wider">Your Referral Code</p>
                  <div className="flex items-center justify-between gap-3 mt-1">
                    <code className="text-lg font-mono font-bold text-green-800">
                      {referralCode}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(referralCode);
                        toast.success('Referral code copied!', {
                          duration: 2000,
                          icon: '📋',
                        });
                      }}
                      className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex border-l border-green-200">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              router.push("/user");
            }}
            className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-green-600 hover:text-green-500 hover:bg-green-50 focus:outline-none"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    ), {
      duration: 8000,
      position: "top-center",
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;
    
    setIsLoading(true);
    const loadingToast = toast.loading('Creating your account...');

    try {
      const response = await fetch("http://localhost:8000/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email: formData.email.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          password: formData.password,
        }),
      });
      
      const payload = await response.json();

      toast.dismiss(loadingToast);

      if (!response.ok || !payload.success) {
        showErrorToast(payload.message || "Registration failed. Please try again.");
        return;
      }

      // Success - show referral code if available
      showSuccessToast(payload.data?.referral_code);

      // Redirect after delay if user doesn't click "Go to Dashboard"
      setTimeout(() => {
        toast.dismiss();
        router.push("/user");
      }, 8000);

    } catch (error) {
      toast.dismiss(loadingToast);
      showErrorToast("Unable to reach the registration service. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = (field: keyof FormErrors) =>
    `w-full rounded-xl border bg-white px-4 py-3.5 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 ${errors[field] ? "border-red-400 ring-4 ring-red-50" : "border-zinc-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"}`;

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
      <main className="min-h-screen bg-[#f5f6fb] px-4 py-6 text-zinc-950 sm:px-6 sm:py-10">
        <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] lg:grid-cols-[0.92fr_1.08fr]">
          <section className="relative order-2 overflow-hidden bg-zinc-950 px-7 py-10 text-white sm:px-12 lg:order-1 lg:px-14 lg:py-14">
            <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-indigo-600/30 blur-3xl" />
            <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
            <div className="relative flex h-full flex-col">
              <Link href="/" className="text-2xl font-black tracking-[-0.08em]">SKILL<span className="text-indigo-400">LAB.</span></Link>
              <div className="mt-16 max-w-md lg:mt-auto">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200"><Sparkles className="h-3.5 w-3.5" /> Future-ready learning</div>
                <h2 className="max-w-sm text-4xl font-black leading-[0.98] tracking-[-0.05em] sm:text-5xl">Build skills that move you forward.</h2>
                <p className="mt-5 max-w-sm text-sm leading-6 text-zinc-400">Join a focused learning community built around practical projects, modern tools, and momentum.</p>
                <div className="relative mt-10 h-56 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-5">
                  <div className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500 shadow-lg shadow-indigo-500/30"><Sparkles className="h-6 w-6" /></div>
                  <div className="absolute -bottom-16 -right-12 h-48 w-48 rounded-full border-[24px] border-indigo-400/20" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Your learning path</p>
                  <div className="mt-8 flex items-end gap-3">{["h-16", "h-24", "h-20", "h-32", "h-28"].map((height, index) => <div key={height} className={`w-8 rounded-t-lg ${height} ${index === 3 ? "bg-indigo-400" : "bg-white/15"}`} />)}</div>
                  <div className="absolute bottom-5 right-5 text-right"><p className="text-2xl font-black">01</p><p className="text-[10px] uppercase tracking-widest text-zinc-500">Start today</p></div>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 text-xs text-zinc-400"><div><p className="text-2xl font-black text-white">10K+</p><p className="mt-1">Active learners</p></div><div><p className="text-2xl font-black text-white">4.9/5</p><p className="mt-1">Learner rating</p></div></div>
              </div>
              <p className="mt-10 text-xs text-zinc-500 lg:mt-12">Learn at your pace. Build something real.</p>
            </div>
          </section>

          <section className="order-1 px-7 py-10 sm:px-12 lg:order-2 lg:px-16 lg:py-14">
            <div className="mx-auto max-w-md">
              <div className="mb-9 flex items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Get started</p><h1 className="mt-3 text-4xl font-black tracking-[-0.05em]">Create your account.</h1><p className="mt-3 text-sm leading-6 text-zinc-500">Your next useful skill is closer than you think.</p></div><div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 sm:flex"><UserRound className="h-5 w-5" /></div></div>
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
               <div className="grid gap-4 sm:grid-cols-2">
                 <Field label="First name" name="firstName" value={formData.firstName} placeholder="John" error={errors.firstName} onChange={handleChange} inputClass={inputClass("firstName")} />
                 <Field label="Last name" name="lastName" value={formData.lastName} placeholder="Doe" error={errors.lastName} onChange={handleChange} inputClass={inputClass("lastName")} />
               </div>
               
               <Field 
                 label="Email address" 
                 name="email" 
                 type="email" 
                 value={formData.email} 
                 placeholder="john@example.com" 
                 error={errors.email} 
                 onChange={handleChange} 
                 inputClass={`${inputClass("email")} pl-11`} 
                 icon={<Mail className="h-4 w-4" />} 
               />
               
               <Field 
                 label="Phone number" 
                 name="phone" 
                 type="tel" 
                 value={formData.phone} 
                 placeholder="(XXX) XXX-XXXX" 
                 error={errors.phone} 
                 onChange={handleChange} 
                 inputClass={`${inputClass("phone")} pl-11`} 
                 icon={<Phone className="h-4 w-4" />} 
               />
               
               <PasswordField 
                 label="Password" 
                 name="password" 
                 value={formData.password} 
                 visible={showPassword} 
                 onToggle={() => setShowPassword((visible) => !visible)} 
                 error={errors.password} 
                 onChange={handleChange} 
                 inputClass={inputClass("password")} 
               />
               
                {formData.password && <div className="-mt-2"><div className="flex justify-between text-[11px] font-semibold text-zinc-500"><span>Password strength</span><span className={passwordStrength < 50 ? "text-orange-600" : passwordStrength < 100 ? "text-amber-600" : "text-emerald-600"}>{passwordStrength < 25 ? "Weak" : passwordStrength < 50 ? "Fair" : passwordStrength < 100 ? "Good" : "Strong"}</span></div><div className="mt-2 flex gap-1">{[25, 50, 75, 100].map((threshold) => <div key={threshold} className={`h-1.5 flex-1 rounded-full ${passwordStrength >= threshold ? (threshold === 100 ? "bg-emerald-500" : threshold >= 75 ? "bg-lime-500" : threshold >= 50 ? "bg-amber-400" : "bg-orange-400") : "bg-zinc-100"}`} />)}</div></div>}
                
                <PasswordField 
                  label="Confirm password" 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  visible={showConfirmPassword} 
                  onToggle={() => setShowConfirmPassword((visible) => !visible)} 
                  error={errors.confirmPassword} 
                  onChange={handleChange} 
                  inputClass={inputClass("confirmPassword")} 
                />
                
                <div><label className="flex items-start gap-3 text-xs leading-5 text-zinc-500"><input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleChange} className="mt-1 h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500" /><span>I agree to the <a href="/term-condition" className="font-semibold text-indigo-600 hover:text-indigo-700">Terms of Service</a> and <a href="/privacypolicy" className="font-semibold text-indigo-600 hover:text-indigo-700">Privacy Policy</a>.</span></label>{errors.agreeToTerms && <p className="mt-2 text-xs font-medium text-red-500">{errors.agreeToTerms}</p>}</div>
                
                <button type="submit" disabled={isLoading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-4 text-sm font-bold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60">
                  {isLoading ? "Creating your account..." : <>Create account <ArrowRight className="h-4 w-4" /></>}
                </button>
              </form>
              <div className="my-7 flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400"><div className="h-px flex-1 bg-zinc-200" />Or continue with<div className="h-px flex-1 bg-zinc-200" /></div>
              <div className="grid grid-cols-2 gap-3"><button type="button" aria-label="Continue with Google" className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"><span className="font-black text-red-500">G</span> Google</button><button type="button" aria-label="Continue with GitHub" className="flex items-center justify-center gap-2 rounded-xl border border-zinc-200 py-3 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"><Code2 className="h-4 w-4" /> GitHub</button></div>
              <p className="mt-8 text-center text-sm text-zinc-500">Already have an account? <a href="/user" className="font-bold text-indigo-600 hover:text-indigo-700">Sign in</a></p>
              <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-zinc-400"><ShieldCheck className="h-4 w-4 text-emerald-500" /> Your information is encrypted and secure</div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function Field({ label, name, value, placeholder, error, onChange, inputClass, type = "text", icon }: FieldProps) {
  return <div><label htmlFor={name} className="mb-2 block text-xs font-bold text-zinc-700">{label}</label><div className="relative">{icon && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">{icon}</span>}<input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} autoComplete={name === "email" ? "email" : name === "firstName" ? "given-name" : name === "lastName" ? "family-name" : name === "phone" ? "tel" : undefined} className={inputClass} /></div>{error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}</div>;
}

function PasswordField({ label, name, value, visible, onToggle, error, onChange, inputClass }: Omit<FieldProps, "placeholder" | "type" | "icon"> & { visible: boolean; onToggle: () => void }) {
  return <div><label htmlFor={name} className="mb-2 block text-xs font-bold text-zinc-700">{label}</label><div className="relative"><LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" /><input id={name} name={name} type={visible ? "text" : "password"} value={value} onChange={onChange} placeholder="At least 8 characters" autoComplete="new-password" className={`${inputClass} pl-11 pr-11`} /><button type="button" onClick={onToggle} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700">{visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>{error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}{name === "password" && value.length >= 8 && <p className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-600"><Check className="h-3 w-3" /> Good password length</p>}</div>;
}