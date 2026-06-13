import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCube, faTrophy, faCheckCircle, faCheck, faPlay, faAward,
} from "@fortawesome/free-solid-svg-icons";
import QuizEngine, { QuizQuestion } from "@/components/QuizEngine";

type TableRow = { n: number; cube: number };

function generateTableRows(start: number, end: number): TableRow[] {
  return Array.from({ length: end - start + 1 }, (_, i) => {
    const n = i + start;
    return { n, cube: n * n * n };
  });
}

type Difficulty = "basic" | "medium" | "advanced";
type Mode = "root" | "cube";

function buildQuestions(difficulty: Difficulty, mode: Mode): QuizQuestion[] {
  let minN = 1, maxN = 10;
  if (difficulty === "medium") { minN = 5; maxN = 20; }
  if (difficulty === "advanced") { minN = 10; maxN = 30; }

  const conceptId =
    difficulty === "basic" ? `cube_${mode}_easy` :
    difficulty === "medium" ? `cube_${mode}_medium` :
    `cube_${mode}_hard`;

  const questions: QuizQuestion[] = [];
  for (let i = 0; i < 5; i++) {
    const n = Math.floor(Math.random() * (maxN - minN + 1)) + minN;
    const cube = n * n * n;
    const id = `${conceptId}_${n}_${Date.now()}_${i}`;

    if (mode === "root") {
      questions.push({
        id,
        conceptId,
        questionText: `What is the cube root of ${cube}? (∛${cube} = ?)`,
        correctAnswer: n,
        difficulty: difficulty === "basic" ? 1 : difficulty === "medium" ? 3 : 5,
        hint: difficulty === "basic"
          ? `Think: which number × itself × itself = ${cube}?`
          : undefined,
      });
    } else {
      questions.push({
        id,
        conceptId,
        questionText: `What is ${n}³ (${n} cubed)?`,
        correctAnswer: cube,
        difficulty: difficulty === "basic" ? 1 : difficulty === "medium" ? 3 : 5,
        hint: difficulty === "basic"
          ? `Multiply: ${n} × ${n} × ${n}`
          : undefined,
      });
    }
  }
  return questions;
}

