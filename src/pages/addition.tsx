import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";

export default function Addition() {
  const { user } = useUser();
  const userId = user?.id || "";

  // Progress and Completion States
  const [completed, setCompleted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<"visualizer" | "properties" | "quiz">("visualizer");

  // Visualizer States
  const [num1, setNum1] = useState<number>(5);
  const [num2, setNum2] = useState<number>(3);
  const [operation, setOperation] = useState<"add" | "subtract">("add");
  const [result, setResult] = useState<number>(8);

  // Quiz States
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const quizQuestions = [
    {
      id: 1,
      question: "What is the result of 7 + (-12) on a number line?",
      options: ["5", "-5", "19", "-19"],
      correct: "-5",
      explanation: "Starting at 7 and moving left (due to negative sign) by 12 units lands you on -5.",
    },
    {
      id: 2,
      question: "Which property is shown by: 14 + (6 + 8) = (14 + 6) + 8?",
      options: ["Commutative Property", "Identity Property", "Associative Property", "Distributive Property"],
      correct: "Associative Property",
      explanation: "The Associative Property states that how you group numbers in addition does not affect the sum.",
    },
    {
      id: 3,
      question: "What is the value of x in: (-15) + x = -15?",
      options: ["15", "0", "-15", "1"],
      correct: "0",
      explanation: "According to the Identity Property, adding 0 to any number leaves it unchanged. So x = 0.",
    },
  ];

  // Calculate result when numbers or operation change
  useEffect(() => {
    const val1 = Number(num1) || 0;
    const val2 = Number(num2) || 0;
    if (operation === "add") {
      setResult(val1 + val2);
    } else {
      setResult(val1 - val2);
    }
  }, [num1, num2, operation]);

  // Fetch completion state on mount
  useEffect(() => {
    if (userId) {
      axios.get(`/api/progress?userId=${userId}`).then((res) => {
        const completedLessons = res.data.completedLessons || [];
        if (completedLessons.includes("addition")) {
          setCompleted(true);
        }
      });
    }
  }, [userId]);

  // Mark Lesson as Completed
  const handleCompleteLesson = async () => {
    if (!userId) return;
    setSavingProgress(true);
    try {
      await axios.post("/api/progress", {
        userId,
        lessonId: "addition",
        action: "complete_lesson",
      });
      setCompleted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProgress(false);
    }
  };

  // Submit Quiz
  const handleSubmitQuiz = async () => {
    let score = 0;
    quizQuestions.forEach((q) => {
      if (answers[q.id] === q.correct) {
        score++;
      }
    });
    setQuizScore(score);

    if (userId) {
      try {
        await axios.post("/api/progress", {
          userId,
          action: "submit_quiz",
          topic: "Addition & Subtraction",
          score,
          total: quizQuestions.length,
        });

        const pointsAwarded = score === quizQuestions.length ? 5 : score;
        if (pointsAwarded > 0) {
          const currentScoreRes = await axios.get(`/api/score?userId=${userId}`);
          const currentScore = currentScoreRes.data.score || 0;
          await axios.post("/api/score", {
            userId,
            score: currentScore + pointsAwarded,
          });
        }
      } catch (err) {
        console.error("Failed to log score:", err);
      }
    }
  };

  // Range Configuration
  const MIN_NUMBER_LINE = -15;
  const MAX_NUMBER_LINE = 15;
  const NUMBER_LINE_UNIT_WIDTH = 32; // wider units for visual spacing

  const birdScaleX = (result - num1) < 0 ? -1 : 1;

  // Render visual number line tick offsets
  const totalUnits = MAX_NUMBER_LINE - MIN_NUMBER_LINE;
  const linePixelWidth = totalUnits * NUMBER_LINE_UNIT_WIDTH;

  const getLeftPx = (val: number) => {
    const clamped = Math.max(MIN_NUMBER_LINE, Math.min(MAX_NUMBER_LINE, val));
    return (clamped - MIN_NUMBER_LINE) * NUMBER_LINE_UNIT_WIDTH;
  };

  const pathLeft = Math.min(getLeftPx(num1), getLeftPx(result));
  const pathWidth = Math.abs(getLeftPx(result) - getLeftPx(num1));
  const pathColorClass = (result - num1) >= 0 ? "bg-emerald-500" : "bg-rose-500";

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-950 flex items-center gap-2">
              ➕ Addition & Subtraction on a Number Line
            </h1>
            <p className="text-gray-500 mt-1">
              Visualize how positive and negative values shift positions across the horizontal number axis.
            </p>
          </div>
          {userId && (
            <div>
              {completed ? (
                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 font-bold flex items-center gap-1">
                  ✓ Lesson Completed
                </div>
              ) : (
                <button
                  onClick={handleCompleteLesson}
                  disabled={savingProgress}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold px-5 py-2.5 rounded-xl shadow transition duration-200"
                >
                  {savingProgress ? "Saving..." : "Mark as Completed"}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("visualizer")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all ${
              activeTab === "visualizer" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Number Line Visualizer
          </button>
          <button
            onClick={() => setActiveTab("properties")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all ${
              activeTab === "properties" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Math Properties
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all ${
              activeTab === "quiz" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Take Quiz
          </button>
        </div>

        {/* Tab Content: Visualizer */}
        {activeTab === "visualizer" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
            
            {/* Input Panel */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
              <input
                type="number"
                min={MIN_NUMBER_LINE}
                max={MAX_NUMBER_LINE}
                value={num1}
                onChange={(e) => setNum1(Number(e.target.value))}
                className="border border-slate-300 rounded-xl p-3 w-32 text-center font-mono font-bold text-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
              />
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value as "add" | "subtract")}
                className="border border-slate-300 rounded-xl p-3 bg-white text-slate-900 text-lg font-bold cursor-pointer focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              >
                <option value="add">+</option>
                <option value="subtract">-</option>
              </select>
              <input
                type="number"
                min={MIN_NUMBER_LINE}
                max={MAX_NUMBER_LINE}
                value={num2}
                onChange={(e) => setNum2(Number(e.target.value))}
                className="border border-slate-300 rounded-xl p-3 w-32 text-center font-mono font-bold text-lg bg-white text-slate-900 focus:ring-2 focus:ring-blue-400 focus:border-transparent transition duration-200"
              />
              <span className="text-2xl font-black text-slate-500">=</span>
              <span className="text-3xl font-black text-blue-600 bg-blue-50 px-5 py-2.5 rounded-xl border border-blue-100 font-mono">
                {result}
              </span>
            </div>

            {/* Scrollable Number Line */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900">Interactive Map</h3>
              <div className="w-full overflow-x-auto py-8 bg-slate-50 rounded-2xl border border-slate-200 shadow-inner px-4 relative">
                
                <div className="relative h-28" style={{ width: `${linePixelWidth}px` }}>
                  {/* Horizon axis line */}
                  <div className="absolute h-1 bg-slate-400 rounded" style={{ left: 0, right: 0, top: "50%" }} />

                  {/* Ticks and Labels */}
                  {Array.from({ length: totalUnits + 1 }).map((_, i) => {
                    const number = MIN_NUMBER_LINE + i;
                    const leftPosition = `${i * NUMBER_LINE_UNIT_WIDTH}px`;
                    const isZero = number === 0;

                    return (
                      <div
                        key={number}
                        className="absolute flex flex-col items-center"
                        style={{ left: leftPosition, top: "50%", transform: "translate(-50%, -50%)" }}
                      >
                        <div className={`w-[2px] h-4 ${isZero ? "bg-red-500 h-6 w-[3px]" : "bg-slate-400"} mb-1`} />
                        <span className={`text-xs font-mono font-semibold ${isZero ? "text-red-500 font-bold" : "text-slate-500"}`}>
                          {number}
                        </span>
                      </div>
                    );
                  })}

                  {/* Start Point Marker */}
                  <div
                    className="absolute z-20 transition-all duration-700 ease-out"
                    style={{ left: `${getLeftPx(num1)}px`, top: "10%", transform: "translateX(-50%)" }}
                  >
                    <div className="bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-black px-2 py-0.5 rounded-full absolute -top-6 left-1/2 -translate-x-1/2 shadow-sm whitespace-nowrap">
                      Start: {num1}
                    </div>
                    <span className="text-3xl filter drop-shadow">📍</span>
                  </div>

                  {/* Path Arrow Line */}
                  {pathWidth > 0 && (
                    <div
                      className={`absolute h-1.5 ${pathColorClass} opacity-80 rounded-full transition-all duration-700 z-10`}
                      style={{
                        left: `${pathLeft}px`,
                        width: `${pathWidth}px`,
                        top: "52%",
                      }}
                    />
                  )}

                  {/* Bird / End Point Marker */}
                  <div
                    className="absolute z-20 transition-all duration-700 ease-out"
                    style={{ left: `${getLeftPx(result)}px`, top: "5%", transform: "translateX(-50%)" }}
                  >
                    <div className="bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-black px-2 py-0.5 rounded-full absolute -top-6 left-1/2 -translate-x-1/2 shadow-sm whitespace-nowrap">
                      End: {result}
                    </div>
                    <span
                      role="img"
                      aria-label="bird"
                      className="text-4xl block animate-bounce-bird"
                      style={{ transform: `scaleX(${birdScaleX})` }}
                    >
                      🐦
                    </span>
                  </div>

                </div>
              </div>
              <p className="text-xs text-gray-400 italic text-center">
                ← Scroll horizontally to see larger numbers on the axis. The bird represents the landing coordinate. →
              </p>
            </div>

            {/* Instruction sidebar */}
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-800 space-y-1.5">
              <h4 className="font-bold">💡 How to Read the Number Line:</h4>
              <p>
                Adding a **positive** number (or subtracting a negative) moves the bird to the **right** (indicated by green).
                Subtracting a **positive** number (or adding a negative) moves the bird to the **left** (indicated by red).
              </p>
            </div>
          </div>
        )}

        {/* Tab Content: Properties */}
        {activeTab === "properties" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-2">Properties of Addition</h3>
            
            <div className="grid grid-cols-1 gap-6">
              {/* Associative Property */}
              <div className="p-5 border border-purple-100 rounded-2xl bg-purple-50/50 space-y-3">
                <h4 className="text-lg font-bold text-purple-800 flex items-center gap-2">
                  <span>🔗</span> Associative Property
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Grouping addends differently does not change their sum. You can shift parenthetical groupings as you like.
                </p>
                <div className="font-mono bg-purple-100/70 border border-purple-200/50 px-4 py-2 rounded-xl inline-block text-sm text-purple-800">
                  (a + b) + c = a + (b + c)
                </div>
                <p className="text-xs text-gray-500 italic">
                  Example: (2 + 3) + 4 = 5 + 4 = 9, and 2 + (3 + 4) = 2 + 7 = 9.
                </p>
              </div>

              {/* Commutative Property */}
              <div className="p-5 border border-emerald-100 rounded-2xl bg-emerald-50/50 space-y-3">
                <h4 className="text-lg font-bold text-emerald-800 flex items-center gap-2">
                  <span>🔄</span> Commutative Property
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Changing the order of the numbers being added does not change the resulting sum.
                </p>
                <div className="font-mono bg-emerald-100/70 border border-emerald-200/50 px-4 py-2 rounded-xl inline-block text-sm text-emerald-800">
                  a + b = b + a
                </div>
                <p className="text-xs text-gray-500 italic">
                  Example: 5 + 8 = 13, and 8 + 5 = 13.
                </p>
              </div>

              {/* Identity Property */}
              <div className="p-5 border border-amber-100 rounded-2xl bg-amber-50/50 space-y-3">
                <h4 className="text-lg font-bold text-amber-800 flex items-center gap-2">
                  <span>✨</span> Identity Property (Additive Identity)
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  The sum of any number and zero is equal to the original number. Zero does not change values in addition.
                </p>
                <div className="font-mono bg-amber-100/70 border border-amber-200/50 px-4 py-2 rounded-xl inline-block text-sm text-amber-800">
                  a + 0 = a
                </div>
                <p className="text-xs text-gray-500 italic">
                  Example: 15 + 0 = 15.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Quiz */}
        {activeTab === "quiz" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-2xl font-bold text-gray-900">Number Axis Quiz</h3>
              <p className="text-sm text-gray-500 mt-1">Test your sum skills. Perfect score gets 5 points overall!</p>
            </div>

            {quizScore === null ? (
              <div className="space-y-8">
                {quizQuestions.map((q, idx) => (
                  <div key={q.id} className="space-y-3">
                    <h4 className="font-bold text-gray-900">
                      {idx + 1}. {q.question}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((option) => {
                        const isSelected = answers[q.id] === option;
                        return (
                          <button
                            key={option}
                            onClick={() => setAnswers({ ...answers, [q.id]: option })}
                            className={`p-3.5 rounded-xl border text-left font-medium transition-all ${
                              isSelected
                                ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                                : "border-gray-200 hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                <button
                  onClick={handleSubmitQuiz}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow transition duration-200"
                >
                  Submit Answers
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="text-center p-6 bg-blue-50 border border-blue-100 rounded-2xl">
                  <div className="text-sm font-semibold uppercase text-blue-500 mb-1">Your Score</div>
                  <div className="text-5xl font-black text-blue-900">{quizScore} / {quizQuestions.length}</div>
                  <p className="text-sm text-blue-800 mt-2 font-semibold">
                    {quizScore === quizQuestions.length ? "🌟 Perfect! You earned 5 points!" : "Good effort! Try again to get a perfect score."}
                  </p>
                  <button
                    onClick={() => {
                      setQuizScore(null);
                      setAnswers({});
                    }}
                    className="mt-4 bg-white border border-blue-200 text-blue-600 font-bold px-4 py-2 rounded-lg text-xs hover:bg-gray-50"
                  >
                    Retake Quiz
                  </button>
                </div>

                <div className="space-y-6">
                  <h4 className="font-bold text-gray-900">Answer Key & Explanations:</h4>
                  {quizQuestions.map((q, idx) => (
                    <div key={q.id} className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-700">{idx + 1}. {q.question}</span>
                        {answers[q.id] === q.correct ? (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">✓ Correct</span>
                        ) : (
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">✗ Incorrect</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">
                        <span className="font-bold">Correct Answer:</span> {q.correct}
                      </div>
                      <p className="text-xs text-gray-500 italic">{q.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Bounce keyframes for bird */}
      <style jsx>{`
        @keyframes bounce-bird {
          0%, 100% {
            transform: translateY(0) scaleX(var(--bird-scale-x, 1));
          }
          50% {
            transform: translateY(-8px) scaleX(var(--bird-scale-x, 1));
          }
        }
        .animate-bounce-bird {
          animation: bounce-bird 1.8s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
