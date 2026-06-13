import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCube, faTrophy, faCheckCircle, faRedo, faAward, faCheck, faPlay, faChevronRight } from "@fortawesome/free-solid-svg-icons";

type TableRow = { n: number; cube: number };

function generateTableRows(start: number, end: number): TableRow[] {
  return Array.from({ length: end - start + 1 }, (_, i) => {
    const n = i + start;
    return { n, cube: n * n * n };
  });
}

interface QuizQuestion {
  questionText: string;
  correctAnswer: number;
  inputPlaceholder: string;
}

export default function CubeRootExplorer() {
  const { user } = useUser();
  const userId = user?.id || "";
  
  // Score & Progress States
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  // Interactive Cube State
  const [visualSize, setVisualSize] = useState(3); // N for the 3D model

  // Study Table Tab
  const [activeTab, setActiveTab] = useState<"basic" | "medium" | "advanced">("basic");

  // Quiz Mode Selection State
  const [selectedMode, setSelectedMode] = useState<"root" | "cube">("root");

  // Randomized Quiz States
  const [quizActive, setQuizActive] = useState(false);
  const [quizDifficulty, setQuizDifficulty] = useState<"basic" | "medium" | "advanced">("basic");
  const [quizMode, setQuizMode] = useState<"root" | "cube">("root");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | ""; message: string }>({ type: "", message: "" });
  const [quizFinished, setQuizFinished] = useState(false);

  const answerInputRef = useRef<HTMLInputElement>(null);

  // Fetch score & completion from DB
  useEffect(() => {
    if (userId) {
      axios.get(`/api/score?userId=${userId}`).then(res => {
        setScore(res.data.score || 0);
      });
      axios.get(`/api/progress?userId=${userId}`).then(res => {
        const completedLessons = res.data.completedLessons || [];
        if (completedLessons.includes("cube")) {
          setCompleted(true);
        }
      });
    }
  }, [userId]);

  // Focus input on active question
  useEffect(() => {
    if (quizActive && !quizFinished && answerInputRef.current) {
      answerInputRef.current.focus();
    }
  }, [quizActive, currentQuestionIdx, quizFinished]);

  // Start a new 5-question randomized quiz round
  const startQuiz = (difficulty: "basic" | "medium" | "advanced", mode: "root" | "cube") => {
    let minN = 1, maxN = 10;
    if (difficulty === "medium") {
      minN = 11;
      maxN = 30;
    } else if (difficulty === "advanced") {
      minN = 31;
      maxN = 100;
    }

    const generatedQuestions: QuizQuestion[] = [];
    for (let i = 0; i < 5; i++) {
      // Pick random number in range
      const n = Math.floor(Math.random() * (maxN - minN + 1)) + minN;
      const cube = n * n * n;
      
      if (mode === "root") {
        generatedQuestions.push({
          questionText: `What is the cube root of ${cube}?`,
          correctAnswer: n,
          inputPlaceholder: "Enter the root (e.g. 5)"
        });
      } else {
        generatedQuestions.push({
          questionText: `What is ${n} cubed (${n}³)?`,
          correctAnswer: cube,
          inputPlaceholder: "Enter the product"
        });
      }
    }

    setQuestions(generatedQuestions);
    setQuizDifficulty(difficulty);
    setQuizMode(mode);
    setCurrentQuestionIdx(0);
    setUserAnswer("");
    setCorrectCount(0);
    setFeedback({ type: "", message: "" });
    setQuizFinished(false);
    setQuizActive(true);
  };

  const handleCheckAnswer = async () => {
    if (feedback.type !== "") return; // wait for user to click next

    const currentQ = questions[currentQuestionIdx];
    const parsedAns = parseInt(userAnswer);

    if (parsedAns === currentQ.correctAnswer) {
      setCorrectCount(prev => prev + 1);
      setFeedback({ type: "success", message: `Correct! The answer is indeed ${currentQ.correctAnswer}.` });
    } else {
      setFeedback({ type: "error", message: `Incorrect! The correct answer is ${currentQ.correctAnswer}.` });
    }
  };

  const handleNextQuestion = async () => {
    setFeedback({ type: "", message: "" });
    setUserAnswer("");

    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      // Quiz finished
      setQuizFinished(true);
      const pointsEarned = correctCount * 10; // 10 points per correct answer
      if (pointsEarned > 0 && userId) {
        const newScore = score + pointsEarned;
        setScore(newScore);
        await axios.post("/api/score", { userId, score: newScore });
      }
    }
  };

  const handleCompleteLesson = async () => {
    if (!userId) return;
    setSavingProgress(true);
    try {
      await axios.post("/api/progress", {
        userId,
        lessonId: "cube",
        action: "complete_lesson",
      });
      setCompleted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProgress(false);
    }
  };

  // Helper to render 3D isometric cube
  const renderIsometricCube = () => {
    const N = visualSize;
    const center = { x: 150, y: 170 };
    const S = Math.min(100 / N, 35); // size of each small block

    const blocks: React.ReactNode[] = [];

    // Loop through blocks in Painter's Algorithm order (back-to-front)
    for (let z = 0; z < N; z++) {
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          const cx = center.x + (x - y) * S * 0.866;
          const cy = center.y + (x + y) * S * 0.5 - z * S;

          // Face paths
          const topFace = `${cx},${cy - S} ${cx + S * 0.866},${cy - S * 0.5} ${cx},${cy} ${cx - S * 0.866},${cy - S * 0.5}`;
          const leftFace = `${cx - S * 0.866},${cy - S * 0.5} ${cx},${cy} ${cx},${cy + S} ${cx - S * 0.866},${cy + S * 0.5}`;
          const rightFace = `${cx},${cy} ${cx + S * 0.866},${cy - S * 0.5} ${cx + S * 0.866},${cy + S * 0.5} ${cx},${cy + S}`;

          blocks.push(
            <g key={`${x}-${y}-${z}`} className="transition-all duration-300">
              {/* Left Face */}
              <polygon points={leftFace} fill="#8B5CF6" stroke="#EDE9FE" strokeWidth="0.5" />
              {/* Right Face */}
              <polygon points={rightFace} fill="#6D28D9" stroke="#EDE9FE" strokeWidth="0.5" />
              {/* Top Face */}
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
      {/* Premium Hero Banner */}
      <div className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 text-white py-12 px-6 shadow-md mb-8">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center max-w-6xl">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-white/20 p-2 rounded-lg text-white">
                <FontAwesomeIcon icon={faCube} className="w-6 h-6" />
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight">Cube & Cube Roots</h1>
            </div>
            <p className="text-violet-100 text-lg max-w-xl">
              Study perfect cubes in the explorer, visualize their volume, and test your knowledge in the randomized quiz challenge!
            </p>
          </div>
          
          <div className="mt-6 md:mt-0 flex items-center gap-4">
            {userId && (
              <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 flex items-center gap-3">
                <FontAwesomeIcon icon={faTrophy} className="text-yellow-300 w-6 h-6" />
                <div>
                  <div className="text-xs text-violet-200 font-bold uppercase tracking-wider">Your Balance</div>
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
                {completed ? "Completed" : "Mark as Complete"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Column 1: Interactive visualizer (5 cols) */}
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
                  <span>Volume (N³): <span className="text-indigo-600 font-black">{visualSize * visualSize * visualSize}</span></span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={visualSize}
                  onChange={e => setVisualSize(parseInt(e.target.value))}
                  className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100/50 text-sm text-indigo-900">
              <span className="font-bold">Math Fact:</span> A cube with side length <span className="font-mono">{visualSize}</span> consists of exactly <span className="font-bold">{visualSize} × {visualSize} × {visualSize} = {visualSize * visualSize * visualSize}</span> blocks.
            </div>
          </div>

          {/* Column 2: Quiz & Study Area (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Real Randomized Quiz Card */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex flex-col justify-center min-h-[260px]">
              {!quizActive ? (
                // Launch Quiz Screen
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mx-auto mb-4">
                    <FontAwesomeIcon icon={faAward} className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">Randomized Quiz Challenge</h3>
                  <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">
                    Choose your mode and difficulty level to test your skills and earn points!
                  </p>

                  {userId ? (
                    <div className="flex flex-col items-center gap-6">
                      {/* Mode selector tab */}
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

                      {/* Difficulty Launch Buttons */}
                      <div className="flex flex-wrap gap-3 justify-center">
                        <button
                          onClick={() => startQuiz("basic", selectedMode)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faPlay} className="text-xs" />
                          Basic (1-10)
                        </button>
                        <button
                          onClick={() => startQuiz("medium", selectedMode)}
                          className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faPlay} className="text-xs" />
                          Medium (11-30)
                        </button>
                        <button
                          onClick={() => startQuiz("advanced", selectedMode)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md transition flex items-center gap-2"
                        >
                          <FontAwesomeIcon icon={faPlay} className="text-xs" />
                          Advanced (31-100)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-rose-500">
                      Please sign in to launch the quiz and earn points!
                    </p>
                  )}
                </div>
              ) : quizFinished ? (
                // Results Screen
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-500 mx-auto mb-4 border border-yellow-200">
                    <FontAwesomeIcon icon={faTrophy} className="w-10 h-10 animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2">Round Complete!</h3>
                  <p className="text-lg text-slate-600 mb-4">
                    You answered <span className="text-indigo-600 font-bold">{correctCount} / 5</span> questions correctly.
                  </p>
                  
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold px-6 py-3 rounded-xl inline-block mb-6">
                    + {correctCount * 10} Score Points Awarded!
                  </div>

                  <div>
                    <button
                      onClick={() => startQuiz(quizDifficulty, quizMode)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition mr-3"
                    >
                      <FontAwesomeIcon icon={faRedo} className="mr-2" />
                      Try Again
                    </button>
                    <button
                      onClick={() => setQuizActive(false)}
                      className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2.5 px-6 rounded-xl transition"
                    >
                      Back to Study
                    </button>
                  </div>
                </div>
              ) : (
                // Active Question Screen
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Question {currentQuestionIdx + 1} of 5 ({quizDifficulty} - {quizMode === "root" ? "roots" : "cubes"} mode)
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      Correct: {correctCount}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-slate-800 text-center mb-6">
                    {questions[currentQuestionIdx].questionText}
                  </h3>

                  <div className="flex gap-3 justify-center mb-4 max-w-sm mx-auto">
                    <input
                      type="number"
                      ref={answerInputRef}
                      value={userAnswer}
                      onChange={e => setUserAnswer(e.target.value)}
                      disabled={feedback.type !== ""}
                      className="border-2 border-slate-200 focus:border-indigo-500 focus:outline-none px-4 py-2.5 rounded-xl w-48 text-center text-xl font-bold transition"
                      placeholder={questions[currentQuestionIdx].inputPlaceholder}
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          if (feedback.type === "") {
                            handleCheckAnswer();
                          } else {
                            handleNextQuestion();
                          }
                        }
                      }}
                    />
                    {feedback.type === "" ? (
                      <button
                        onClick={handleCheckAnswer}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition"
                      >
                        Submit
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuestion}
                        className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 py-2.5 rounded-xl shadow-md transition flex items-center gap-1"
                      >
                        Next
                        <FontAwesomeIcon icon={faChevronRight} className="text-xs" />
                      </button>
                    )}
                  </div>

                  {feedback.message && (
                    <div className={`p-3 rounded-xl font-semibold text-center text-sm transition-all duration-300 max-w-sm mx-auto ${
                      feedback.type === "success" 
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-800" 
                        : "bg-rose-50 border border-rose-200 text-rose-800"
                    }`}>
                      {feedback.message}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Study Tables Card */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Perfect Cubes Study Guide</h3>
                  <p className="text-xs text-slate-400">Review these perfect cubes before launching the quiz.</p>
                </div>
                
                {/* Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab("basic")}
                    className={`px-3 py-1.5 rounded-lg transition ${activeTab === "basic" ? "bg-white text-indigo-600 shadow" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    1-10
                  </button>
                  <button
                    onClick={() => setActiveTab("medium")}
                    className={`px-3 py-1.5 rounded-lg transition ${activeTab === "medium" ? "bg-white text-indigo-600 shadow" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    11-30
                  </button>
                  <button
                    onClick={() => setActiveTab("advanced")}
                    className={`px-3 py-1.5 rounded-lg transition ${activeTab === "advanced" ? "bg-white text-indigo-600 shadow" : "text-slate-600 hover:text-slate-900"}`}
                  >
                    31-100
                  </button>
                </div>
              </div>

              {/* Tab Content */}
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
                    {(() => {
                      let start = 1, end = 10;
                      if (activeTab === "medium") {
                        start = 11;
                        end = 30;
                      } else if (activeTab === "advanced") {
                        start = 31;
                        end = 100;
                      }

                      return generateTableRows(start, end).map(row => (
                        <tr key={row.n} className="hover:bg-slate-50/50 transition">
                          <td className="px-4 py-3 font-semibold text-slate-700">{row.n}</td>
                          <td className="px-4 py-3 font-mono text-slate-500">{row.n} × {row.n} × {row.n}</td>
                          <td className="px-4 py-3 font-mono text-indigo-600 font-bold">{row.cube}</td>
                        </tr>
                      ));
                    })()}
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