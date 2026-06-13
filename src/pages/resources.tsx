import { useState } from "react";
import Link from "next/link";
import Head from "next/head";

// ─── Data ─────────────────────────────────────────────────────────────────────

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
  badge?: string;   // e.g. "Free", "Top Pick", "Video"
  color: string;    // gradient classes
}

const resources: Resource[] = [
  // ── Interactive ─────────────────────────
  {
    id: 1,
    title: "GeoGebra",
    url: "https://www.geogebra.org/",
    description: "The world's leading dynamic mathematics software.",
    longDescription:
      "GeoGebra combines geometry, algebra, spreadsheets, graphing, statistics, and calculus in one easy-to-use package. Drag, explore, and visualize any math concept interactively.",
    category: "interactive",
    level: "All Levels",
    topics: ["Geometry", "Algebra", "Calculus", "Statistics", "Trigonometry"],
    icon: "🔭",
    badge: "Top Pick",
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: 2,
    title: "Desmos Graphing Calculator",
    url: "https://www.desmos.com/calculator",
    description: "Beautiful, free online graphing calculator.",
    longDescription:
      "Graph functions, plot data, evaluate equations, explore transformations, and much more — all for free. Desmos is renowned for its intuitive interface and stunning visual output.",
    category: "interactive",
    level: "Intermediate",
    topics: ["Graphing", "Functions", "Algebra", "Calculus"],
    icon: "📈",
    badge: "Free",
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: 3,
    title: "Wolfram Alpha",
    url: "https://www.wolframalpha.com/",
    description: "Computational knowledge engine for any math query.",
    longDescription:
      "Type any mathematical expression and Wolfram Alpha will compute exact solutions, step-by-step explanations, plots, and related formulas. An essential tool for learners at all levels.",
    category: "tools",
    level: "All Levels",
    topics: ["Computation", "Calculus", "Algebra", "Statistics", "Number Theory"],
    icon: "🧮",
    badge: "Top Pick",
    color: "from-orange-500 to-red-500",
  },
  {
    id: 4,
    title: "Symbolab",
    url: "https://www.symbolab.com/",
    description: "Step-by-step math solver with detailed explanations.",
    longDescription:
      "Symbolab solves math problems step-by-step, covering algebra, trigonometry, calculus, and more. Its explanations make it ideal for learners who need to see the 'why' behind each step.",
    category: "tools",
    level: "Intermediate",
    topics: ["Algebra", "Calculus", "Trigonometry", "Geometry"],
    icon: "✏️",
    badge: "Free",
    color: "from-violet-500 to-purple-600",
  },
  // ── Video ────────────────────────────────
  {
    id: 5,
    title: "Khan Academy",
    url: "https://www.khanacademy.org/math",
    description: "Free, world-class math education with videos and exercises.",
    longDescription:
      "Khan Academy provides free, comprehensive K-12 to college-level math courses. Bite-sized videos, mastery-based exercises, and detailed progress tracking make it one of the best starting points for any math learner.",
    category: "video",
    level: "All Levels",
    topics: ["Arithmetic", "Algebra", "Geometry", "Calculus", "Statistics"],
    icon: "🎓",
    badge: "Top Pick",
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: 6,
    title: "3Blue1Brown",
    url: "https://www.3blue1brown.com/",
    description: "Stunning visual math — the 'Essence of ...' series.",
    longDescription:
      "Grant Sanderson creates some of the most beautiful math videos on the internet. The 'Essence of Linear Algebra', 'Essence of Calculus', and 'Neural Networks' series build intuition through visual storytelling.",
    category: "video",
    level: "Advanced",
    topics: ["Linear Algebra", "Calculus", "Number Theory", "Neural Networks"],
    icon: "🎬",
    badge: "Free",
    color: "from-blue-600 to-sky-400",
  },
  {
    id: 7,
    title: "Professor Leonard",
    url: "https://www.youtube.com/c/ProfessorLeonard",
    description: "Full university-level math lectures on YouTube.",
    longDescription:
      "Professor Leonard's full-length lectures are filmed in a real classroom and match university-level rigor. Covering Precalculus, Calculus 1–3, Statistics, and Differential Equations — ideal for serious students.",
    category: "video",
    level: "Advanced",
    topics: ["Precalculus", "Calculus", "Statistics", "Differential Equations"],
    icon: "📺",
    badge: "Free",
    color: "from-red-500 to-rose-600",
  },
  // ── Practice ─────────────────────────────
  {
    id: 8,
    title: "Brilliant.org",
    url: "https://www.brilliant.org/courses/",
    description: "Learn through guided problem-solving and interactive puzzles.",
    longDescription:
      "Brilliant takes a 'learn by doing' approach. Instead of watching lectures, you solve guided problems that build intuition in math, logic, and science. Their interactive lessons are visually stunning.",
    category: "practice",
    level: "Intermediate",
    topics: ["Logic", "Algebra", "Geometry", "Calculus", "Number Theory"],
    icon: "⚡",
    badge: "Top Pick",
    color: "from-amber-500 to-orange-600",
  },
  {
    id: 9,
    title: "Art of Problem Solving (AoPS)",
    url: "https://artofproblemsolving.com/",
    description: "The home of competition math — olympiad resources & community.",
    longDescription:
      "AoPS is the gold standard for serious math students aiming for competitions like AMC, AIME, and IMO. It features textbooks, online courses, a vibrant forum, and thousands of competition problems.",
    category: "practice",
    level: "Advanced",
    topics: ["Competition Math", "Number Theory", "Combinatorics", "Geometry"],
    icon: "🏅",
    badge: "Community",
    color: "from-indigo-500 to-blue-700",
  },
  {
    id: 10,
    title: "IXL Math",
    url: "https://www.ixl.com/math/",
    description: "Adaptive practice for K-12 math — personalized to your level.",
    longDescription:
      "IXL's adaptive algorithm identifies exactly where you struggle and adjusts difficulty in real time. With thousands of skills across all K-12 topics, it provides highly targeted practice and detailed performance analytics.",
    category: "practice",
    level: "Beginner",
    topics: ["Arithmetic", "Fractions", "Algebra", "Geometry", "Trigonometry"],
    icon: "🎯",
    badge: "Adaptive",
    color: "from-green-500 to-emerald-600",
  },
  // ── Reference ─────────────────────────────
  {
    id: 11,
    title: "Paul's Online Math Notes",
    url: "http://tutorial.math.lamar.edu/",
    description: "The most comprehensive free math notes on the internet.",
    longDescription:
      "Paul Dawkins' notes are legendary among calculus and algebra students. Clear, thorough, and well-organized — covering Algebra, Calculus I/II/III, and Differential Equations with worked examples and cheat sheets.",
    category: "reference",
    level: "Advanced",
    topics: ["Algebra", "Calculus I", "Calculus II", "Calculus III", "Differential Equations"],
    icon: "📚",
    badge: "Free",
    color: "from-slate-500 to-gray-700",
  },
  {
    id: 12,
    title: "Math is Fun",
    url: "https://www.mathsisfun.com/",
    description: "Friendly explanations of math from basic to advanced.",
    longDescription:
      "Math is Fun offers clear, illustrated explanations of math concepts from basic arithmetic to advanced calculus. Every topic includes interactive examples, quizzes, and puzzles to test understanding.",
    category: "reference",
    level: "Beginner",
    topics: ["Arithmetic", "Geometry", "Algebra", "Statistics", "Puzzles"],
    icon: "🌟",
    badge: "Beginner Friendly",
    color: "from-pink-500 to-rose-600",
  },
  {
    id: 13,
    title: "Coursera — Math Courses",
    url: "https://www.coursera.org/browse/data-science/math-and-logic",
    description: "University math courses from top institutions worldwide.",
    longDescription:
      "Coursera partners with universities like Stanford, MIT, and Johns Hopkins to offer free auditable math courses — covering linear algebra, calculus, discrete math, and probability with graded assignments.",
    category: "video",
    level: "Advanced",
    topics: ["Linear Algebra", "Probability", "Discrete Math", "Calculus"],
    icon: "🏛️",
    badge: "University Level",
    color: "from-sky-500 to-blue-600",
  },
  {
    id: 14,
    title: "Math Open Reference",
    url: "https://www.mathopenref.com/",
    description: "Animated, interactive geometry definitions and proofs.",
    longDescription:
      "A free, online geometry reference with interactive animations for every definition — from basic point and line to complex proofs. Particularly powerful for exploring Euclidean geometry.",
    category: "reference",
    level: "Intermediate",
    topics: ["Geometry", "Trigonometry", "Coordinate Geometry"],
    icon: "🗺️",
    badge: "Free",
    color: "from-teal-500 to-cyan-600",
  },
];

