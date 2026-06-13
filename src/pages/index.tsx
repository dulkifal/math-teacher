import Link from "next/link";
import Head from "next/head";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";

// ─── Data ────────────────────────────────────────────────────────────────────

const topics = [
  { name: "Angles & Transversals",  href: "/angle",    icon: "📐", tag: "Geometry"     },
  { name: "Addition & Subtraction", href: "/addition", icon: "➕", tag: "Arithmetic"   },
  { name: "Triangles",              href: "/triangle", icon: "🔺", tag: "Geometry"     },
  { name: "Symmetry",               href: "/symmetry", icon: "🎨", tag: "Visual Math"  },
  { name: "Cube Roots",             href: "/cube",     icon: "🧊", tag: "Algebra"      },
  { name: "Rational Numbers",       href: "/rational", icon: "➗", tag: "Number Theory"},
  { name: "Fractions",              href: "/fractions",icon: "🍕", tag: "Arithmetic"   },
  { name: "Linear Grapher",         href: "/grapher",  icon: "📉", tag: "Algebra"      },
];

const features = [
  {
    icon: "🎯",
    title: "Adaptive Quizzes",
    description: "Our engine adapts in real time — harder questions when you're on a streak, support when you need it.",
  },
  {
    icon: "🧠",
    title: "Concept Mastery",
    description: "Every answer is logged. We track your proficiency per concept (0–100%) so you know exactly where to focus.",
  },
  {
    icon: "🔥",
    title: "Daily Streaks",
    description: "Stay motivated with daily streaks, XP points, and a gamified dashboard that rewards your consistency.",
  },
  {
    icon: "🖱️",
    title: "Visual Interactions",
    description: "Drag, slide, and reshape — every lesson has hands-on tools that make abstract math concrete.",
  },
  {
    icon: "📊",
    title: "Progress Dashboard",
    description: "Track completed lessons, quiz history, unlocked badges, and your learning trajectory — all in one place.",
  },
  {
    icon: "📚",
    title: "Curated Resources",
    description: "Hand-picked external tools — GeoGebra, Khan Academy, Brilliant — organised by level and topic.",
  },
];

const stats = [
  { value: "8",    label: "Interactive Lessons" },
  { value: "3",    label: "Difficulty Levels"   },
  { value: "100%", label: "Free to Use"          },
  { value: "∞",    label: "Adaptive Questions"   },
];

const testimonials = [
  {
    quote: "The triangle visualizer clicked everything into place. I finally understand medians and altitudes.",
    name: "Aisha K.",
    role: "Grade 9 Student",
  },
  {
    quote: "I used this to prep my class for their geometry exam. The interactive tools saved me hours.",
    name: "Mr. Tariq",
    role: "Secondary School Teacher",
  },
  {
    quote: "The adaptive quiz is genuinely smart — it gave me practice I didn't know I needed, and I aced my test.",
    name: "Bilal R.",
    role: "O-Level Student",
  },
];

// ─── Stat item ────────────────────────────────────────────────────────────────

