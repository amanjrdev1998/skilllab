"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

type Course = {
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
  data?: { courses?: Course[] };
};

const formatPrice = (price: number | string | null) =>
  price === null
    ? ""
    : new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(Number(price));

const formatStudents = (students: number) =>
  students >= 1000 ? `${(students / 1000).toFixed(1).replace(".0", "")}K` : String(students);

const benefits = [
  {
    icon: "🎯",
    title: "Practical Learning",
    description:
      "Learn through real-world examples, projects and practical exercises.",
  },
  {
    icon: "💻",
    title: "Hands-On Projects",
    description:
      "Build projects that help you understand how things work in the real world.",
  },
  {
    icon: "🏆",
    title: "Certificate",
    description:
      "Receive a certificate after successfully completing your course.",
  },
  {
    icon: "♾️",
    title: "Lifetime Access",
    description:
      "Learn at your own pace with lifetime access to your course content.",
  },
];

const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Digital Marketer",
    initials: "RS",
    text: "The Facebook Ads course completely changed the way I approach paid advertising. The practical examples were extremely useful.",
  },
  {
    name: "Priya Mehta",
    role: "Business Owner",
    initials: "PM",
    text: "I wanted to understand AI automation for my business and this course made the concepts incredibly easy to understand.",
  },
  {
    name: "Arjun Verma",
    role: "Software Developer",
    initials: "AV",
    text: "The Cloud AI Agent course is exactly what I needed. The project-based approach helped me actually build instead of just watching videos.",
  },
];