export default function CubeRootExplorer() {
  const { user } = useUser();
  const userId = user?.id || "";

  // Score & Progress States
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  // Interactive Cube State
  const [visualSize, setVisualSize] = useState(3);

  // Study Table Tab
  const [activeTab, setActiveTab] = useState<Difficulty>("basic");

  // Quiz Mode Selection
  const [selectedMode, setSelectedMode] = useState<Mode>("root");
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>("basic");

  // Quiz Engine State
  const [quizKey, setQuizKey] = useState(0); // increment to remount engine
  const [quizActive, setQuizActive] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [lastScore, setLastScore] = useState({ score: 0, total: 0 });

  // Fetch score & completion
  useEffect(() => {
    if (userId) {
      axios.get(`/api/score?userId=${userId}`).then(res => setScore(res.data.score || 0));
      axios.get(`/api/progress?userId=${userId}`).then(res => {
        if ((res.data.completedLessons || []).includes("cube")) setCompleted(true);
      });
    }
  }, [userId]);

  const handleStartQuiz = () => {
    const questions = buildQuestions(selectedDifficulty, selectedMode);
    setQuizQuestions(questions);
    setQuizComplete(false);
    setQuizKey(k => k + 1);
    setQuizActive(true);
  };

  const handleQuizComplete = useCallback(async (s: number, total: number) => {
    setLastScore({ score: s, total });
    setQuizComplete(true);
    const pointsEarned = s * 10;
    if (pointsEarned > 0 && userId) {
      const newScore = score + pointsEarned;
      setScore(newScore);
      await axios.post("/api/score", { userId, score: newScore });
    }
  }, [score, userId]);

  const handleCompleteLesson = async () => {
    if (!userId) return;
    setSavingProgress(true);
    try {
      await axios.post("/api/progress", { userId, lessonId: "cube", action: "complete_lesson" });
      setCompleted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProgress(false);
    }
  };

  // Isometric cube renderer
  const renderIsometricCube = () => {
    const N = visualSize;
    const center = { x: 150, y: 170 };
    const S = Math.min(100 / N, 35);
    const blocks: React.ReactNode[] = [];
    for (let z = 0; z < N; z++) {
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          const cx = center.x + (x - y) * S * 0.866;
          const cy = center.y + (x + y) * S * 0.5 - z * S;
          const topFace = `${cx},${cy - S} ${cx + S * 0.866},${cy - S * 0.5} ${cx},${cy} ${cx - S * 0.866},${cy - S * 0.5}`;
          const leftFace = `${cx - S * 0.866},${cy - S * 0.5} ${cx},${cy} ${cx},${cy + S} ${cx - S * 0.866},${cy + S * 0.5}`;
          const rightFace = `${cx},${cy} ${cx + S * 0.866},${cy - S * 0.5} ${cx + S * 0.866},${cy + S * 0.5} ${cx},${cy + S}`;
          blocks.push(
            <g key={`${x}-${y}-${z}`} className="transition-all duration-300">
              <polygon points={leftFace} fill="#8B5CF6" stroke="#EDE9FE" strokeWidth="0.5" />
              <polygon points={rightFace} fill="#6D28D9" stroke="#EDE9FE" strokeWidth="0.5" />
              <polygon points={topFace} fill="#A78BFA" stroke="#EDE9FE" strokeWidth="0.5" />
            </g>
          );
        }
      }
    }
    return (
      <svg viewBox="0 0 300 300" className="w-full h-64 bg-white border border-indigo-100 rounded-xl shadow-inner">
        {blocks}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white py-12 px-6 shadow-md mb-8">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center max-w-6xl">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-white/20 p-2 rounded-lg">
                <FontAwesomeIcon icon={faCube} className="w-6 h-6" />
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight">Cube &amp; Cube Roots</h1>
            </div>
            <p className="text-violet-100 text-lg max-w-xl">
              Study perfect cubes, visualize their volume in 3D, and challenge yourself with adaptive quizzes that track your mastery!
            </p>
          </div>

          <div className="mt-6 md:mt-0 flex items-center gap-4">
            {userId && (
              <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 flex items-center gap-3">
                <FontAwesomeIcon icon={faTrophy} className="text-yellow-300 w-6 h-6" />
                <div>
                  <div className="text-xs text-violet-200 font-bold uppercase tracking-wider">Your Points</div>
                  <div className="text-2xl font-black">{score} pts</div>
                </div>
              </div>
            )}

            {userId && (
              <button
                onClick={handleCompleteLesson}
                disabled={completed || savingProgress}
                className={`flex items-center gap-2 font-bold px-6 py-3 rounded-full shadow-lg transition duration-300 ${
                  completed
                    ? "bg-emerald-500 text-white cursor-default"
                    : "bg-white text-indigo-600 hover:bg-indigo-50 hover:scale-105"
                }`}
              >
                <FontAwesomeIcon icon={completed ? faCheck : faCheckCircle} />
                {completed ? "Completed ✓" : "Mark as Complete"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Column 1: 3D Visualizer (5 cols) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-2">3D Volume Visualizer</h2>
              <p className="text-sm text-gray-500 mb-6">
                Adjust the slider to see how side length relates to the number of cubic units.
              </p>
              {renderIsometricCube()}
              <div className="mt-6">
                <label className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                  <span>Side Length (N): <span className="text-indigo-600 font-black">{visualSize}</span></span>
                  <span>Volume (N³): <span className="text-indigo-600 font-black">{visualSize ** 3}</span></span>
                </label>
                <input
                  type="range" min="1" max="5" step="1"
                  value={visualSize}
                  onChange={e => setVisualSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>
            <div className="mt-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 text-sm text-indigo-900">
              <span className="font-bold">Math Fact:</span> A cube with side length{" "}
              <span className="font-mono">{visualSize}</span> has exactly{" "}
              <span className="font-bold">{visualSize} × {visualSize} × {visualSize} = {visualSize ** 3}</span> blocks.
            </div>
          </div>

          {/* Column 2: Quiz + Study (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">

            {/* Quiz Card */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 min-h-[300px] flex flex-col justify-center">
              {!quizActive ? (
                // Quiz Launch Screen
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mx-auto mb-4">
                    <FontAwesomeIcon icon={faAward} className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Adaptive Quiz Challenge</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                    Choose your mode and difficulty. Your concept mastery is tracked after every answer!
                  </p>

                  {userId ? (
                    <div className="flex flex-col items-center gap-5">
                      {/* Mode tabs */}
                      <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                        <button
                          onClick={() => setSelectedMode("root")}
                          className={`px-4 py-2 rounded-lg transition ${selectedMode === "root" ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:text-slate-900"}`}
                        >
                          Find Cube Roots (∛x)
                        </button>
                        <button
                          onClick={() => setSelectedMode("cube")}
                          className={`px-4 py-2 rounded-lg transition ${selectedMode === "cube" ? "bg-indigo-600 text-white shadow" : "text-slate-600 hover:text-slate-900"}`}
                        >
                          Calculate Cubes (x³)
                        </button>
                      </div>

                      {/* Difficulty buttons */}
                      <div className="flex flex-wrap gap-3 justify-center">
                        {(["basic", "medium", "advanced"] as Difficulty[]).map(d => (
                          <button
                            key={d}
                            onClick={() => setSelectedDifficulty(d)}
                            className={`border-2 font-bold py-2 px-5 rounded-xl transition capitalize ${
                              selectedDifficulty === d
                                ? "border-indigo-600 bg-indigo-600 text-white shadow-md"
                                : "border-slate-200 text-slate-600 hover:border-indigo-400"
                            }`}
                          >
                            {d === "basic" ? "🟢 Basic (1–10)" : d === "medium" ? "🟡 Medium (5–20)" : "🔴 Advanced (10–30)"}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={handleStartQuiz}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-10 rounded-xl shadow-md transition flex items-center gap-2 text-base"
                      >
                        <FontAwesomeIcon icon={faPlay} className="text-sm" />
                        Start Quiz
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-rose-500">
                      Please sign in to launch the quiz and track your mastery!
                    </p>
                  )}
                </div>
              ) : quizComplete ? (
                // After quiz — show restart options
                <div className="text-center py-6">
                  <h3 className="text-xl font-bold text-slate-700 mb-2">
                    You scored {lastScore.score}/{lastScore.total}!
                  </h3>
                  <p className="text-slate-500 text-sm mb-5">
                    Your concept mastery was updated. Want to try again or change difficulty?
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={handleStartQuiz}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={() => setQuizActive(false)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2.5 px-6 rounded-xl transition"
                    >
                      Change Settings
                    </button>
                  </div>
                </div>
              ) : (
                // Active Quiz Engine
                <QuizEngine
                  key={quizKey}
                  questions={quizQuestions}
                  userId={userId}
                  topic={`Cube Roots — ${selectedDifficulty} (${selectedMode})`}
                  accentColor="indigo"
                  onComplete={handleQuizComplete}
                  onScoreEarned={(pts) => {
                    if (pts > 0) setScore(s => s + 0); // score updated in onComplete
                  }}
                />
              )}
            </div>

            {/* Study Tables Card */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Perfect Cubes Study Guide</h3>
                  <p className="text-xs text-slate-400">Review these perfect cubes before launching the quiz.</p>
                </div>
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  {(["basic", "medium", "advanced"] as Difficulty[]).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-lg transition capitalize ${activeTab === tab ? "bg-white text-indigo-600 shadow" : "text-slate-600 hover:text-slate-900"}`}
                    >
                      {tab === "basic" ? "1–10" : tab === "medium" ? "11–30" : "31–100"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto border border-slate-100 rounded-xl">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-left text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                      <th className="px-4 py-2">Number (N)</th>
                      <th className="px-4 py-2">Formula (N³)</th>
                      <th className="px-4 py-2">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {generateTableRows(
                      activeTab === "basic" ? 1 : activeTab === "medium" ? 11 : 31,
                      activeTab === "basic" ? 10 : activeTab === "medium" ? 30 : 100
                    ).map(row => (
                      <tr key={row.n} className="hover:bg-slate-50/50 transition">
                        <td className="px-4 py-3 font-semibold text-slate-700">{row.n}</td>
                        <td className="px-4 py-3 font-mono text-slate-500">{row.n} × {row.n} × {row.n}</td>
                        <td className="px-4 py-3 font-mono text-indigo-600 font-bold">{row.cube}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}