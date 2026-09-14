export default function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 px-5 py-12 text-slate-300 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <a href="/" className="text-lg font-black tracking-wide text-white">SKILLLAB</a>
          <p className="mt-2 text-sm text-slate-400">Practical digital skills for your next career move.</p>
        </div>
        <nav className="flex flex-wrap gap-5 text-sm">
          <a href="/" className="transition hover:text-white">Home</a>
          <a href="/#shop" className="transition hover:text-white">Courses</a>
          <a href="/term-condition" className="transition hover:text-white">Terms & Conditions</a>
          <a href="/privacypolicy" className="transition hover:text-white">Privacy Policy</a>
          <a href="/cancelation-and-refund" className="transition hover:text-white">Refund Policy</a>
        </nav>
      </div>
      <div className="mx-auto mt-8 max-w-7xl border-t border-slate-800 pt-6 text-xs text-slate-500">© 2026 SkillLab. All rights reserved.</div>
    </footer>
  );
}
