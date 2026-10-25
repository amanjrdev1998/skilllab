"use client";

import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  PlayCircle,
  Users,
  X,
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;

const included = [
  "Lifetime access to every lesson",
  "Practical campaign projects and templates",
  "Certificate after successful completion",
  "Future course updates included",
];

type ApiCourse = {
  id: number | string;
  title: string;
  category: string;
  description: string;
  price: number | string;
  old_price: number | string | null;
  lessons_count: number;
  duration_hours: number | string;
  level: string;
  students_count: number;
  rating: number | string;
  badge: string | null;
  icon: string | null;
  gradient: string | null;
};

type CoursesResponse = {
  success: boolean;
  data?: { course?: ApiCourse };
};

type Product = {
  id: number;
  title: string;
  category: string;
  description: string;
  price: string;
  oldPrice: string;
  lessons: string;
  duration: string;
  level: string;
  students: string;
  rating: string;
  badge: string;
  icon: string;
  gradient: string;
};

const formatPrice = (price: number | string | null) =>
  price === null
    ? ""
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(Number(price));

const formatStudents = (students: number) =>
  students >= 1000
    ? `${(students / 1000).toFixed(1).replace(".0", "")}K`
    : String(students);

function normalizeCourse(course: ApiCourse): Product {
  return {
    id: Number(course.id),
    title: course.title,
    category: course.category,
    description: course.description,
    price: formatPrice(course.price),
    oldPrice: formatPrice(course.old_price),
    lessons: `${course.lessons_count} Lessons`,
    duration: `${course.duration_hours} Hours`,
    level: course.level,
    students: formatStudents(Number(course.students_count)),
    rating: String(course.rating),
    badge: course.badge ?? "COURSE",
    icon: course.icon ?? "📚",
    gradient: course.gradient ?? "from-blue-600 to-indigo-600",
  };
}

