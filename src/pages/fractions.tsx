import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";

export default function FractionsPlayground() {
  const { user } = useUser();
  const userId = user?.id || "";

  // Progress and Completion States
  const [completed, setCompleted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState<"visualizer" | "compare" | "quiz">("visualizer");

  // Single Fraction States
  const [num, setNum] = useState(3);
  const [den, setDen] = useState(8);

  // Compare Fractions States
  const [numA, setNumA] = useState(1);
  const [denA, setDenA] = useState(2);
  const [numB, setNumB] = useState(2);
  const [denB, setDenB] = useState(3);

  // Quiz States
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const quizQuestions = [
    {
      id: 1,
      question: "Which fraction represents the largest value?",
      options: ["3/4", "5/8", "1/2", "7/12"],
      correct: "3/4",
      explanation: "3/4 is equal to 0.75, which is greater than 5/8 (0.625), 1/2 (0.5), and 7/12 (0.583).",
    },
    {
      id: 2,
      question: "If you divide a pizza into 12 equal slices and eat 8 of them, what is the simplified fraction of pizza remaining?",
      options: ["2/3", "4/12", "1/3", "3/4"],
      correct: "1/3",
      explanation: "If you eat 8 slices out of 12, there are 4 slices remaining. 4/12 simplifies to 1/3.",
    },
    {
      id: 3,
      question: "Which of the following is equivalent to 3/5?",
      options: ["6/10", "5/3", "9/25", "12/15"],
      correct: "6/10",
      explanation: "Multiplying the numerator and denominator of 3/5 by 2 gives 6/10.",
    },
  ];

  // Fetch completion state on mount
  useEffect(() => {
    if (userId) {
      axios.get(`/api/progress?userId=${userId}`).then((res) => {
        const completedLessons = res.data.completedLessons || [];
        if (completedLessons.includes("fractions")) {
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
        lessonId: "fractions",
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
        // Log quiz attempt
        await axios.post("/api/progress", {
          userId,
          action: "submit_quiz",
          topic: "Fractions Playground",
          score,
          total: quizQuestions.length,
        });

        // Award overall score points (e.g. 5 points for a perfect score, 2 for other attempts)
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

  // Helper to draw Pizza Slices (SVG paths)
  const renderPizzaSlices = (numerator: number, denominator: number) => {
    const center = 100;
    const radius = 80;
    const slices = [];

    for (let i = 0; i < denominator; i++) {
      const angleStart = (i * 360) / denominator - 90;
      const angleEnd = ((i + 1) * 360) / denominator - 90;

      const radStart = (angleStart * Math.PI) / 180;
      const radEnd = (angleEnd * Math.PI) / 180;

      const x1 = center + radius * Math.cos(radStart);
      const y1 = center + radius * Math.sin(radStart);
      const x2 = center + radius * Math.cos(radEnd);
      const y2 = center + radius * Math.sin(radEnd);

      const largeArcFlag = 360 / denominator > 180 ? 1 : 0;
      const pathData = `
        M ${center} ${center}
        L ${x1} ${y1}
        A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
        Z
      `;

      const isFilled = i < numerator;

      slices.push(
        <path
          key={i}
          d={pathData}
          fill={isFilled ? "#F59E0B" : "#F3F4F6"}
          stroke="#FFFFFF"
          strokeWidth="2"
          className="transition-colors duration-300 hover:brightness-95 cursor-pointer"
        />
      );
    }
    return slices;
  };

  // Helper to draw Chocolate Bar boxes
  const renderChocolateBar = (numerator: number, denominator: number) => {
    const boxes = [];
    for (let i = 0; i < denominator; i++) {
      const isFilled = i < numerator;
      boxes.push(
        <div
          key={i}
          className={`h-16 flex items-center justify-center border-2 border-white rounded-md transition-all duration-300 font-mono font-bold text-xs ${
            isFilled ? "bg-amber-800 text-amber-100 shadow-inner" : "bg-gray-100 text-gray-400"
          }`}
          style={{ width: `${100 / denominator}%` }}
        >
          {i + 1}
        </div>
      );
    }
    return boxes;
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-950 flex items-center gap-2">
              🍕 Fractions Playground
            </h1>
            <p className="text-gray-500 mt-1">
              Explore fractions through interactive pizza circles, chocolate bars, and side-by-side comparisons.
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
            Fraction Visualizer
          </button>
          <button
            onClick={() => setActiveTab("compare")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all ${
              activeTab === "compare" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Compare Fractions
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            {/* Visuals */}
            <div className="space-y-6 flex flex-col items-center justify-center">
              <h3 className="text-xl font-bold text-gray-900 w-full text-center sm:text-left">Visual Representations</h3>
              
              {/* Pizza Pie */}
              <div className="relative">
                <svg width="200" height="200" className="filter drop-shadow-md">
                  {renderPizzaSlices(num, den)}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="bg-white/95 px-3 py-1 rounded-full border border-gray-100 shadow font-extrabold text-gray-800 text-lg">
                    {num} / {den}
                  </div>
                </div>
              </div>

              {/* Chocolate Bar */}
              <div className="w-full space-y-2">
                <div className="text-sm font-semibold text-gray-500">Chocolate Bar representation:</div>
                <div className="flex w-full bg-gray-200 p-1.5 rounded-xl gap-1 overflow-x-auto">
                  {renderChocolateBar(num, den)}
                </div>
              </div>

              {/* Value stats */}
              <div className="grid grid-cols-2 gap-4 w-full text-center">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-xs font-semibold text-gray-500 uppercase">Decimal</div>
                  <div className="text-2xl font-black text-gray-800">{(num / den).toFixed(3)}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-xs font-semibold text-gray-500 uppercase">Percentage</div>
                  <div className="text-2xl font-black text-gray-800">{Math.round((num / den) * 100)}%</div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-8 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
              <h3 className="text-xl font-bold text-gray-900">Adjust Sandbox</h3>

              {/* Numerator slider */}
              <div className="space-y-2">
                <div className="flex justify-between font-bold text-gray-700">
                  <span>Numerator (Parts selected):</span>
                  <span className="text-blue-600 text-lg">{num}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={den}
                  value={num}
                  onChange={(e) => setNum(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Denominator slider */}
              <div className="space-y-2">
                <div className="flex justify-between font-bold text-gray-700">
                  <span>Denominator (Total parts):</span>
                  <span className="text-blue-600 text-lg">{den}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="16"
                  value={den}
                  onChange={(e) => {
                    const newDen = Number(e.target.value);
                    setDen(newDen);
                    if (num > newDen) setNum(newDen);
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-sm text-blue-800 space-y-1.5">
                <p className="font-bold">💡 Learning Concept:</p>
                <p>
                  The **denominator** determines how many equal parts the whole is divided into. The **numerator** represents how many of those equal parts are chosen.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Compare */}
        {activeTab === "compare" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
            <h3 className="text-xl font-bold text-gray-900">Which is bigger? Let&apos;s check!</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Fraction A */}
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center gap-4">
                <h4 className="font-extrabold text-blue-600 text-lg">Fraction A</h4>
                
                <svg width="120" height="120">
                  {renderPizzaSlices(numA, denA)}
                </svg>

                <div className="text-2xl font-black text-gray-800">{numA} / {denA} ({(numA/denA).toFixed(2)})</div>

                <div className="w-full space-y-3 mt-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-500">Numerator: {numA}</label>
                    <input
                      type="range"
                      min="0"
                      max={denA}
                      value={numA}
                      onChange={(e) => setNumA(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500">Denominator: {denA}</label>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={denA}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setDenA(val);
                        if (numA > val) setNumA(val);
                      }}
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Fraction B */}
              <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center gap-4">
                <h4 className="font-extrabold text-indigo-600 text-lg">Fraction B</h4>
                
                <svg width="120" height="120">
                  {renderPizzaSlices(numB, denB)}
                </svg>

                <div className="text-2xl font-black text-gray-800">{numB} / {denB} ({(numB/denB).toFixed(2)})</div>

                <div className="w-full space-y-3 mt-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-500">Numerator: {numB}</label>
                    <input
                      type="range"
                      min="0"
                      max={denB}
                      value={numB}
                      onChange={(e) => setNumB(Number(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500">Denominator: {denB}</label>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={denB}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setDenB(val);
                        if (numB > val) setNumB(val);
                      }}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Display */}
            <div className="flex flex-col items-center justify-center p-6 bg-blue-50 border border-blue-100 rounded-2xl">
              <div className="text-sm font-semibold uppercase text-blue-500 mb-1">Comparison result</div>
              <div className="text-4xl font-extrabold text-blue-900 flex items-center gap-4">
                <span>{numA}/{denA}</span>
                <span className="bg-white px-4 py-2 rounded-xl shadow-sm border border-blue-100">
                  {numA/denA > numB/denB ? ">" : numA/denA < numB/denB ? "<" : "="}
                </span>
                <span>{numB}/{denB}</span>
              </div>
              <div className="text-sm text-blue-800 mt-2 font-medium text-center">
                {numA/denA > numB/denB ? "Fraction A is larger than Fraction B!" : numA/denA < numB/denB ? "Fraction B is larger than Fraction A!" : "Both fractions represent the exact same value!"}
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Quiz */}
        {activeTab === "quiz" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-2xl font-bold text-gray-900">Pizza Slices Quiz</h3>
              <p className="text-sm text-gray-500 mt-1">Test your fraction skills. Perfect score gets 5 points overall!</p>
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
    </div>
  );
}
