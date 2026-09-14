import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";

const sections = [
  {
    title: "Comments",
    content: [
      "When visitors leave comments on the site, we collect the information shown in the comments form, along with the visitor's IP address and browser user agent string to help with spam detection.",
      "An anonymized string created from your email address may be provided to the Gravatar service to see whether you are using it. The Gravatar service privacy policy is available at https://automattic.com/privacy/. After approval of your comment, your profile picture is visible to the public in the context of your comment.",
    ],
  },
  {
    title: "Media",
    content: ["If you upload images to the website, you should avoid uploading images with embedded location data, including EXIF GPS data. Visitors to the website can download and extract any location data from images on the website."],
  },
  {
    title: "Cookies",
    content: [
      "If you leave a comment on our site, you may opt in to saving your name, email address, and website in cookies. These are for your convenience so that you do not have to fill in your details again when you leave another comment. These cookies last for one year.",
      "If you visit our login page, we will set a temporary cookie to determine if your browser accepts cookies. This cookie contains no personal data and is discarded when you close your browser.",
      "When you log in, we will also set up several cookies to save your login information and your screen display choices. Login cookies last for two days, and screen options cookies last for a year. If you select Remember Me, your login will persist for two weeks. If you log out of your account, the login cookies will be removed.",
    ],
  },
  {
    title: "Embedded Content From Other Websites",
    content: [
      "Articles on this site may include embedded content such as videos, images, and articles. Embedded content from other websites behaves in exactly the same way as if the visitor had visited the other website.",
      "These websites may collect data about you, use cookies, embed additional third-party tracking, and monitor your interaction with that embedded content if you have an account and are logged in to that website.",
    ],
  },
  {
    title: "Who We Share Your Data With",
    content: ["If you request a password reset, your IP address will be included in the reset email. We may also share limited information with trusted service providers that help us operate the website, process payments, deliver course access, prevent fraud, or provide customer support."],
  },
  {
    title: "How Long We Retain Your Data",
    content: [
      "If you leave a comment, the comment and its metadata are retained indefinitely so we can recognize and approve any follow-up comments automatically instead of holding them in a moderation queue.",
      "For registered users, we store the personal information they provide in their user profile. Users can see, edit, or delete their personal information at any time, except they cannot change their username. Website administrators can also see and edit that information.",
    ],
  },
  {
    title: "What Rights You Have Over Your Data",
    content: ["If you have an account on this site or have left comments, you can request to receive an exported file of the personal data we hold about you, including any data you have provided to us. You can also request that we erase any personal data we hold about you. This does not include data we are obliged to keep for administrative, legal, or security purposes."],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-[#f6f7fb] px-4 py-10 text-slate-800 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-5xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <header className="border-b-4 border-red-700 px-6 py-8 sm:px-10 lg:px-14">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-700">SKILLLAB Legal</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-red-700 sm:text-4xl">Privacy Policy</h1>
            <p className="mt-4 text-sm text-slate-500">Last updated: 02 September 2026</p>
          </header>

          <div className="px-6 py-8 sm:px-10 lg:px-14">
            <section className="border-b border-slate-200 pb-7">
              <h2 className="text-lg font-black text-red-700">LEGAL NAME = RAKESH</h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">This Privacy Policy explains how SKILLLAB collects, uses, stores, and protects information when you visit our website, create an account, purchase a digital course, or use our learning services.</p>
            </section>

            <div className="divide-y divide-slate-200">
              {sections.map((section) => (
                <section key={section.title} className="py-7 first:pt-0 last:pb-0">
                  <h2 className="text-lg font-black text-red-700">{section.title}</h2>
                  <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700">
                    {section.content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </div>
                </section>
              ))}
            </div>

            <section className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5">
              <h2 className="text-lg font-black text-red-700">Bonus and Commission Terms</h2>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-red-900">
                <li>Any bonus amount will be available for withdrawal only where the applicable program terms allow it.</li>
                <li>If you have a smaller package and use a larger package, commission from that sale will show in your account but will not be eligible for withdrawal until the relevant upgrade or eligibility requirements are met.</li>
                <li>To withdraw commission or earnings, you must meet the minimum withdrawal limit and complete any required verification.</li>
              </ul>
            </section>

            <section className="mt-8 border-t border-slate-200 pt-7">
              <h2 className="text-lg font-black text-red-700">Contact</h2>
              <p className="mt-3 text-sm leading-7 text-slate-700">For privacy questions, data requests, or concerns about your account, please contact the SKILLLAB support team through the contact details provided on this website.</p>
            </section>
          </div>
        </article>
      </main>
      <SiteFooter />
    </>
  );
}