const CATEGORIES: { value: Category; label: string; icon: string }[] = [
  { value: "all", label: "All Resources", icon: "✨" },
  { value: "interactive", label: "Interactive", icon: "🔭" },
  { value: "video", label: "Video & Courses", icon: "🎬" },
  { value: "practice", label: "Practice", icon: "🎯" },
  { value: "reference", label: "Reference", icon: "📚" },
  { value: "tools", label: "Tools", icon: "🧮" },
];

const LEVELS: Level[] = ["All Levels", "Beginner", "Intermediate", "Advanced"];

const BADGE_COLORS: Record<string, string> = {
  "Top Pick": "bg-amber-100 text-amber-800 border-amber-200",
  "Free": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Adaptive": "bg-blue-100 text-blue-800 border-blue-200",
  "Community": "bg-purple-100 text-purple-800 border-purple-200",
  "University Level": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "Beginner Friendly": "bg-pink-100 text-pink-800 border-pink-200",
  "Video": "bg-red-100 text-red-800 border-red-200",
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function Resources() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [activeLevel, setActiveLevel] = useState<Level | "all">("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = resources.filter(r => {
    const matchCat = activeCategory === "all" || r.category === activeCategory;
    const matchLevel = activeLevel === "all" || r.level === activeLevel || r.level === "All Levels";
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.topics.some(t => t.toLowerCase().includes(q));
    return matchCat && matchLevel && matchSearch;
  });

  const topPicks = resources.filter(r => r.badge === "Top Pick");

  return (
    <>
      <Head>
        <title>Math Learning Resources | Math Teacher</title>
        <meta
          name="description"
          content="Curated, high-quality math learning resources — from interactive tools and videos to competition math and university courses."
        />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 font-sans">

        {/* ── Hero ─────────────────────────────── */}
        <div className="relative overflow-hidden">
          {/* Background glow orbs */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-8 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative container mx-auto max-w-6xl px-6 py-20 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-semibold text-blue-200 mb-6">
              <span>📚</span> Curated Math Learning Hub
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tight leading-tight mb-5">
              Your Math{" "}
              <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                Learning Arsenal
              </span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
              Hand-picked resources from the world's best math educators and platforms.
              Whether you're a beginner or training for olympiads — we've got you covered.
            </p>

            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, topic (e.g. calculus, geometry)..."
                className="w-full bg-white/10 border border-white/20 backdrop-blur-sm text-white placeholder-slate-400 rounded-2xl px-5 py-4 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-base"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition text-lg"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-6xl px-6 pb-20">

          {/* ── Top Picks ────────────────────────── */}
          {!search && activeCategory === "all" && (
            <section className="mb-14">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">🏆</span>
                <h2 className="text-2xl font-black text-white">Top Picks</h2>
                <span className="text-slate-400 text-sm font-medium mt-0.5">Editor's choice resources</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topPicks.map(r => (
                  <a
                    key={r.id}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative bg-gradient-to-br from-white/10 to-white/5 border border-white/15 rounded-2xl p-6 hover:border-white/30 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${r.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`} />
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${r.color} flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                      {r.icon}
                    </div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">{r.title}</h3>
                      {r.badge && (
                        <span className={`text-xs font-bold border rounded-full px-2.5 py-0.5 whitespace-nowrap ${BADGE_COLORS[r.badge] || "bg-white/10 text-white border-white/20"}`}>
                          {r.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{r.description}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {r.topics.slice(0, 3).map(t => (
                        <span key={t} className="text-xs bg-white/10 text-slate-300 rounded-full px-2.5 py-0.5">{t}</span>
                      ))}
                    </div>
                    <div className="mt-4 text-blue-400 text-sm font-semibold group-hover:text-blue-300 transition-colors flex items-center gap-1">
                      Visit resource →
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* ── Filters ──────────────────────────── */}
          <section className="mb-8">
            {/* Category tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                    activeCategory === cat.value
                      ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-500/25"
                      : "bg-white/5 text-slate-300 border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Level filter + count */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400 text-sm font-medium">Level:</span>
                {(["all", ...LEVELS] as const).map(l => (
                  <button
                    key={l}
                    onClick={() => setActiveLevel(l)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                      activeLevel === l
                        ? "bg-violet-600 text-white border-violet-500"
                        : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {l === "all" ? "All Levels" : l}
                  </button>
                ))}
              </div>
              <span className="text-slate-500 text-sm">
                {filtered.length} resource{filtered.length !== 1 ? "s" : ""} found
              </span>
            </div>
          </section>

          {/* ── Resource Grid ────────────────────── */}
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-bold text-white mb-2">No results found</h3>
              <p className="text-slate-400">Try a different search term or category.</p>
              <button onClick={() => { setSearch(""); setActiveCategory("all"); setActiveLevel("all"); }} className="mt-5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(r => {
                const isExpanded = expandedId === r.id;
                return (
                  <div
                    key={r.id}
                    className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/25 hover:bg-white/8 transition-all duration-300 flex flex-col"
                  >
                    {/* Card header with gradient accent */}
                    <div className={`h-1.5 bg-gradient-to-r ${r.color}`} />

                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center text-xl shadow-md flex-shrink-0`}>
                          {r.icon}
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          {r.badge && (
                            <span className={`text-xs font-bold border rounded-full px-2.5 py-0.5 ${BADGE_COLORS[r.badge] || "bg-white/10 text-white border-white/20"}`}>
                              {r.badge}
                            </span>
                          )}
                          <span className="text-xs text-slate-500 border border-white/10 rounded-full px-2.5 py-0.5">
                            {r.level}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-white mb-1">{r.title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed mb-3">
                        {isExpanded ? r.longDescription : r.description}
                      </p>

                      {/* Topics */}
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {r.topics.map(t => (
                          <span key={t} className="text-xs bg-white/8 text-slate-400 border border-white/10 rounded-full px-2.5 py-0.5">
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto flex items-center gap-3">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex-1 text-center bg-gradient-to-r ${r.color} text-white font-bold py-2.5 rounded-xl text-sm shadow-md hover:opacity-90 hover:scale-[1.02] transition-all duration-200`}
                        >
                          Open Resource →
                        </a>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : r.id)}
                          title={isExpanded ? "Show less" : "Learn more"}
                          className="w-10 h-10 rounded-xl bg-white/8 border border-white/10 text-slate-400 hover:text-white hover:bg-white/15 transition flex items-center justify-center text-sm flex-shrink-0"
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

          {/* ── Learning Paths Banner ─────────────── */}
          <section className="mt-20 bg-gradient-to-r from-blue-600/30 to-violet-600/30 border border-blue-500/30 rounded-3xl p-8 md:p-12 text-center backdrop-blur-sm">
            <div className="text-5xl mb-4">🗺️</div>
            <h2 className="text-3xl font-black text-white mb-3">Suggested Learning Paths</h2>
            <p className="text-slate-300 max-w-xl mx-auto mb-8">
              Not sure where to start? Follow one of these structured paths to go from beginner to advanced.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl mx-auto text-left">
              {[
                {
                  title: "Middle School Essentials",
                  emoji: "🟢",
                  steps: ["Math is Fun (concepts)", "Khan Academy (practice)", "IXL Math (drilling)", "GeoGebra (geometry)"],
                },
                {
                  title: "High School & SAT Prep",
                  emoji: "🟡",
                  steps: ["Khan Academy (courses)", "Brilliant.org (puzzles)", "Desmos (graphing)", "Symbolab (problem solver)"],
                },
                {
                  title: "University & Competition",
                  emoji: "🔴",
                  steps: ["Art of Problem Solving", "Paul's Math Notes", "Professor Leonard", "3Blue1Brown (intuition)"],
                },
              ].map(path => (
                <div key={path.title} className="bg-white/8 border border-white/15 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{path.emoji}</span>
                    <h3 className="font-bold text-white text-base">{path.title}</h3>
                  </div>
                  <ol className="space-y-2">
                    {path.steps.map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-xs bg-white/15 text-slate-400 rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </section>

          {/* ── Back to Lessons CTA ───────────────── */}
          <div className="mt-12 text-center">
            <p className="text-slate-400 mb-4">Ready to practice what you've learned?</p>
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-blue-600 to-violet-600 text-white font-bold py-3.5 px-10 rounded-2xl hover:opacity-90 hover:scale-105 transition-all duration-200 shadow-xl shadow-blue-500/25"
            >
              ← Back to Lessons
            </Link>
          </div>

        </div>
      </div>
    </>
  );
}