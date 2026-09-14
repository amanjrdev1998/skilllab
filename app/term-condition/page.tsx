import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const terms = [
  {
    title: "1. Introduction",
    text:
      "These Terms and Conditions govern the purchase, access, and use of all digital learning products, programs, courses, templates, and resources sold through this platform. Our goal is to help learners grow their career, sharpen their skills, and build real-world digital expertise in marketing, AI, automation, and business growth.",
  },
  {
    title: "2. Digital Product Policy",
    text:
      "All products sold on this website are digital products. They are delivered instantly or through a secure learning portal after successful payment. There are no physical goods shipped, no printed materials, and no return delivery required.",
  },
  {
    title: "3. NON-REFUNDABLE COURSE POLICY",
    text:
      "This course is a NON-REFUNDABLE digital product. Once payment is made and access is granted, no refund or chargeback will be issued for any reason, including if the learner changes their mind, feels the course is not suitable, or does not complete the program. By purchasing, the learner confirms they understand and accept this policy before accessing the course content.",
  },
  {
    title: "4. Course Access and Usage",
    text:
      "Access to the course is provided to the buyer only for personal educational use. Sharing login credentials, redistributing files, reselling content, or using the course for commercial purposes without written permission is strictly prohibited.",
  },
  {
    title: "5. Career Growth and Educational Purpose",
    text:
      "The course is designed to help individuals improve skills, grow their career, and strengthen their professional opportunities in digital marketing, AI, automation, and online business. We do not promise guaranteed employment, income, business success, or specific financial results. Results depend on the learner’s effort, consistency, discipline, and external factors.",
  },
  {
    title: "6. Intellectual Property",
    text:
      "All course materials, videos, slides, templates, documents, and related content are protected by copyright and intellectual property laws. You may not copy, reproduce, upload, sell, or distribute any part of the course without prior written permission from the owner.",
  },
  {
    title: "7. Payment and Enrollment",
    text:
      "Enrollment requires successful payment. Once the transaction is completed and access is granted, the course becomes active immediately. We reserve the right to suspend or revoke access in cases of misuse, fraud, chargeback activity, or violation of these terms.",
  },
  {
    title: "8. No Guarantees",
    text:
      "We provide educational content and tools to support growth, but we do not guarantee specific outcomes, rankings, ROAS, business improvement, or job placement. Learning outcomes vary by individual circumstances and commitment.",
  },
  {
    title: "9. Limitation of Liability",
    text:
      "We are not liable for indirect, incidental, or consequential damages arising from the use of our products or services. Our liability is limited to the purchase value of the relevant digital product, if any applicable legal remedy exists.",
  },
  {
    title: "10. Updates and Changes",
    text:
      "We may update these Terms and Conditions at any time without prior notice. Continued use of the platform after changes are published means you accept the updated version of the terms.",
  },
  {
    title: "11. Contact Information",
    text:
      "For questions regarding these Terms and Conditions, course access, or purchase information, you may contact us through the support contact provided on the website. Please read this document carefully before enrolling.",
  },
];

export default function TermsAndConditionPage() {
  return (
    <>
     
      <SiteHeader />


      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 text-slate-800">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-8 lg:p-12">

            {/* Header */}
            <div className="mb-10 border-b border-slate-200 pb-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-orange-700">
                Legal Policy
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Terms and Conditions
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                These terms explain the rights, responsibilities, and digital
                course policies for our online education platform. Our mission
                is to help students grow their careers and skills through
                practical, results-driven learning.
              </p>
            </div>

            {/* Terms */}
            <div className="space-y-7">
              {terms.map((item) => (
                <section
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6"
                >
                  <h2 className="mb-3 text-xl font-bold text-slate-900 sm:text-2xl">
                    {item.title}
                  </h2>

                  <p className="text-base leading-8 text-slate-700">
                    {item.text}
                  </p>
                </section>
              ))}
            </div>

            {/* Important Notice */}
            <div className="mt-10 rounded-2xl border-2 border-red-200 bg-red-50 p-5 sm:p-6">
              <h3 className="text-xl font-black text-red-700 sm:text-2xl">
                IMPORTANT NOTICE
              </h3>

              <p className="mt-3 text-base leading-8 text-red-800">
                THIS IS A{" "}
                <span className="font-black uppercase">
                  NON-REFUNDABLE COURSE
                </span>
                . By purchasing this digital learning product, you agree that
                the course is final sale and no refund will be issued after
                access is granted. Please ensure you understand the terms
                before enrolling.
              </p>
            </div>

            {/* Bottom */}
            <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-slate-200 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center">
              <p>Last Updated: 02 September 2026</p>

              <a
                href="/"
                className="font-semibold text-orange-600 transition hover:text-orange-700"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}