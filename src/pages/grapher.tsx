import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";

export default function LinearGrapher() {
  const { user } = useUser();
  const userId = user?.id || "";

  // Progress and Completion States
  const [completed, setCompleted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<"grapher" | "quiz">("grapher");

  // Equation Variables (y = mx + c)
  const [m, setM] = useState(1);
  const [c, setC] = useState(2);

  // Quiz States
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const quizQuestions = [
    {
      id: 1,
      question: "For the equation y = -3x + 5, what is the slope (m) and the y-intercept (c)?",
      options: ["m = 5, c = -3", "m = -3, c = 5", "m = 3, c = 5", "m = -3, c = -5"],
      correct: "m = -3, c = 5",
      explanation: "In the slope-intercept form y = mx + c, the coefficient of x is the slope (m = -3) and the constant term is the y-intercept (c = 5).",
    },
    {
      id: 2,
      question: "If a line has a slope of 0 and passes through the point (0, -4), what is its equation?",
      options: ["x = -4", "y = -4", "y = 0", "y = -4x"],
      correct: "y = -4",
      explanation: "With slope m = 0, the equation simplifies to y = c. Since it passes through (0, -4), the y-intercept c is -4, giving y = -4.",
    },
    {
      id: 3,
      question: "Which of these equations describes a line that slopes upwards from left to right?",
      options: ["y = -2x + 1", "y = -0.5x - 3", "y = 1.5x + 4", "y = -x"],
      correct: "y = 1.5x + 4",
      explanation: "A line slopes upwards when its slope (m) is positive. 1.5 is positive, so y = 1.5x + 4 slopes upwards.",
    },
  ];

  // Fetch completion state on mount
  useEffect(() => {
    if (userId) {
      axios.get(`/api/progress?userId=${userId}`).then((res) => {
        const completedLessons = res.data.completedLessons || [];
        if (completedLessons.includes("grapher")) {
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
        lessonId: "grapher",
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
          topic: "Linear Grapher",
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

  // SVG dimensions
  const width = 360;
  const height = 360;
  const padding = 30;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  // Scale mappings: Math (-10 to 10) -> SVG (padding to width - padding)
  const mapX = (x: number) => padding + ((x + 10) / 20) * graphWidth;
  const mapY = (y: number) => padding + ((10 - y) / 20) * graphHeight;

  // Generate grid ticks
  const ticks = [];
  for (let i = -10; i <= 10; i++) {
    if (i !== 0) {
      ticks.push(i);
    }
  }

  // Calculate equation points
  const x1 = -10;
  const y1 = m * x1 + c;
  const x2 = 10;
  const y2 = m * x2 + c;

  // Rise and Run triangle coordinates
  // Let's draw it from x=0 (y=c) to x=2 (y = 2m + c)
  const triXStart = 0;
  const triYStart = c;
  const triXEnd = 3;
  const triYEnd = m * triXEnd + c;

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-950 flex items-center gap-2">
              📉 Linear Equation Grapher
            </h1>
            <p className="text-gray-500 mt-1">
              Visualize how slope ($m$) and intercept ($c$) form lines in $y = mx + c$.
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
            onClick={() => setActiveTab("grapher")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all ${
              activeTab === "grapher" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Graph Visualizer
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

        {/* Tab Content: Grapher */}
        {activeTab === "grapher" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
            {/* SVG Graph Plane */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative bg-gray-50 rounded-2xl border border-gray-200 p-2 shadow-inner">
                <svg width={width} height={height} className="overflow-visible">
                  
                  {/* Grid Lines */}
                  {ticks.map((t) => (
                    <g key={t}>
                      {/* Vertical Grid Line */}
                      <line
                        x1={mapX(t)}
                        y1={padding}
                        x2={mapX(t)}
                        y2={height - padding}
                        stroke="#E5E7EB"
                        strokeWidth="1"
                      />
                      {/* Horizontal Grid Line */}
                      <line
                        x1={padding}
                        y1={mapY(t)}
                        x2={width - padding}
                        y2={mapY(t)}
                        stroke="#E5E7EB"
                        strokeWidth="1"
                      />
                      {/* X Tick Labels */}
                      {t % 2 === 0 && (
                        <text
                          x={mapX(t)}
                          y={mapY(0) + 16}
                          fontSize="10"
                          fill="#9CA3AF"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          {t}
                        </text>
                      )}
                      {/* Y Tick Labels */}
                      {t % 2 === 0 && (
                        <text
                          x={mapX(0) - 10}
                          y={mapY(t) + 3}
                          fontSize="10"
                          fill="#9CA3AF"
                          textAnchor="end"
                          fontWeight="bold"
                        >
                          {t}
                        </text>
                      )}
                    </g>
                  ))}

                  {/* Primary Axes */}
                  <line
                    x1={padding}
                    y1={mapY(0)}
                    x2={width - padding}
                    y2={mapY(0)}
                    stroke="#4B5563"
                    strokeWidth="2.5"
                  />
                  <line
                    x1={mapX(0)}
                    y1={padding}
                    x2={mapX(0)}
                    y2={height - padding}
                    stroke="#4B5563"
                    strokeWidth="2.5"
                  />

                  {/* Intercept point (0, c) */}
                  <circle
                    cx={mapX(0)}
                    cy={mapY(c)}
                    r="6"
                    fill="#EF4444"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    className="filter drop-shadow-md"
                  />

                  {/* Rise over Run Triangle helper */}
                  {m !== 0 && (
                    <g>
                      {/* Run Segment */}
                      <line
                        x1={mapX(triXStart)}
                        y1={mapY(triYStart)}
                        x2={mapX(triXEnd)}
                        y2={mapY(triYStart)}
                        stroke="#10B981"
                        strokeWidth="2"
                        strokeDasharray="4"
                      />
                      {/* Rise Segment */}
                      <line
                        x1={mapX(triXEnd)}
                        y1={mapY(triYStart)}
                        x2={mapX(triXEnd)}
                        y2={mapY(triYEnd)}
                        stroke="#8B5CF6"
                        strokeWidth="2"
                        strokeDasharray="4"
                      />
                      {/* Text label for Run */}
                      <text
                        x={mapX((triXStart + triXEnd) / 2)}
                        y={mapY(triYStart) + (c > 0 ? 15 : -8)}
                        fontSize="10"
                        fill="#059669"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        Run = {triXEnd}
                      </text>
                      {/* Text label for Rise */}
                      <text
                        x={mapX(triXEnd) + 8}
                        y={mapY((triYStart + triYEnd) / 2)}
                        fontSize="10"
                        fill="#7C3AED"
                        fontWeight="bold"
                        textAnchor="start"
                      >
                        Rise = {(triXEnd * m).toFixed(1)}
                      </text>
                    </g>
                  )}

                  {/* Main Equation Line */}
                  <line
                    x1={mapX(x1)}
                    y1={mapY(y1)}
                    x2={mapX(x2)}
                    y2={mapY(y2)}
                    stroke="#2563EB"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </svg>
              </div>

              {/* Formula Badge */}
              <div className="bg-blue-600 text-white font-mono font-bold text-lg px-6 py-2.5 rounded-full shadow">
                y = {m === 0 ? "" : m === 1 ? "x" : m === -1 ? "-x" : `${m}x`} {c > 0 ? `+ ${c}` : c < 0 ? `- ${Math.abs(c)}` : ""}
              </div>
            </div>

            {/* Sliders Controls */}
            <div className="space-y-8 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
              <h3 className="text-xl font-bold text-gray-900">Variables Panel</h3>

              {/* Slope (m) */}
              <div className="space-y-2">
                <div className="flex justify-between font-bold text-gray-700">
                  <span className="flex items-center gap-1.5 text-gray-800">
                    <span className="w-3.5 h-3.5 bg-blue-600 rounded-full inline-block"></span>
                    Slope (m):
                  </span>
                  <span className="text-blue-600 text-lg font-mono">{m.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-5"
                  max="5"
                  step="0.1"
                  value={m}
                  onChange={(e) => setM(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <p className="text-xs text-gray-400 italic">
                  Determines the steepness and direction of the line. A positive slope goes up; negative goes down.
                </p>
              </div>

              {/* Y Intercept (c) */}
              <div className="space-y-2">
                <div className="flex justify-between font-bold text-gray-700">
                  <span className="flex items-center gap-1.5 text-gray-800">
                    <span className="w-3.5 h-3.5 bg-red-500 rounded-full inline-block"></span>
                    Y-Intercept (c):
                  </span>
                  <span className="text-red-500 text-lg font-mono">{c.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="-8"
                  max="8"
                  step="0.5"
                  value={c}
                  onChange={(e) => setC(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
                <p className="text-xs text-gray-400 italic">
                  The point where the line crosses the vertical Y-axis. Represented by the red dot at (0, {c}).
                </p>
              </div>

              {/* Conceptual Helper */}
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-800 space-y-1.5">
                <div className="font-bold">📚 Slope = Rise over Run</div>
                <p>
                  As you move right by **Run** units, the line moves up/down by **Rise** units. Observe the green (run) and purple (rise) lines dynamically update on the graph!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Quiz */}
        {activeTab === "quiz" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-2xl font-bold text-gray-900">Equations & Slopes Quiz</h3>
              <p className="text-sm text-gray-500 mt-1">Test your linear graphing knowledge. Perfect score gets 5 points overall!</p>
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
