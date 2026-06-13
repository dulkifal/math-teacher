import { useState } from "react";
import Link from "next/link";
import Head from "next/head";

// ─── Data ────────────────────────────────────────────────────────────────────

type Category = "all" | "interactive" | "video" | "practice" | "reference" | "tools";
type Level = "Beginner" | "Intermediate" | "Advanced" | "All Levels";

interface Resource {
  id: number;
  title: string;
  url: string;
  description: string;
  longDescription: string;
  category: Exclude<Category, "all">;
  level: Level;
  topics: string[];
  icon: string;
  badge?: string;
  accent: string; // tailwind text/border color e.g. "blue"
  accentHex: string; // for inline icon bg gradient
}

const resources: Resource[] = [
  {
    id: 1,
    title: "GeoGebra",
    url: "https://www.geogebra.org/",
    description: "The world's leading dynamic mathematics software for geometry, algebra, calculus and more.",
    longDescription:
      "GeoGebra combines geometry, algebra, spreadsheets, graphing, statistics, and calculus into one easy-to-use platform. Drag points, explore theorems, and build intuition visually in real time.",
    category: "interactive",
    level: "All Levels",
    topics: ["Geometry", "Algebra", "Calculus", "Statistics", "Trigonometry"],
    icon: "🔭",
    badge: "Top Pick",
    accent: "blue",
    accentHex: "from-blue-500 to-indigo-600",
  },
  {
    id: 2,
    title: "Desmos Graphing Calculator",
    url: "https://www.desmos.com/calculator",
    description: "Beautiful, free online graphing calculator trusted by millions of students.",
    longDescription:
      "Graph functions, plot data, evaluate equations, and explore transformations — all for free. Desmos is renowned for its intuitive interface, smooth animations, and ability to bring abstract functions to life.",
    category: "interactive",
    level: "Intermediate",
    topics: ["Graphing", "Functions", "Algebra", "Calculus"],
    icon: "📈",
    badge: "Free",
    accent: "cyan",
    accentHex: "from-cyan-500 to-blue-500",
  },
  {
    id: 3,
    title: "Wolfram Alpha",
    url: "https://www.wolframalpha.com/",
    description: "Computational knowledge engine — solve any math problem with step-by-step solutions.",
    longDescription:
      "Type any mathematical expression and Wolfram Alpha computes exact solutions, step-by-step explanations, plots, and related formulas. An indispensable tool for checking work and exploring math deeply.",
    category: "tools",
    level: "All Levels",
    topics: ["Computation", "Calculus", "Algebra", "Statistics", "Number Theory"],
    icon: "🧮",
    badge: "Top Pick",
    accent: "orange",
    accentHex: "from-orange-500 to-red-500",
  },
  {
    id: 4,
    title: "Symbolab",
    url: "https://www.symbolab.com/",
    description: "Step-by-step math solver with detailed explanations for every operation.",
    longDescription:
      "Symbolab solves math problems step-by-step, covering algebra, trigonometry, calculus, and more. Its detailed explanations make it ideal for students who need to understand the 'why' behind each step.",
    category: "tools",
    level: "Intermediate",
    topics: ["Algebra", "Calculus", "Trigonometry", "Geometry"],
    icon: "✏️",
    badge: "Free",
    accent: "violet",
    accentHex: "from-violet-500 to-purple-600",
  },
  {
    id: 5,
    title: "Khan Academy",
    url: "https://www.khanacademy.org/math",
    description: "Free, world-class math education — from arithmetic to calculus and beyond.",
    longDescription:
      "Khan Academy provides free, comprehensive K-12 to college-level math courses. Bite-sized videos, mastery-based exercises, and detailed progress tracking make it one of the best starting points for any math learner.",
    category: "video",
    level: "All Levels",
    topics: ["Arithmetic", "Algebra", "Geometry", "Calculus", "Statistics"],
    icon: "🎓",
    badge: "Top Pick",
    accent: "emerald",
    accentHex: "from-emerald-500 to-teal-600",
  },
  {
    id: 6,
    title: "3Blue1Brown",
    url: "https://www.3blue1brown.com/",
    description: "Stunning visual math storytelling — build deep intuition with beautiful animations.",
    longDescription:
      "Grant Sanderson creates some of the most visually compelling math videos on the internet. The 'Essence of Linear Algebra' and 'Essence of Calculus' series build geometric intuition that textbooks rarely convey.",
    category: "video",
    level: "Advanced",
    topics: ["Linear Algebra", "Calculus", "Number Theory", "Neural Networks"],
    icon: "🎬",
    badge: "Free",
    accent: "sky",
    accentHex: "from-sky-500 to-blue-600",
  },
  {
    id: 7,
    title: "Professor Leonard",
    url: "https://www.youtube.com/c/ProfessorLeonard",
    description: "Full university-level math lectures — Calculus, Statistics, and Differential Equations.",
    longDescription:
      "Professor Leonard films full-length lectures in a real classroom setting with university-level rigor. Covering Precalculus through Calculus 3, Statistics, and Differential Equations — perfect for serious students.",
    category: "video",
    level: "Advanced",
    topics: ["Precalculus", "Calculus I–III", "Statistics", "Differential Equations"],
    icon: "📺",
    badge: "Free",
    accent: "rose",
    accentHex: "from-red-500 to-rose-600",
  },
  {
    id: 8,
    title: "Brilliant.org",
    url: "https://www.brilliant.org/courses/",
    description: "Learn through guided problem-solving and interactive visual puzzles.",
    longDescription:
      "Brilliant takes a 'learn by doing' approach. Instead of watching lectures, you solve guided problems that build intuition in math, logic, and science. Their visually rich interactive lessons create genuine 'aha' moments.",
    category: "practice",
    level: "Intermediate",
    topics: ["Logic", "Algebra", "Geometry", "Calculus", "Number Theory"],
    icon: "⚡",
    badge: "Top Pick",
    accent: "amber",
    accentHex: "from-amber-500 to-orange-500",
  },
  {
    id: 9,
    title: "Art of Problem Solving (AoPS)",
    url: "https://artofproblemsolving.com/",
    description: "The home of competition math — textbooks, courses, and a world-class community.",
    longDescription:
      "AoPS is the gold standard for serious math students aiming for AMC, AIME, and IMO competitions. It features rigorous textbooks, online courses, a vibrant discussion forum, and thousands of competition problems.",
    category: "practice",
    level: "Advanced",
    topics: ["Competition Math", "Number Theory", "Combinatorics", "Geometry"],
    icon: "🏅",
    badge: "Community",
    accent: "indigo",
    accentHex: "from-indigo-500 to-blue-700",
  },
  {
    id: 10,
    title: "IXL Math",
    url: "https://www.ixl.com/math/",
    description: "Adaptive, skill-based practice for K–12 — personalized to your exact level.",
    longDescription:
      "IXL's adaptive algorithm continuously identifies knowledge gaps and adjusts difficulty in real time. With thousands of skills across all K-12 math topics, it provides highly targeted practice with actionable analytics.",
    category: "practice",
    level: "Beginner",
    topics: ["Arithmetic", "Fractions", "Algebra", "Geometry", "Trigonometry"],
    icon: "🎯",
    badge: "Adaptive",
    accent: "green",
    accentHex: "from-green-500 to-emerald-600",
  },
  {
    id: 11,
    title: "Paul's Online Math Notes",
    url: "http://tutorial.math.lamar.edu/",
    description: "The most comprehensive free math notes on the internet — legendary among calculus students.",
    longDescription:
      "Paul Dawkins' notes are legendary. Clear, thorough, and well-organized — covering Algebra, Calculus I/II/III, and Differential Equations with worked examples and downloadable cheat sheets.",
    category: "reference",
    level: "Advanced",
    topics: ["Algebra", "Calculus I", "Calculus II", "Calculus III", "Differential Equations"],
    icon: "📚",
    badge: "Free",
    accent: "slate",
    accentHex: "from-slate-500 to-gray-700",
  },
  {
    id: 12,
    title: "Math is Fun",
    url: "https://www.mathsisfun.com/",
    description: "Friendly, illustrated explanations of math from basic to advanced — with quizzes.",
    longDescription:
      "Math is Fun offers clear, illustrated explanations of math concepts from basic arithmetic to advanced calculus. Every topic includes interactive examples, quizzes, and puzzles to test understanding in a fun way.",
    category: "reference",
    level: "Beginner",
    topics: ["Arithmetic", "Geometry", "Algebra", "Statistics", "Puzzles"],
    icon: "🌟",
    badge: "Beginner Friendly",
    accent: "pink",
    accentHex: "from-pink-500 to-rose-500",
  },
  {
    id: 13,
    title: "Math Open Reference",
    url: "https://www.mathopenref.com/",
    description: "Animated, interactive geometry definitions and proofs — every concept visualized.",
    longDescription:
      "A free, online geometry reference with interactive animations for every definition — from basic points and lines to complex proofs. Particularly powerful for exploring Euclidean geometry interactively.",
    category: "reference",
    level: "Intermediate",
    topics: ["Geometry", "Trigonometry", "Coordinate Geometry"],
    icon: "🗺️",
    badge: "Free",
    accent: "teal",
    accentHex: "from-teal-500 to-cyan-600",
  },
  {
    id: 14,
    title: "Coursera — Math Courses",
    url: "https://www.coursera.org/browse/data-science/math-and-logic",
    description: "University-level math courses from Stanford, MIT, and other top institutions.",
    longDescription:
      "Coursera partners with world-class universities to offer free auditable math courses — covering linear algebra, calculus, discrete math, and probability with structured assignments and peer grading.",
    category: "video",
    level: "Advanced",
    topics: ["Linear Algebra", "Probability", "Discrete Math", "Calculus"],
    icon: "🏛️",
    badge: "University Level",
    accent: "blue",
    accentHex: "from-sky-500 to-blue-700",
  },
];