function StatItem({ value, label }: { value: string; label: string }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 200); return () => clearTimeout(t); }, []);
  return (
    <div className={`text-center transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
      <div className="text-3xl font-black text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500 font-medium">{label}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const { isSignedIn } = useUser();

  return (
    <>
      <Head>
        <title>Math Teacher — Interactive Math Learning Platform</title>
        <meta name="description" content="An interactive, adaptive math learning platform for students. Explore lessons in geometry, algebra, arithmetic and more with real-time visualizations and quizzes." />
      </Head>

      <div className="bg-white font-sans text-gray-900">

        {/* ══════════════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════════════ */}
        <section className="bg-white border-b border-gray-100">
          <div className="container mx-auto max-w-5xl px-6 py-24 md:py-32 text-center">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-xs font-semibold text-blue-600 mb-8 tracking-wide uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Interactive Math Learning
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.08] tracking-tight text-gray-900 mb-6">
              Master Math with
              <br />
              <span className="text-blue-600">Confidence</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-500 leading-relaxed mb-10 max-w-xl mx-auto">
              Drag, explore, and quiz your way through geometry, algebra, and more — with adaptive lessons that track your mastery.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="#topics"
                className="bg-blue-600 text-white font-bold py-3.5 px-8 rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm"
              >
                Explore Lessons →
              </Link>
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="bg-white border border-gray-200 text-gray-700 font-bold py-3.5 px-8 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm"
                >
                  My Dashboard
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <button className="bg-white border border-gray-200 text-gray-700 font-bold py-3.5 px-8 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm">
                    Sign In Free
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            STATS STRIP
        ══════════════════════════════════════════════════════════ */}
        <section className="bg-gray-50 border-b border-gray-100 py-10">
          <div className="container mx-auto max-w-3xl px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-200">
              {stats.map(s => (
                <StatItem key={s.label} {...s} />
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            TOPICS GRID
        ══════════════════════════════════════════════════════════ */}
        <section id="topics" className="bg-white py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-12">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Curriculum</p>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">What do you want to learn?</h2>
              <p className="text-gray-500 mt-2 max-w-lg">
                Eight hands-on lessons, each with an interactive visualizer and adaptive quiz.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topics.map(topic => (
                <Link
                  key={topic.name}
                  href={topic.href}
                  className="group bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">{topic.icon}</span>
                    <span className="text-xs font-medium text-gray-400 bg-gray-100 rounded-full px-2.5 py-1">
                      {topic.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-1">
                    {topic.name}
                  </h3>
                  <div className="mt-auto pt-4 text-xs font-semibold text-blue-500 group-hover:text-blue-600 transition-colors">
                    Start Learning →
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            FEATURES
        ══════════════════════════════════════════════════════════ */}
        <section className="bg-gray-50 py-20 px-6 border-t border-gray-100">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-12">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Platform</p>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">Built for real learning</h2>
              <p className="text-gray-500 mt-2 max-w-lg">
                Every feature is designed around one question: what actually helps students understand math?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map(f => (
                <div
                  key={f.title}
                  className="bg-white border border-gray-100 rounded-xl p-6 hover:shadow-sm transition-shadow duration-200"
                >
                  <span className="text-2xl mb-4 block">{f.icon}</span>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════════════════════════ */}
        <section className="bg-white py-20 px-6 border-t border-gray-100">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">How It Works</p>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">Three steps to mastery</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "01", title: "Pick a Topic",    desc: "Choose from 8 interactive lessons covering geometry, algebra, and arithmetic.", icon: "🗂️" },
                { step: "02", title: "Explore Visually",desc: "Drag, slide, and interact. See concepts come alive in real time.",              icon: "🖱️" },
                { step: "03", title: "Quiz & Track",    desc: "Take an adaptive quiz, earn XP, track mastery, and unlock achievements.",      icon: "🏆" },
              ].map(s => (
                <div key={s.step} className="text-center">
                  <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
                    {s.icon}
                  </div>
                  <p className="text-xs font-black text-gray-300 tracking-widest uppercase mb-2">Step {s.step}</p>
                  <h3 className="text-lg font-black text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            TESTIMONIALS
        ══════════════════════════════════════════════════════════ */}
        <section className="bg-gray-50 py-20 px-6 border-t border-gray-100">
          <div className="container mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Testimonials</p>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">What learners say</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {testimonials.map((t, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-6 flex flex-col">
                  <p className="text-gray-600 text-sm leading-relaxed italic flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{t.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            CTA
        ══════════════════════════════════════════════════════════ */}
        <section className="bg-white py-20 px-6 border-t border-gray-100">
          <div className="container mx-auto max-w-2xl text-center">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              Start your math journey today
            </h2>
            <p className="text-gray-500 text-base mb-8 max-w-md mx-auto">
              Sign in for free to track your progress, earn badges, and unlock your personal dashboard.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {isSignedIn ? (
                <Link
                  href="/dashboard"
                  className="bg-blue-600 text-white font-bold py-3.5 px-8 rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm"
                >
                  Go to My Dashboard →
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <button className="bg-blue-600 text-white font-bold py-3.5 px-8 rounded-xl hover:bg-blue-700 transition-colors shadow-sm text-sm">
                    Sign Up — It&apos;s Free
                  </button>
                </SignInButton>
              )}
              <Link
                href="#topics"
                className="bg-white border border-gray-200 text-gray-700 font-bold py-3.5 px-8 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm"
              >
                Browse Lessons
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            FOOTER
        ══════════════════════════════════════════════════════════ */}
        <footer className="bg-gray-50 border-t border-gray-100 py-10 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="md:col-span-2">
                <div className="text-lg font-black text-gray-900 mb-2">Math Teacher</div>
                <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                  An adaptive math learning platform built for genuine understanding through visual exploration and smart quizzes.
                </p>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Lessons</h4>
                <ul className="space-y-2">
                  {topics.slice(0, 4).map(t => (
                    <li key={t.name}>
                      <Link href={t.href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                        {t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Platform</h4>
                <ul className="space-y-2">
                  {[
                    { label: "Dashboard",     href: "/dashboard"  },
                    { label: "Resources",     href: "/resources"  },
                    { label: "Fractions",     href: "/fractions"  },
                    { label: "Linear Grapher",href: "/grapher"    },
                  ].map(l => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-gray-400">
              <span>© {new Date().getFullYear()} Math Teacher. Built for students everywhere.</span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-gray-400">All systems online</span>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
