import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";

// ─── Lesson groups organised by subject ───────────────────────────────────────

const lessonGroups = [
  {
    groupLabel: "Geometry",
    color: "text-blue-600",
    lessons: [
      { name: "Angles & Transversals", href: "/angle",    icon: "📐", desc: "Angle types & parallel lines"      },
      { name: "Triangles",             href: "/triangle", icon: "🔺", desc: "Medians, altitudes, Pythagoras"    },
      { name: "Symmetry",              href: "/symmetry", icon: "🎨", desc: "Reflectional & rotational symmetry" },
    ],
  },
  {
    groupLabel: "Algebra",
    color: "text-violet-600",
    lessons: [
      { name: "Cube Roots",     href: "/cube",    icon: "🧊", desc: "Perfect cubes & adaptive quiz" },
      { name: "Linear Grapher", href: "/grapher", icon: "📉", desc: "Drag slope and y-intercept"    },
    ],
  },
  {
    groupLabel: "Arithmetic",
    color: "text-emerald-600",
    lessons: [
      { name: "Addition & Subtraction", href: "/addition",  icon: "➕", desc: "Number-line visualizer"         },
      { name: "Fractions",              href: "/fractions",  icon: "🍕", desc: "Pizza slices & comparisons"    },
      { name: "Rational Numbers",       href: "/rational",   icon: "➗", desc: "Decimals, ratios, number line"  },
    ],
  },
];

// ─── Lessons mega-dropdown ────────────────────────────────────────────────────

function LessonsDropdown({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[640px] max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-5">
      <div className="grid grid-cols-3 gap-4">
        {lessonGroups.map(group => (
          <div key={group.groupLabel}>
            <p className={`text-xs font-black uppercase tracking-widest mb-3 ${group.color}`}>
              {group.groupLabel}
            </p>
            <ul className="space-y-1">
              {group.lessons.map(lesson => (
                <li key={lesson.name}>
                  <Link
                    href={lesson.href}
                    onClick={onClose}
                    className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <span className="text-xl mt-0.5 flex-shrink-0">{lesson.icon}</span>
                    <div>
                      <div className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors leading-tight">
                        {lesson.name}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 leading-tight">
                        {lesson.desc}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-400">8 lessons · adaptive quizzes · mastery tracking</span>
        <Link
          href="/#topics"
          onClick={onClose}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          View all →
        </Link>
      </div>
    </div>
  );
}

// ─── Main Navbar ──────────────────────────────────────────────────────────────

export default function Navbar() {
  const [lessonsOpen, setLessonsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLessonsOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setLessonsOpen(false);
  }, [router.pathname]);

  const isActive = (href: string) => router.pathname === href;

  return (
    <>
      {/* ── Top Bar ────────────────────────────────────────────────── */}
      <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto max-w-6xl flex items-center justify-between px-4 sm:px-6 h-14">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xl">📘</span>
            <span className="text-base font-black text-gray-900 tracking-tight">Math Teacher</span>
          </Link>

          {/* Desktop Nav links */}
          <div className="hidden md:flex items-center gap-1">

            {/* Lessons dropdown */}
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setLessonsOpen(o => !o)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  lessonsOpen ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                Lessons
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${lessonsOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 20 20" fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              {lessonsOpen && <LessonsDropdown onClose={() => setLessonsOpen(false)} />}
            </div>

            {/* My Progress — signed in only */}
            <Show when="signed-in">
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive("/dashboard") ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="text-base">📊</span>
                My Progress
              </Link>
            </Show>

            {/* Resources */}
            <Link
              href="/resources"
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isActive("/resources") ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-base">📚</span>
              Resources
            </Link>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-2">
              <Show when="signed-out">
                <SignInButton mode="modal">
                  <button className="text-sm font-semibold text-gray-600 px-3.5 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
                <SignInButton mode="modal">
                  <button className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                    Get Started Free
                  </button>
                </SignInButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </div>

            {/* Mobile: auth avatar + hamburger */}
            <div className="md:hidden flex items-center gap-2">
              <Show when="signed-in">
                <UserButton />
              </Show>
              <button
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
                onClick={() => setMobileMenuOpen(o => !o)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile Slide-down Menu ──────────────────────────────── */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white overflow-y-auto max-h-[80vh] pb-4">

            {/* Lesson groups accordion */}
            {lessonGroups.map(group => (
              <div key={group.groupLabel} className="border-b border-gray-100 last:border-b-0">
                <button
                  className="w-full flex items-center justify-between px-5 py-3.5 text-left"
                  onClick={() => setMobileGroup(g => g === group.groupLabel ? null : group.groupLabel)}
                >
                  <span className={`text-sm font-black uppercase tracking-wider ${group.color}`}>
                    {group.groupLabel}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${mobileGroup === group.groupLabel ? "rotate-180" : ""}`}
                    viewBox="0 0 20 20" fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {mobileGroup === group.groupLabel && (
                  <div className="px-4 pb-3 space-y-1">
                    {group.lessons.map(lesson => (
                      <Link
                        key={lesson.name}
                        href={lesson.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          isActive(lesson.href) ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className="text-lg">{lesson.icon}</span>
                        <div>
                          <div className="font-semibold leading-tight">{lesson.name}</div>
                          <div className="text-xs text-gray-400">{lesson.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Other nav items */}
            <div className="px-4 pt-3 space-y-1">
              <Show when="signed-in">
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    isActive("/dashboard") ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg">📊</span> My Progress
                </Link>
              </Show>
              <Link
                href="/resources"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive("/resources") ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="text-lg">📚</span> Resources
              </Link>
            </div>

            {/* Sign in CTA */}
            <Show when="signed-out">
              <div className="px-4 pt-4">
                <SignInButton mode="modal">
                  <button className="w-full bg-blue-600 text-white text-sm font-bold py-3 rounded-xl hover:bg-blue-700 transition-colors">
                    Sign Up — It&apos;s Free
                  </button>
                </SignInButton>
              </div>
            </Show>
          </div>
        )}
      </nav>

      {/* ── Mobile Bottom Tab Bar (phone UX) ───────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-inset-bottom">
        <div className="grid grid-cols-4 h-16">
          <Link
            href="/"
            className={`flex flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors ${
              isActive("/") ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <span className="text-xl">🏠</span>
            <span>Home</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(o => !o)}
            className={`flex flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors ${
              mobileMenuOpen ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <span className="text-xl">📘</span>
            <span>Lessons</span>
          </button>

          <Show when="signed-in">
            <Link
              href="/dashboard"
              className={`flex flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors ${
                isActive("/dashboard") ? "text-blue-600" : "text-gray-400"
              }`}
            >
              <span className="text-xl">📊</span>
              <span>Progress</span>
            </Link>
          </Show>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="flex flex-col items-center justify-center gap-0.5 text-xs font-semibold text-gray-400 w-full">
                <span className="text-xl">📊</span>
                <span>Progress</span>
              </button>
            </SignInButton>
          </Show>

          <Link
            href="/resources"
            className={`flex flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors ${
              isActive("/resources") ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <span className="text-xl">📚</span>
            <span>Resources</span>
          </Link>
        </div>
      </div>

      {/* Spacer so content isn't hidden behind mobile tab bar */}
      <div className="md:hidden h-16" />
    </>
  );
}
