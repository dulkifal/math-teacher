import { useEffect, useState } from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import axios from "axios";

type QuizAttempt = {
  id: string;
  topic: string;
  score: number;
  total: number;
  createdAt: string;
};

const allLessons = [
  { id: "angle", name: "Angles", icon: "📐", href: "/angle", desc: "Understand angles and transversals." },
  { id: "addition", name: "Addition & Subtraction", icon: "➕", href: "/addition", desc: "Visual addition on a number line." },
  { id: "triangle", name: "Triangles", icon: "🔺", href: "/triangle", desc: "Explore altitutes and medians." },
  { id: "symmetry", name: "Symmetry", icon: "🎨", href: "/symmetry", desc: "Discover rotational & reflectional symmetry." },
  { id: "cube", name: "Cube Roots", icon: "🧊", href: "/cube", desc: "Challenge yourself with cube roots." },
  { id: "rational", name: "Rational Numbers", icon: "➗", href: "/rational", desc: "Understand ratios and numbers." },
  { id: "fractions", name: "Fractions", icon: "🍕", href: "/fractions", desc: "Explore fraction pizza slices & comparisons." },
  { id: "grapher", name: "Linear Grapher", icon: "📉", href: "/grapher", desc: "Drag slope and y-intercept interactively." },
];

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [score, setScore] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);

  useEffect(() => {
    if (user?.id) {
      Promise.all([
        axios.get(`/api/score?userId=${user.id}`),
        axios.get(`/api/progress?userId=${user.id}`),
      ])
        .then(([scoreRes, progressRes]) => {
          setScore(scoreRes.data.score || 0);
          setCompletedLessons(progressRes.data.completedLessons || []);
          setQuizAttempts(progressRes.data.quizAttempts || []);
        })
        .catch((err) => console.error("Error loading dashboard data:", err));
    }
  }, [user]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
        <div className="max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
          <div className="text-6xl mb-4">🎓</div>
          <h1 className="text-3xl font-extrabold text-gray-950 mb-3">Unlock Your Learning Journey</h1>
          <p className="text-gray-600 mb-8">
            Create an account or sign in to track your math progress, save quiz high scores, and unlock personalized achievements.
          </p>
          <SignInButton mode="modal">
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-[1.02] shadow-lg">
              Sign In to Begin
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  // Calculate Badges
  const badges = [];
  if (score >= 5) badges.push({ name: "Math Cadet", desc: "Reached 5+ score points", icon: "🥉", color: "from-amber-500 to-amber-700" });
  if (score >= 20) badges.push({ name: "Math Master", desc: "Reached 20+ score points", icon: "🥈", color: "from-slate-400 to-slate-600" });
  if (score >= 50) badges.push({ name: "Newton Prodigy", desc: "Reached 50+ score points", icon: "🥇", color: "from-yellow-400 to-amber-500 animate-pulse" });
  if (completedLessons.length >= 4) badges.push({ name: "Explorer", desc: "Completed 4+ interactive lessons", icon: "🚀", color: "from-purple-500 to-indigo-600" });
  if (quizAttempts.length >= 3) badges.push({ name: "Relentless Learner", desc: "Attempted 3+ quizzes", icon: "🧠", color: "from-emerald-500 to-teal-600" });

  const progressPercentage = Math.round((completedLessons.length / allLessons.length) * 100);

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Welcome back, {user.firstName || "Explorer"}! 👋
            </h1>
            <p className="text-blue-100 text-lg">
              You are making stellar progress. Let&apos;s learn some more math today!
            </p>
          </div>
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
            <span className="text-4xl">🏆</span>
            <div>
              <div className="text-sm text-blue-200 font-semibold uppercase tracking-wider">Overall Points</div>
              <div className="text-3xl font-black">{score}</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Progress Card */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-2">Lesson Progress</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-gray-900">{completedLessons.length}</span>
                <span className="text-gray-400">/ {allLessons.length} Completed</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm font-semibold text-gray-600 mb-1">
                <span>Completion</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </div>
          </div>

          {/* Quizzes Attempted */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-2">Quizzes Attempted</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-gray-900">{quizAttempts.length}</span>
                <span className="text-gray-400">Attempts Logged</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Practice makes perfect. Re-take quizzes anytime to beat your high score!
            </p>
          </div>

          {/* Achievements Summary */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-2">Unlocked Badges</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black text-gray-900">{badges.length}</span>
                <span className="text-gray-400">Achievements</span>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pt-4 pb-1">
              {badges.length === 0 ? (
                <span className="text-sm text-gray-400 italic">Complete lessons & earn points to unlock badges!</span>
              ) : (
                badges.map((b) => (
                  <span key={b.name} className="text-2xl cursor-help" title={`${b.name}: ${b.desc}`}>
                    {b.icon}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lessons list (Left columns) */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Your Math Lessons</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allLessons.map((lesson) => {
                const isCompleted = completedLessons.includes(lesson.id);
                return (
                  <Link
                    href={lesson.href}
                    key={lesson.id}
                    className="group flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-300"
                  >
                    <div className="text-3xl p-3 bg-blue-50 group-hover:bg-blue-100 rounded-xl transition-colors">
                      {lesson.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {lesson.name}
                        </h3>
                        {isCompleted ? (
                          <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                            ✓ Done
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-gray-400">
                            Not Started
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1 truncate">{lesson.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Badges and History (Right column) */}
          <div className="space-y-8">
            {/* Badges Panel */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Achievements</h2>
              <div className="space-y-4">
                {badges.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No achievements yet. Start learning!</p>
                ) : (
                  badges.map((b) => (
                    <div key={b.name} className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${b.color} text-white text-2xl shadow-sm`}>
                        {b.icon}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm">{b.name}</h4>
                        <p className="text-xs text-gray-500">{b.desc}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Quiz Attempt History */}
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Quiz History</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {quizAttempts.length === 0 ? (
                  <p className="text-sm text-gray-400 italic">No quizzes taken yet.</p>
                ) : (
                  quizAttempts.slice(0, 10).map((attempt) => {
                    const percent = Math.round((attempt.score / attempt.total) * 100);
                    let badgeColor = "bg-red-50 text-red-600 border-red-100";
                    if (percent >= 80) badgeColor = "bg-emerald-50 text-emerald-600 border-emerald-100";
                    else if (percent >= 50) badgeColor = "bg-amber-50 text-amber-600 border-amber-100";

                    return (
                      <div key={attempt.id} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100 text-sm">
                        <div className="min-w-0">
                          <div className="font-bold text-gray-800 truncate">{attempt.topic}</div>
                          <div className="text-xs text-gray-400">
                            {new Date(attempt.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>
                        <div className={`font-mono font-bold px-2 py-0.5 rounded border ${badgeColor}`}>
                          {attempt.score}/{attempt.total}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