function ProductDetailsContent() {
  /*
   * IMPORTANT:
   * All React hooks must be INSIDE this component.
   */

  const router = useRouter();
  const searchParams = useSearchParams();

  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Product state
  const courseIdParam =
    searchParams.get("id") ?? searchParams.get("course");

  const selectedCourseId = Number(courseIdParam);

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [paymentUniqueKey, setPaymentUniqueKey] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentCurrency, setPaymentCurrency] = useState("USD");
  const [paymentError, setPaymentError] = useState("");
  const [isCapturingPayment, setIsCapturingPayment] = useState(false);

  /*
   * Check whether user is logged in
   */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    setIsLoggedIn(!!token && !!user);
    setIsCheckingAuth(false);
  }, []);

  /*
   * Load course
   */
  useEffect(() => {
    const loadProduct = async () => {
      if (
        !Number.isInteger(selectedCourseId) ||
        selectedCourseId < 1
      ) {
        setLoadError("A valid course id is required.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/v1/courses/${selectedCourseId}`,
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          setLoadError("Course not found.");
          setIsLoading(false);
          return;
        }

        const payload = (await response.json()) as CoursesResponse;

        const course = payload.data?.course;

        if (payload.success && course) {
          setProduct(normalizeCourse(course));
        } else {
          setLoadError("Course not found.");
        }
      } catch {
        setLoadError("Unable to load this course right now.");
      } finally {
        setIsLoading(false);
      }
    };

    void loadProduct();
  }, [selectedCourseId]);

  /*
   * Form submit
   */
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      setSubmitError("Your login session has expired. Please log in again.");
      return;
    }

    if (orderId && paymentUniqueKey) {
      setPaymentError("");
      setIsPaymentOpen(true);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await fetch("/api/v1/payments/paypal/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ course_id: product?.id }),
      });
      const payload = (await response.json()) as {
        success: boolean;
        message?: string;
        data?: {
          order_id?: string;
          unique_key?: string;
          amount?: string | number;
          currency?: string;
        };
      };

      if (!response.ok || !payload.success) {
        setSubmitError(payload.message ?? "Unable to create a PayPal order.");
        return;
      }

      const payment = payload.data;
      if (
        !payment?.order_id ||
        !payment.unique_key ||
        payment.amount === undefined ||
        !payment.currency
      ) {
        setSubmitError("The payment service returned incomplete order details.");
        return;
      }

      setOrderId(payment.order_id);
      setPaymentUniqueKey(payment.unique_key);
      setPaymentAmount(
        new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: payment.currency,
          maximumFractionDigits: 2,
        }).format(Number(payment.amount))
      );
      setPaymentCurrency(payment.currency);
      setPaymentError("");
      setIsPaymentOpen(true);
    } catch {
      setSubmitError("Unable to create a PayPal order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  /*
   * Loading course
   */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50" />
    );
  }

  /*
   * Course not found
   */
  if (!product || loadError) {
    return (
      <>
        <SiteHeader />

        <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 text-center">
          <div>
            <h1 className="text-2xl font-black text-slate-900">
              {loadError}
            </h1>

            <p className="mt-3 text-sm text-slate-500">
              Please return to the courses page and choose a valid course.
            </p>
          </div>
        </main>

        <SiteFooter />
      </>
    );
  }

  const productTitle = product.title;
  const productPrice = product.price;

  return (
    <>
      <SiteHeader />

      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 text-slate-900">

        {/* HERO */}
        <section className="border-b border-slate-200 bg-slate-950 text-white">
          <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
            <div className="max-w-3xl">

              <p className="mb-5 text-xs font-bold uppercase tracking-[0.2em] text-indigo-300">
                {product.category} / Product Details
              </p>

              <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                {productTitle}
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                Everything you need to turn paid social campaigns into a
                repeatable growth channel.
              </p>

            </div>
          </div>
        </section>

        {/* MAIN CONTENT */}
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 lg:grid-cols-[1fr_420px] lg:px-8 lg:py-16">

          {/* LEFT */}
          <section>

            {/* COURSE OVERVIEW */}
            <div
              className={`rounded-[28px] bg-gradient-to-br ${product.gradient} p-8 text-white shadow-xl sm:p-10`}
            >

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
                <BookOpen className="h-8 w-8" />
              </div>

              <p className="mt-12 text-sm font-bold uppercase tracking-[0.18em] text-indigo-100">
                Course overview
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Learn the skills that move the numbers.
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/85 sm:text-base">
                {product.description}
              </p>

              <div className="mt-8 grid gap-4 border-t border-white/20 pt-6 sm:grid-cols-3">

                <div className="flex items-center gap-3">
                  <PlayCircle className="h-5 w-5 text-cyan-200" />

                  <span className="text-sm font-semibold">
                    {product.lessons}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Clock3 className="h-5 w-5 text-cyan-200" />

                  <span className="text-sm font-semibold">
                    {product.duration}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-cyan-200" />

                  <span className="text-sm font-semibold">
                    {product.students} learners
                  </span>
                </div>

              </div>
            </div>

            {/* WHAT YOU GET */}
            <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm sm:p-9">

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">
                What you get
              </p>

              <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">
                A practical path from idea to execution.
              </h2>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">

                {included.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />

                    <span>{item}</span>
                  </div>
                ))}

              </div>
            </div>
          </section>

          {/* RIGHT - ENROLLMENT */}
          <section
            id="enrolForm"
            className="relative h-fit overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl sm:p-8 lg:sticky lg:top-28"
          >

            {/* FORM HEADER */}
            <div className="flex items-end justify-between border-b border-slate-200 pb-5">

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Enrollment form
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Your basic details
                </h2>
              </div>

              <p className="text-2xl font-black text-indigo-600">
                {productPrice}
              </p>

            </div>

            {/* AUTH CHECK */}
            {isCheckingAuth ? (

              <div className="flex min-h-[450px] items-center justify-center">

                <div className="text-center">

                  <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

                  <p className="mt-3 text-sm font-medium text-slate-500">
                    Checking login...
                  </p>

                </div>

              </div>

            ) : isLoggedIn ? (

              /*
               * USER IS LOGGED IN
               */
              isSubmitted ? (

                <div className="py-12 text-center">

                  <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />

                  <h3 className="mt-5 text-xl font-black">
                    Enrollment created
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Your enrollment is pending payment. Complete payment using
                    the QR code to continue.
                  </p>

                </div>

              ) : (

                <form
                  onSubmit={handleSubmit}
                  className="mt-6 space-y-4"
                >

                  {/* NAME */}
                  <div>

                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Full name
                    </label>

                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      placeholder="Your full name"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                  </div>

                  {/* EMAIL */}
                  <div>

                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Email address
                    </label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                  </div>

                  {/* COURSE */}
                  <div>

                    <label
                      htmlFor="course-name"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Course name
                    </label>

                    <input
                      id="course-name"
                      name="courseName"
                      type="text"
                      value={productTitle}
                      readOnly
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 outline-none"
                    />

                  </div>

                  {/* AMOUNT */}
                  <div>

                    <label
                      htmlFor="amount"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Amount
                    </label>

                    <input
                      id="amount"
                      name="amount"
                      type="text"
                      value={productPrice}
                      readOnly
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none"
                    />

                  </div>

                  {/* CONTACT */}
                  <div>

                    <label
                      htmlFor="contact"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Contact number
                    </label>

                    <input
                      id="contact"
                      name="contact"
                      type="tel"
                      autoComplete="tel"
                      required
                      placeholder="10-digit contact number"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                  </div>

                  {/* ADDRESS */}
                  <div>

                    <label
                      htmlFor="address"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Address
                    </label>

                    <textarea
                      id="address"
                      name="address"
                      rows={3}
                      autoComplete="street-address"
                      required
                      placeholder="Your address"
                      className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    />

                  </div>

                  {/* SUBMIT */}
                  <button id="paybutton"
                    type="submit"
                    disabled={isSubmitting || isSubmitted}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting
                      ? "Preparing PayPal..."
                      : isSubmitted
                        ? "Payment complete"
                        : "Continue to PayPal"}

                    <ArrowRight className="h-4 w-4" />
                  </button>

                  {submitError && (
                    <p role="alert" className="text-sm font-medium text-red-600">
                      {submitError}
                    </p>
                  )}

                </form>
              )

            ) : (

              /*
               * USER IS NOT LOGGED IN
               */
              <div className="relative mt-6 overflow-hidden rounded-2xl">

                {/* BLURRED FORM PREVIEW */}
                <div className="pointer-events-none select-none blur-[5px]">

                  <div className="space-y-4">

                    <div>
                      <div className="mb-2 h-4 w-24 rounded bg-slate-200" />
                      <div className="h-12 rounded-xl border border-slate-200 bg-slate-50" />
                    </div>

                    <div>
                      <div className="mb-2 h-4 w-32 rounded bg-slate-200" />
                      <div className="h-12 rounded-xl border border-slate-200 bg-slate-50" />
                    </div>

                    <div>
                      <div className="mb-2 h-4 w-28 rounded bg-slate-200" />
                      <div className="h-12 rounded-xl border border-slate-200 bg-slate-50" />
                    </div>

                    <div>
                      <div className="mb-2 h-4 w-20 rounded bg-slate-200" />
                      <div className="h-12 rounded-xl border border-slate-200 bg-slate-50" />
                    </div>

                    <div>
                      <div className="mb-2 h-4 w-32 rounded bg-slate-200" />
                      <div className="h-12 rounded-xl border border-slate-200 bg-slate-50" />
                    </div>

                    <div>
                      <div className="mb-2 h-4 w-20 rounded bg-slate-200" />
                      <div className="h-24 rounded-xl border border-slate-200 bg-slate-50" />
                    </div>

                    <div className="h-12 rounded-xl bg-slate-900" />

                  </div>
                </div>

                {/* LOGIN OVERLAY */}
                <div className="absolute inset-0 flex items-center justify-center bg-white/60 p-6 backdrop-blur-[2px]">

                  <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white/95 p-7 text-center shadow-2xl">

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">

                      <svg
                        className="h-7 w-7 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10 17l5-5-5-5"
                        />

                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12H3"
                        />

                      </svg>

                    </div>

                    <h3 className="mt-5 text-xl font-black text-slate-900">
                      Login Required
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      Please login or create an account before enrolling in
                      this course.
                    </p>

                    <button
                      type="button"
                      onClick={() => router.push("/user")}
                      className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-600"
                    >
                      Login / Register

                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <p className="mt-4 text-xs text-slate-400">
                      Already have an account? Login to continue enrollment.
                    </p>

                  </div>
                </div>
              </div>
            )}

          </section>
        </div>

        {isPaymentOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="payment-modal-title"
              className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id="payment-modal-title" className="text-2xl font-black text-slate-900">
                    Complete your payment
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Pay {paymentAmount || productPrice} for {productTitle}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPaymentOpen(false)}
                  aria-label="Close payment dialog"
                  className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6">
                {paypalClientId ? (
                  <PayPalScriptProvider
                    options={{
                      clientId: paypalClientId,
                      currency: paymentCurrency,
                    }}
                  >
                    <PayPalButtons
                      style={{ layout: "vertical", shape: "rect" }}
                      createOrder={() => Promise.resolve(orderId)}
                      onApprove={async (data) => {
                        if (data.orderID !== orderId) {
                          setPaymentError("The approved PayPal order did not match this payment.");
                          return;
                        }

                        const token = localStorage.getItem("token");
                        if (!token) {
                          setPaymentError("Your login session has expired. Please log in again.");
                          return;
                        }

                        setIsCapturingPayment(true);
                        setPaymentError("");
                        try {
                          const response = await fetch(
                            "/api/v1/payments/paypal/capture",
                            {
                              method: "POST",
                              headers: {
                                Authorization: `Bearer ${token}`,
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                unique_key: paymentUniqueKey,
                              }),
                            }
                          );
                          const payload = (await response.json()) as {
                            success: boolean;
                            message?: string;
                            data?: { status?: string };
                          };

                          if (!response.ok || !payload.success) {
                            setPaymentError(
                              payload.message ?? "Unable to confirm your PayPal payment."
                            );
                            return;
                          }

                          setIsSubmitted(true);
                          setIsPaymentOpen(false);
                        } catch {
                          setPaymentError(
                            "Unable to confirm your PayPal payment. Please try again."
                          );
                        } finally {
                          setIsCapturingPayment(false);
                        }
                      }}
                      onError={(error) => {
                        console.error("PayPal checkout failed:", error);
                        setPaymentError("PayPal checkout failed. Please try again.");
                      }}
                    />
                  </PayPalScriptProvider>
                ) : (
                  <p role="alert" className="text-sm font-medium text-red-600">
                    PayPal is not configured. Please contact support.
                  </p>
                )}
              </div>

              {isCapturingPayment && (
                <p role="status" className="mt-4 text-center text-sm text-slate-600">
                  Confirming your payment...
                </p>
              )}

              {paymentError && (
                <p role="alert" className="mt-4 text-center text-sm font-medium text-red-600">
                  {paymentError}
                </p>
              )}

              <p className="mt-3 text-center text-xs font-semibold text-slate-600">
                Order ID: <span className="font-mono text-indigo-700">{orderId}</span>
              </p>
            </section>
          </div>
        )}
      </main>

      <SiteFooter />
    </>
  );
}

export default function ProductDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50" />
      }
    >
      <ProductDetailsContent />
    </Suspense>
  );
}