const faqs = [
  {
    question: "Are these courses beginner friendly?",
    answer:
      "Yes. Each course clearly explains the fundamentals before moving into advanced concepts. You can start even if you are new to the topic.",
  },
  {
    question: "How long do I have access to the courses?",
    answer:
      "You get lifetime access to the course you purchase, including future updates made to the course.",
  },
  {
    question: "Are the courses project-based?",
    answer:
      "Yes. The courses focus on practical implementation and real-world projects instead of only theoretical concepts.",
  },
  {
    question: "Will I receive a certificate?",
    answer:
      "Yes. You will receive a certificate after completing the required course content.",
  },
  {
    question: "Can I learn at my own pace?",
    answer:
      "Absolutely. All courses are self-paced, so you can learn whenever it is convenient for you.",
  },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const response = await fetch("/api/v1/courses");
        if (!response.ok) throw new Error("Unable to load courses");

        const payload = (await response.json()) as CoursesResponse;
        if (!payload.success) throw new Error("Unable to load courses");

        setCourses(payload.data?.courses ?? []);
      } catch {
        setCoursesError("Courses are unavailable right now. Please try again shortly.");
      } finally {
        setCoursesLoading(false);
      }
    };

    void loadCourses();
  }, []);

  const categories = [
    "All",
    ...Array.from(new Set(courses.map((course) => course.category))),
  ];

  const filteredCourses =
    activeCategory === "All"
      ? courses
      : courses.filter((course) => course.category === activeCategory);

  return (
    <>
        {/* =====================================================
            ANNOUNCEMENT BAR
        ====================================================== */}
      <div className="bg-zinc-950 px-4 py-2.5 text-center text-xs font-medium tracking-wide text-white">
        🚀 NEW COURSES AVAILABLE — START LEARNING TODAY
      </div>

      <SiteHeader />

      <main className="min-h-screen overflow-hidden bg-white text-zinc-950">

        {/* =====================================================
            HERO
        ====================================================== */}
        <section className="relative overflow-hidden bg-[#f7f7ff]">
          {/* Background decoration */}
          <div className="absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-200/30 blur-3xl" />

          <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-purple-200/30 blur-3xl" />

          <div className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-16 px-5 py-20 lg:grid-cols-2 lg:px-8">
            {/* Hero Content */}
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-indigo-700 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-indigo-600" />
                Learn. Build. Grow.
              </div>

              <h1 className="max-w-3xl text-6xl font-black leading-[0.92] tracking-[-0.065em] sm:text-7xl lg:text-[82px]">
                MASTER THE
                <br />
                <span className="text-indigo-600">SKILLS</span>
                <br />
                OF TOMORROW.
              </h1>

              <p className="mt-8 max-w-xl text-base leading-7 text-zinc-600 sm:text-lg">
                Learn Digital Marketing and AI from practical, project-based
                courses designed to help you build real-world skills and grow
                your career.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#courses"
                  className="rounded-full bg-zinc-950 px-7 py-4 text-center text-sm font-bold text-white transition hover:-translate-y-1 hover:bg-indigo-600"
                >
                  Explore Courses →
                </a>

                <a
                  href="#process"
                  className="rounded-full border border-zinc-300 bg-white px-7 py-4 text-center text-sm font-bold transition hover:bg-zinc-100"
                >
                  How It Works
                </a>
              </div>

              {/* Small trust */}
              <div className="mt-10 flex items-center gap-4">
                <div className="flex -space-x-3">
                  {["RS", "PM", "AV", "SK"].map((initials) => (
                    <div
                      key={initials}
                      className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-zinc-200 text-[10px] font-bold"
                    >
                      {initials}
                    </div>
                  ))}
                </div>

                <div>
                  <div className="text-sm font-bold">10,000+ learners</div>
                  <div className="text-xs text-zinc-500">
                    already building their future
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              {/* Main card */}
              <div className="relative overflow-hidden rounded-[2rem] bg-zinc-950 p-6 shadow-2xl sm:p-8">
                <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-600/40 blur-3xl" />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-zinc-500">
                        FEATURED LEARNING
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-white">
                        AI + Digital Growth
                      </h2>
                    </div>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-xl">
                      ✦
                    </div>
                  </div>

                  {/* Learning visual */}
                  <div className="mt-8 rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 p-6">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-white/15 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-white">
                        Future Skills
                      </span>

                      <span className="text-2xl">🚀</span>
                    </div>

                    <div className="mt-16">
                      <p className="text-sm text-indigo-100">
                        Build skills that matter.
                      </p>

                      <p className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                        Learn.
                        <br />
                        Build.
                        <br />
                        Launch.
                      </p>
                    </div>
                  </div>

                  {/* Course progress */}
                  <div className="mt-5 rounded-2xl bg-white/5 p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-400">
                        Learning Progress
                      </span>

                      <span className="text-xs font-bold text-white">78%</span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-[78%] rounded-full bg-indigo-500" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating certificate */}
              <div className="absolute -bottom-6 -left-5 hidden rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-xl">
                    🏆
                  </div>

                  <div>
                    <p className="text-xs text-zinc-500">Certification</p>
                    <p className="text-sm font-bold">Industry Ready</p>
                  </div>
                </div>
              </div>

              {/* Floating rating */}
              <div className="absolute -right-5 -top-10 hidden rounded-2xl border border-zinc-200 bg-white px-4 py-3 shadow-xl sm:block">
                <div className="flex items-center gap-2">
                  <span className="text-lg">⭐</span>
                  <div>
                    <p className="text-sm font-bold">4.9/5</p>
                    <p className="text-[10px] text-zinc-500">Student Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            STATS
        ====================================================== */}
        <section className="border-y border-zinc-200 bg-white">
          <div className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
            {[
              ["10K+", "Students"],
              ["4", "Expert Courses"],
              ["50+", "Practical Projects"],
              ["4.9/5", "Average Rating"],
            ].map(([value, label], index) => (
              <div
                key={label}
                className={`p-7 text-center ${
                  index < 3 ? "border-r border-zinc-200" : ""
                }`}
              >
                <p className="text-3xl font-black tracking-tight sm:text-4xl">
                  {value}
                </p>

                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-zinc-500">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================
            COURSES
        ====================================================== */}
        <section id="courses" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-600">
                Learn Something New
              </p>

              <h2 className="mt-3 max-w-2xl text-4xl font-black tracking-[-0.04em] sm:text-5xl">
                Skills that turn
                <br />
                knowledge into action.
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-6 text-zinc-500">
                Choose a course, learn at your own pace and build skills you can
                actually use.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-4 py-2.5 text-xs font-bold transition ${
                    activeCategory === category
                      ? "bg-zinc-950 text-white"
                      : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Course Grid */}
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {coursesLoading ? (
              <p className="col-span-full py-12 text-center text-sm text-zinc-500">
                Loading courses...
              </p>
            ) : coursesError ? (
              <p className="col-span-full py-12 text-center text-sm text-red-600">
                {coursesError}
              </p>
            ) : filteredCourses.length === 0 ? (
              <p className="col-span-full py-12 text-center text-sm text-zinc-500">
                No courses found in this category.
              </p>
            ) : filteredCourses.map((course) => (
              <article
                key={course.id}
                className="group overflow-hidden rounded-[1.5rem] border border-zinc-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Course Header */}
                <div
                  className={`relative h-56 overflow-hidden bg-gradient-to-br ${course.gradient} p-5`}
                >
                  <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />

                  <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-black/10" />

                  <div className="relative flex items-start justify-between">
                    <span className="rounded-full bg-white/15 px-3 py-1.5 text-[9px] font-bold tracking-wider text-white backdrop-blur">
                      {course.badge ?? "COURSE"}
                    </span>

                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-2xl backdrop-blur">
                      {course.icon ?? "📚"}
                    </div>
                  </div>

                  <div className="absolute bottom-5 left-5 right-5">
                    <p className="text-xs font-medium text-white/70">
                      {course.category}
                    </p>

                    <h3 className="mt-1 text-xl font-black leading-tight text-white">
                      {course.title}
                    </h3>
                  </div>
                </div>

                {/* Course Body */}
                <div className="p-5">
                  <p className="min-h-[72px] text-xs leading-5 text-zinc-500">
                    {course.description}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 border-y border-zinc-100 py-4 text-[10px] text-zinc-500">
                    <span>📚 {course.lessons_count} Lessons</span>
                    <span>⏱️ {course.duration_hours} Hours</span>
                    <span>🎓 {course.level}</span>
                    <span>👥 {formatStudents(Number(course.students_count))}</span>
                  </div>

                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <span className="text-xl font-black">{formatPrice(course.price)}</span>

                      {course.old_price !== null && (
                        <span className="ml-2 text-xs text-zinc-400 line-through">
                          {formatPrice(course.old_price)}
                        </span>
                      )}
                    </div>

                    <span className="text-xs font-bold">
                      ⭐ {course.rating}
                    </span>
                  </div>
                      
                  <Link
                    href={`/product-details?id=${course.id}`}
                    className="mt-5 block w-full rounded-full bg-zinc-950 py-3.5 text-center text-xs font-bold text-white transition hover:bg-indigo-800"
                  >
                    Buy Course →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* =====================================================
            WHY US
        ====================================================== */}
        <section id="why-us" className="bg-[#f7f7ff] py-24">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-600">
                Why SkillLab
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
                Learn skills.
                <br />
                Create opportunities.
              </h2>

              <p className="mt-5 text-sm leading-6 text-zinc-500">
                Everything you need to turn your curiosity into practical,
                valuable skills.
              </p>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {benefits.map((benefit) => (
                <div
                  key={benefit.title}
                  className="rounded-3xl border border-zinc-200 bg-white p-7 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                    {benefit.icon}
                  </div>

                  <h3 className="mt-6 text-lg font-bold">{benefit.title}</h3>

                  <p className="mt-3 text-sm leading-6 text-zinc-500">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            PROCESS
        ====================================================== */}
        <section id="process" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-600">
                Simple Process
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
                Start learning
                <br />
                in 3 simple steps.
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-6 text-zinc-500">
                No complicated process. Choose what you want to learn and start
                building your skills immediately.
              </p>

              <a
                href="#courses"
                className="mt-8 inline-flex rounded-full bg-zinc-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-indigo-600"
              >
                Browse Courses →
              </a>
            </div>

            <div className="space-y-4">
              {[
                {
                  number: "01",
                  title: "Choose Your Course",
                  text: "Explore our courses and select the skill you want to master.",
                },
                {
                  number: "02",
                  title: "Learn at Your Pace",
                  text: "Follow structured lessons and practical examples whenever you want.",
                },
                {
                  number: "03",
                  title: "Build & Grow",
                  text: "Apply what you learn through projects and take your skills to the next level.",
                },
              ].map((step) => (
                <div
                  key={step.number}
                  className="flex gap-5 rounded-3xl border border-zinc-200 p-6 transition hover:border-indigo-200 hover:bg-indigo-50/30"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 text-xs font-black text-white">
                    {step.number}
                  </div>

                  <div>
                    <h3 className="font-bold">{step.title}</h3>

                    <p className="mt-2 text-sm leading-6 text-zinc-500">
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =====================================================
            DARK FEATURE SECTION
        ====================================================== */}
        <section className="px-5 lg:px-8">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-zinc-950">
            <div className="grid items-center gap-12 px-7 py-16 sm:px-12 lg:grid-cols-2 lg:px-16 lg:py-20">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-400">
                  Future Ready
                </p>

                <h2 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
                  The future belongs
                  <br />
                  to those who
                  <br />
                  <span className="text-indigo-500">keep learning.</span>
                </h2>

                <p className="mt-6 max-w-lg text-sm leading-6 text-zinc-400">
                  Digital marketing and artificial intelligence are changing how
                  businesses work. Learn the tools and skills that can help you
                  stay ahead.
                </p>

                <a
                  href="#courses"
                  className="mt-8 inline-flex rounded-full bg-white px-6 py-3.5 text-sm font-bold text-black transition hover:bg-indigo-500 hover:text-white"
                >
                  Start Your Journey →
                </a>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  ["AI", "Artificial Intelligence"],
                  ["ADS", "Digital Advertising"],
                  ["AUTO", "Automation"],
                  ["CLOUD", "Cloud Technology"],
                ].map(([title, text]) => (
                  <div
                    key={title}
                    className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur"
                  >
                    <div className="text-2xl font-black text-white">
                      {title}
                    </div>

                    <p className="mt-2 text-xs leading-5 text-zinc-500">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            TESTIMONIALS
        ====================================================== */}
        <section id="reviews" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-600">
              Student Stories
            </p>

            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
              Loved by learners.
            </h2>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.name}
                className="rounded-3xl border border-zinc-200 bg-white p-7"
              >
                <div className="text-sm tracking-widest">★★★★★</div>

                <p className="mt-5 text-sm leading-7 text-zinc-600">
                  “{testimonial.text}”
                </p>

                <div className="mt-7 flex items-center gap-3 border-t border-zinc-100 pt-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                    {testimonial.initials}
                  </div>

                  <div>
                    <p className="text-sm font-bold">{testimonial.name}</p>

                    <p className="text-xs text-zinc-500">{testimonial.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* =====================================================
            FAQ
        ====================================================== */}
        <section id="faq" className="bg-[#f7f7ff] py-24">
          <div className="mx-auto max-w-3xl px-5 lg:px-8">
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-600">
                FAQ
              </p>

              <h2 className="mt-3 text-4xl font-black tracking-[-0.04em]">
                Frequently asked questions.
              </h2>
            </div>

            <div className="mt-12 space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;

                return (
                  <div
                    key={faq.question}
                    className="overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-5 p-5 text-left"
                    >
                      <span className="text-sm font-bold">{faq.question}</span>

                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-lg transition ${
                          isOpen ? "rotate-45" : ""
                        }`}
                      >
                        +
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5">
                        <p className="text-sm leading-6 text-zinc-500">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =====================================================
            CTA
        ====================================================== */}
        <section className="px-5 py-20 lg:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-indigo-600 px-7 py-16 text-center sm:px-12 lg:py-20">
            <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
            <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-black/10" />

            <div className="relative">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-200">
                Your next chapter starts here
              </p>

              <h2 className="mx-auto mt-4 max-w-3xl text-4xl font-black tracking-[-0.04em] text-white sm:text-6xl">
                Ready to build skills
                <br />
                that matter?
              </h2>

              <p className="mx-auto mt-6 max-w-xl text-sm leading-6 text-indigo-100">
                Join thousands of learners building their future with practical
                Digital Marketing and AI skills.
              </p>

              <a
                href="#courses"
                className="mt-8 inline-flex rounded-full bg-white px-7 py-4 text-sm font-bold text-indigo-700 transition hover:-translate-y-1 hover:bg-zinc-100"
              >
                Explore All Courses →
              </a>
            </div>
          </div>
        </section>

        {/* =====================================================
            FOOTER
        ====================================================== */}
      </main>

      <SiteFooter />
    </>
  );
}
