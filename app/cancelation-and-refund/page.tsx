import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const policies = [
  {
    number: "01",
    title: "One-Time Payment",
    text:
      "All courses available on this platform are purchased through a single, one-time payment. There are no recurring subscriptions, monthly charges, or automatic renewals associated with your course purchase.",
  },
  {
    number: "02",
    title: "Non-Refundable Purchase",
    text:
      "Once payment has been successfully completed and course access has been provided, the purchase is considered final and non-refundable. No refund will be issued after the payment is completed and access is granted.",
  },
  {
    number: "03",
    title: "No Cancellation After Purchase",
    text:
      "Because our courses are digital products and access may be provided immediately after payment, orders cannot be cancelled once the payment has been successfully processed.",
  },
  {
    number: "04",
    title: "Course Access",
    text:
      "After successful payment, you will receive access to the purchased course through the learning platform. The course content is provided for your personal educational use.",
  },
  {
    number: "05",
    title: "Before You Purchase",
    text:
      "We encourage you to carefully review the course description, syllabus, features, pricing, and other available information before completing your purchase. By proceeding with payment, you confirm that you understand and accept this Cancellation and Refund Policy.",
  },
  {
    number: "06",
    title: "Payment Issues",
    text:
      "If your payment was deducted but course access was not successfully provided due to a technical issue, please contact our support team with the relevant transaction details. We will review the payment and access status and assist with the issue.",
  },
];

export default function CancellationAndRefundPage() {
  return (
    <>
      <SiteHeader />

      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 text-slate-800">
        {/* Hero */}
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
                Cancellation & Refund
              </div>

              <h1 className="text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Cancellation &{" "}
                <span className="text-orange-600">Refund Policy</span>
              </h1>

              <p className="mt-6 text-base leading-8 text-slate-600 sm:text-lg">
                Please read this policy carefully before purchasing any course
                or digital learning product from our platform.
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          {/* Important Notice */}
          <section className="relative overflow-hidden rounded-[28px] border-2 border-red-200 bg-red-50 p-6 sm:p-8">
            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-red-100" />

            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-xl text-white">
                  !
                </div>

                <div>
                  <h2 className="text-xl font-black text-red-800 sm:text-2xl">
                    Important Refund Notice
                  </h2>

                  <p className="mt-3 text-sm leading-7 text-red-800 sm:text-base">
                    All course purchases are{" "}
                    <strong>NON-REFUNDABLE</strong>. Your payment is a{" "}
                    <strong>ONE-TIME PAYMENT</strong> and is not a recurring
                    subscription. Once payment is successfully completed and
                    access to the digital course is granted, the purchase is
                    final and cannot be cancelled or refunded.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Policy Summary */}
          <section className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-3xl">💳</div>

              <h3 className="mt-4 text-lg font-bold text-slate-950">
                One-Time Payment
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Pay once and receive access to the course. There are no
                recurring monthly or yearly charges.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="text-3xl">🚫</div>

              <h3 className="mt-4 text-lg font-bold text-slate-950">
                No Refunds
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Once your payment is completed and course access is granted,
                the purchase is final and non-refundable.
              </p>
            </div>
          </section>

          {/* Policy Details */}
          <section className="mt-12">
            <div className="mb-8">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
                Policy Details
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                Our Cancellation & Refund Terms
              </h2>
            </div>

            <div className="space-y-5">
              {policies.map((policy) => (
                <article
                  key={policy.number}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-7"
                >
                  <div className="flex gap-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-sm font-black text-orange-700">
                      {policy.number}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-950 sm:text-xl">
                        {policy.title}
                      </h3>

                      <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                        {policy.text}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Final Policy */}
          <section className="mt-12 rounded-[28px] bg-slate-950 p-7 text-white sm:p-9">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
                Final Sale Policy
              </p>

              <h2 className="mt-3 text-2xl font-black sm:text-3xl">
                Please make your purchase carefully.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base">
                By completing a purchase on this platform, you acknowledge
                that you have reviewed the course information and agree that
                the payment is a one-time, non-refundable purchase. Once course
                access has been granted, no cancellation or refund will be
                provided.
              </p>
            </div>
          </section>

          {/* Support */}
          <section className="mt-8 rounded-3xl border border-orange-200 bg-orange-50 p-6 sm:p-8">
            <h2 className="text-xl font-black text-slate-950">
              Need Help With Your Payment?
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              If you have experienced a technical issue where your payment was
              successfully deducted but your course access was not provided,
              please contact our support team. We will verify the transaction
              and help resolve the access issue.
            </p>
          </section>

          {/* Footer Meta */}
          <div className="mt-10 flex flex-col justify-between gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center">
            <p>Last Updated: 02 September 2026</p>

            <a
              href="/"
              className="font-semibold text-orange-600 transition hover:text-orange-700"
            >
              Back to Home →
            </a>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