const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: "all", label: "All", icon: "✨" },
  { value: "interactive", label: "Interactive", icon: "🔭" },
  { value: "video", label: "Video & Courses", icon: "🎬" },
  { value: "practice", label: "Practice", icon: "🎯" },
  { value: "reference", label: "Reference", icon: "📚" },
  { value: "tools", label: "Tools", icon: "🧮" },
];

const LEVELS: Array<Level | "all"> = ["all", "Beginner", "Intermediate", "Advanced", "All Levels"];

const BADGE_COLORS: Record<string, string> = {
  "Top Pick":          "bg-amber-50 text-amber-700 border-amber-200",
  "Free":              "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Adaptive":          "bg-blue-50 text-blue-700 border-blue-200",
  "Community":         "bg-purple-50 text-purple-700 border-purple-200",
  "University Level":  "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Beginner Friendly": "bg-pink-50 text-pink-700 border-pink-200",
};

const LEVEL_COLORS: Record<string, string> = {
  "Beginner":    "bg-green-50 text-green-700 border-green-200",
  "Intermediate":"bg-amber-50 text-amber-700 border-amber-200",
  "Advanced":    "bg-rose-50 text-rose-700 border-rose-200",
  "All Levels":  "bg-blue-50 text-blue-700 border-blue-200",
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [activeLevel, setActiveLevel] = useState<Level | "all">("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = resources.filter(r => {
    const matchCat   = activeCategory === "all" || r.category === activeCategory;
    const matchLevel = activeLevel === "all" || r.level === activeLevel || r.level === "All Levels";
    const q          = search.toLowerCase();
    const matchQ     = !q || r.title.toLowerCase().includes(q) ||
                       r.description.toLowerCase().includes(q) ||
                       r.topics.some(t => t.toLowerCase().includes(q));
    return matchCat && matchLevel && matchQ;
  });

  const topPicks = resources.filter(r => r.badge === "Top Pick");

  return (
    <>
      <Head>
        <title>Math Learning Resources | Math Teacher</title>
        <meta name="description" content="Curated, high-quality math learning resources — from interactive tools and videos to competition math and university courses." />
      </Head>

      <div className="min-h-screen bg-slate-50 font-sans pb-16">

        {/* ── Hero Banner ──────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white py-14 px-6 shadow-md mb-10">
          <div className="container mx-auto max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-white/20 p-2.5 rounded-xl text-xl">📚</span>
                  <h1 className="text-4xl font-extrabold tracking-tight">Math Learning Resources</h1>
                </div>
                <p className="text-blue-100 text-lg max-w-2xl">
                  Hand-picked resources from the world's best math educators and platforms.
                  Whether you're a beginner or training for olympiads — we've got you covered.
                </p>
              </div>
              <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-6 py-4 backdrop-blur-sm">
                <span className="text-3xl">🗂️</span>
                <div>
                  <div className="text-sm text-blue-200 font-semibold uppercase tracking-wider">Total Resources</div>
                  <div className="text-3xl font-black">{resources.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-6xl px-6">

          {/* ── Search + Filters ─────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 mb-8">
            {/* Search */}
            <div className="relative mb-5">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name or topic (e.g. calculus, geometry, competition)..."
                className="w-full border-2 border-slate-200 focus:border-blue-500 focus:outline-none rounded-xl px-4 py-3 pl-10 text-gray-800 placeholder-slate-400 transition text-sm"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition font-bold">
                  ✕
                </button>
              )}
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                    activeCategory === cat.value
                      ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Level + count row */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-500 text-sm font-medium">Level:</span>
                {LEVELS.map(l => (
                  <button
                    key={l}
                    onClick={() => setActiveLevel(l)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition ${
                      activeLevel === l
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300"
                    }`}
                  >
                    {l === "all" ? "All Levels" : l}
                  </button>
                ))}
              </div>
              <span className="text-slate-400 text-sm">
                {filtered.length} resource{filtered.length !== 1 ? "s" : ""} found
              </span>
            </div>
          </div>

          {/* ── Top Picks ────────────────────────────────────────────── */}
          {!search && activeCategory === "all" && activeLevel === "all" && (
            <section className="mb-10">
              <div className="flex items-center gap-2 mb-5">
                <span className="text-xl">🏆</span>
                <h2 className="text-xl font-black text-gray-900">Editor's Top Picks</h2>
                <span className="text-slate-400 text-sm">· Our recommended starting points</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {topPicks.map(r => (
                  <a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
                  >
                    {/* Thin color accent bar */}
                    <div className={`h-1 w-16 rounded-full bg-gradient-to-r ${r.accentHex} mb-5`} />
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${r.accentHex} flex items-center justify-center text-xl shadow-md`}>
                        {r.icon}
                      </div>
                      <span className={`text-xs font-bold border rounded-full px-2.5 py-0.5 ${BADGE_COLORS["Top Pick"]}`}>
                        ⭐ Top Pick
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">{r.title}</h3>
                    <p className="text-gray-500 text-sm flex-1 leading-relaxed">{r.description}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {r.topics.slice(0, 3).map(t => (
                        <span key={t} className="text-xs bg-slate-100 text-slate-600 rounded-full px-2.5 py-0.5">{t}</span>
                      ))}
                    </div>
                    <div className="mt-4 text-blue-600 text-sm font-bold group-hover:text-blue-700 flex items-center gap-1">
                      Open resource <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* ── All Resources Grid ───────────────────────────────────── */}
          <section>
            {filtered.length > 0 && (
              <div className="flex items-center gap-2 mb-5">
                <h2 className="text-xl font-black text-gray-900">
                  {activeCategory === "all" ? "All Resources" : CATEGORIES.find(c => c.value === activeCategory)?.label}
                </h2>
                <span className="text-slate-400 text-sm">· {filtered.length} found</span>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm text-center py-20 px-6">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">No results found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your search or filters.</p>
                <button
                  onClick={() => { setSearch(""); setActiveCategory("all"); setActiveLevel("all"); }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(r => {
                  const isExpanded = expandedId === r.id;
                  return (
                    <div
                      key={r.id}
                      className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden"
                    >
                      {/* Color accent strip */}
                      <div className={`h-1.5 bg-gradient-to-r ${r.accentHex}`} />

                      <div className="p-6 flex flex-col flex-1">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${r.accentHex} flex items-center justify-center text-xl shadow-sm flex-shrink-0`}>
                            {r.icon}
                          </div>
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            {r.badge && (
                              <span className={`text-xs font-bold border rounded-full px-2.5 py-0.5 ${BADGE_COLORS[r.badge] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                                {r.badge}
                              </span>
                            )}
                            <span className={`text-xs font-semibold border rounded-full px-2.5 py-0.5 ${LEVEL_COLORS[r.level] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                              {r.level}
                            </span>
                          </div>
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-1">{r.title}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed mb-3">
                          {isExpanded ? r.longDescription : r.description}
                        </p>

                        {/* Topic tags */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {r.topics.map(t => (
                            <span key={t} className="text-xs bg-slate-100 text-slate-600 rounded-full px-2.5 py-0.5">
                              {t}
                            </span>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="mt-auto flex items-center gap-2">
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex-1 text-center text-white font-bold py-2.5 rounded-xl text-sm shadow-sm hover:opacity-90 hover:scale-[1.01] transition-all duration-200 bg-gradient-to-r ${r.accentHex}`}
                          >
                            Open Resource →
                          </a>
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : r.id)}
                            title={isExpanded ? "Show less" : "More info"}
                            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition flex items-center justify-center text-sm flex-shrink-0 font-bold"
                          >
                            {isExpanded ? "▲" : "▼"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── Learning Paths ───────────────────────────────────────── */}
          <section className="mt-14">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">🗺️</span>
              <h2 className="text-xl font-black text-gray-900">Suggested Learning Paths</h2>
              <span className="text-slate-400 text-sm">· Structured routes from beginner to advanced</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  title: "Middle School Essentials",
                  level: "Beginner",
                  color: "from-green-500 to-emerald-600",
                  lightBg: "bg-emerald-50 border-emerald-100",
                  textColor: "text-emerald-800",
                  emoji: "🟢",
                  steps: [
                    { label: "Concepts & theory", resource: "Math is Fun" },
                    { label: "Video lessons",     resource: "Khan Academy" },
                    { label: "Skill drilling",    resource: "IXL Math" },
                    { label: "Geometry visuals",  resource: "GeoGebra" },
                  ],
                },
                {
                  title: "High School & Exam Prep",
                  level: "Intermediate",
                  color: "from-amber-500 to-orange-500",
                  lightBg: "bg-amber-50 border-amber-100",
                  textColor: "text-amber-800",
                  emoji: "🟡",
                  steps: [
                    { label: "Core courses",      resource: "Khan Academy" },
                    { label: "Problem puzzles",   resource: "Brilliant.org" },
                    { label: "Graph functions",   resource: "Desmos" },
                    { label: "Step-by-step help", resource: "Symbolab" },
                  ],
                },
                {
                  title: "University & Competition",
                  level: "Advanced",
                  color: "from-violet-600 to-indigo-700",
                  lightBg: "bg-violet-50 border-violet-100",
                  textColor: "text-violet-800",
                  emoji: "🔴",
                  steps: [
                    { label: "Competition problems", resource: "Art of Problem Solving" },
                    { label: "Comprehensive notes",  resource: "Paul's Math Notes" },
                    { label: "Full lectures",        resource: "Professor Leonard" },
                    { label: "Visual intuition",     resource: "3Blue1Brown" },
                  ],
                },
              ].map(path => (
                <div key={path.title} className={`bg-white rounded-2xl border shadow-sm p-6 ${path.lightBg}`}>
                  <div className={`h-1.5 w-14 rounded-full bg-gradient-to-r ${path.color} mb-5`} />
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">{path.emoji}</span>
                    <div>
                      <h3 className="font-black text-gray-900">{path.title}</h3>
                      <span className={`text-xs font-semibold ${path.textColor}`}>{path.level}</span>
                    </div>
                  </div>
                  <ol className="space-y-3">
                    {path.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className={`text-xs font-black w-6 h-6 rounded-full bg-gradient-to-br ${path.color} text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm`}>
                          {i + 1}
                        </span>
                        <div>
                          <div className="text-xs text-gray-400 font-medium">{step.label}</div>
                          <div className="text-sm font-semibold text-gray-800">{step.resource}</div>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </section>

          {/* ── CTA ─────────────────────────────────────────────────── */}
          <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-center text-white shadow-xl">
            <h2 className="text-2xl font-black mb-2">Ready to put it into practice?</h2>
            <p className="text-blue-100 mb-6">
              Jump back into our interactive lessons and apply what you've learned.
            </p>
            <Link
              href="/"
              className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-full hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-lg"
            >
              ← Back to Lessons
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}