import React, { useState, useEffect } from "react";
import { useUser } from "@/lib/auth";
import axios from "axios";

export default function AreaPerimeterPage() {
  const { user } = useUser();
  const userId = user?.id || "";

  // Progress States
  const [completed, setCompleted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  // Tabs: "designer" | "paradox" | "nature" | "quiz"
  const [activeTab, setActiveTab] = useState<"designer" | "paradox" | "nature" | "quiz">("designer");

  // ─── Garden Designer State ────────────────────────────────────────────────
  const [roomWidth, setRoomWidth] = useState(8); // meters
  const [roomLength, setRoomLength] = useState(6); // meters

  const gardenArea = roomWidth * roomLength; // m²
  const gardenPerimeter = 2 * (roomWidth + roomLength); // m
  const fenceCost = gardenPerimeter * 15; // $15 / meter
  const turfCost = gardenArea * 8; // $8 / m²

  // ─── Perimeter Paradox State (Optimization) ────────────────────────────────
  const [fixedPerimeter, setFixedPerimeter] = useState(24); // meters
  // Maximum width is (P / 2) - 1
  const maxPossibleWidth = Math.max(2, Math.floor(fixedPerimeter / 2) - 1);
  const [rectWidth, setRectWidth] = useState(6); // default square

  const validRectWidth = Math.min(maxPossibleWidth, Math.max(1, rectWidth));
  const rectLength = fixedPerimeter / 2 - validRectWidth;
  const currentRectArea = validRectWidth * rectLength;

  // Maximum rectangle area is a square
  const squareSide = fixedPerimeter / 4;
  const maxSquareArea = squareSide * squareSide;

  // Circle with the same perimeter (circumference C = fixedPerimeter)
  const circleRadius = fixedPerimeter / (2 * Math.PI);
  const circleArea = Math.PI * circleRadius * circleRadius;

  // ─── Quiz State ───────────────────────────────────────────────────────────
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const quizQuestions = [
    {
      id: 1,
      question: "A rectangular garden has a length of 8 meters and a width of 5 meters. What is its perimeter and area?",
      options: ["Perimeter: 26 m, Area: 40 m²", "Perimeter: 40 m, Area: 26 m²", "Perimeter: 13 m, Area: 40 m²", "Perimeter: 26 m, Area: 80 m²"],
      correct: "Perimeter: 26 m, Area: 40 m²",
      explanation: "Perimeter = 2 × (8 + 5) = 26 meters. Area = 8 × 5 = 40 m².",
    },
    {
      id: 2,
      question: "You have 24 meters of fencing. Which rectangular shape encloses the LARGEST possible area?",
      options: [
        "A long narrow yard (1 m × 11 m = 11 m²)",
        "A standard rectangle (4 m × 8 m = 32 m²)",
        "A perfect square (6 m × 6 m = 36 m²)",
        "All rectangles with 24 m perimeter have the same area",
      ],
      correct: "A perfect square (6 m × 6 m = 36 m²)",
      explanation: "For any fixed perimeter, the rectangle that maximizes area is always a SQUARE! (6 × 6 = 36 m²).",
    },
    {
      id: 3,
      question: "Among ALL 2D geometric shapes with the exact same perimeter, which shape encloses the absolute maximum area?",
      options: ["A Square", "A Circle", "An Equilateral Triangle", "A Hexagon"],
      correct: "A Circle",
      explanation: "The Isoperimetric Theorem states that a Circle encloses the maximum possible area for any given perimeter.",
    },
    {
      id: 4,
      question: "Why do honeybees build their honeycombs in hexagons rather than squares or circles?",
      options: [
        "Hexagons are easier for bees to see with compound eyes",
        "Hexagons tile the plane with ZERO wasted space while using the LEAST wax perimeter",
        "Circles cannot hold liquid honey",
        "It was randomly chosen by evolution",
      ],
      correct: "Hexagons tile the plane with ZERO wasted space while using the LEAST wax perimeter",
      explanation: "The Honeycomb Conjecture (proven in 1999) proves that regular hexagons divide a surface into equal-area cells with the minimal total perimeter, saving precious beeswax!",
    },
  ];

  // Fetch completion state on mount
  useEffect(() => {
    if (userId) {
      axios.get(`/api/progress?userId=${userId}`).then((res) => {
        const completedLessons = res.data.completedLessons || [];
        if (completedLessons.includes("area")) {
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
        lessonId: "area",
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
      if (answers[q.id] === q.correct) score++;
    });
    setQuizScore(score);

    if (userId) {
      try {
        await axios.post("/api/progress", {
          userId,
          action: "submit_quiz",
          topic: "Perimeter & Area Lab",
          score,
          total: quizQuestions.length,
        });

        const pointsAwarded = score === quizQuestions.length ? 10 : score * 2;
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

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-950 flex items-center gap-2">
              🏡 Perimeter, Area & Shape Optimization
            </h1>
            <p className="text-gray-500 mt-1">
              Design gardens and rooms, discover the perimeter vs area paradox, and uncover nature&apos;s geometric secrets.
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
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold px-5 py-2.5 rounded-xl shadow transition duration-200 cursor-pointer"
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
            onClick={() => setActiveTab("designer")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "designer" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Garden & Room Designer
          </button>
          <button
            onClick={() => setActiveTab("paradox")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "paradox" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            The Perimeter Paradox
          </button>
          <button
            onClick={() => setActiveTab("nature")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "nature" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Soap Bubbles & Honeycombs
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "quiz" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Take Quiz
          </button>
        </div>

        {/* Tab 1: Designer */}
        {activeTab === "designer" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* Dynamic Room Canvas */}
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200 min-h-[300px]">
                <div
                  className="bg-emerald-500/20 border-4 border-emerald-600 rounded-xl relative flex items-center justify-center transition-all duration-300 shadow-md"
                  style={{
                    width: `${Math.min(260, roomWidth * 16)}px`,
                    height: `${Math.min(220, roomLength * 16)}px`,
                  }}
                >
                  {/* Grid Lines inside */}
                  <div className="absolute inset-0 grid opacity-20 pointer-events-none" style={{
                    gridTemplateColumns: `repeat(${roomWidth}, 1fr)`,
                    gridTemplateRows: `repeat(${roomLength}, 1fr)`,
                  }}>
                    {Array.from({ length: roomWidth * roomLength }).map((_, i) => (
                      <div key={i} className="border border-emerald-800" />
                    ))}
                  </div>

                  {/* Dimension labels */}
                  <div className="absolute -top-7 text-xs font-black text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200 shadow-xs">
                    Width: {roomWidth} m
                  </div>
                  <div className="absolute -left-12 -rotate-90 text-xs font-black text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200 shadow-xs">
                    {roomLength} m
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-emerald-950">{gardenArea} m²</div>
                    <div className="text-[10px] font-bold text-emerald-700 uppercase">Total Area</div>
                  </div>
                </div>
              </div>

              {/* Sliders & Estimates */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Interactive Blueprint</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Drag dimensions to see how fencing perimeter and turf area change.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between font-bold text-xs text-gray-700 mb-1">
                      <span>Width (m):</span>
                      <span className="text-blue-600 font-black">{roomWidth} meters</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="16"
                      value={roomWidth}
                      onChange={(e) => setRoomWidth(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-xs text-gray-700 mb-1">
                      <span>Length (m):</span>
                      <span className="text-emerald-600 font-black">{roomLength} meters</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="14"
                      value={roomLength}
                      onChange={(e) => setRoomLength(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>

                {/* Stat Badges */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-center">
                    <div className="text-[10px] font-bold text-blue-600 uppercase">Perimeter (Fence)</div>
                    <div className="text-2xl font-black text-blue-900">{gardenPerimeter} m</div>
                    <div className="text-xs text-blue-700 mt-1">Cost: ${fenceCost} (@$15/m)</div>
                  </div>

                  <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                    <div className="text-[10px] font-bold text-emerald-600 uppercase">Area (Grass Sod)</div>
                    <div className="text-2xl font-black text-emerald-900">{gardenArea} m²</div>
                    <div className="text-xs text-emerald-700 mt-1">Cost: ${turfCost} (@$8/m²)</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: The Perimeter Paradox */}
        {activeTab === "paradox" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900">The Optimization Paradox</h3>
              <p className="text-sm text-gray-500">
                You have exactly <strong>{fixedPerimeter} meters of fence</strong>. How do you shape it to get the MOST usable area?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between font-bold text-xs text-gray-700 mb-1">
                    <span>Fixed Total Perimeter:</span>
                    <span className="text-purple-600 font-black">{fixedPerimeter} meters</span>
                  </div>
                  <input
                    type="range"
                    min="16"
                    max="40"
                    step="4"
                    value={fixedPerimeter}
                    onChange={(e) => setFixedPerimeter(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-xs text-gray-700 mb-1">
                    <span>Vary Rectangle Width:</span>
                    <span className="text-blue-600 font-black">{validRectWidth} m</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max={maxPossibleWidth}
                    value={validRectWidth}
                    onChange={(e) => setRectWidth(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                    <span>Narrow (1m × {fixedPerimeter / 2 - 1}m)</span>
                    <span>Square ({squareSide}m × {squareSide}m)</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                  <div className="font-bold text-slate-800">Current Rectangle Dimensions:</div>
                  <div className="text-slate-600">
                    Width: <strong>{validRectWidth} m</strong> | Length: <strong>{rectLength} m</strong>
                  </div>
                  <div className="text-slate-600">
                    Perimeter = 2 × ({validRectWidth} + {rectLength}) = <strong>{fixedPerimeter} m</strong>
                  </div>
                </div>
              </div>

              {/* Area Comparison Cards */}
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex justify-between items-center">
                  <div>
                    <div className="text-xs font-bold text-blue-600 uppercase">Your Rectangle</div>
                    <div className="text-xs text-blue-800">{validRectWidth} m × {rectLength} m</div>
                  </div>
                  <div className="text-3xl font-black text-blue-900">{currentRectArea} m²</div>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex justify-between items-center">
                  <div>
                    <div className="text-xs font-bold text-emerald-600 uppercase">Perfect Square (Max Rectangle)</div>
                    <div className="text-xs text-emerald-800">{squareSide} m × {squareSide} m</div>
                  </div>
                  <div className="text-3xl font-black text-emerald-900">{maxSquareArea.toFixed(1)} m²</div>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl flex justify-between items-center">
                  <div>
                    <div className="text-xs font-bold text-purple-600 uppercase">Circle (Absolute Maximum)</div>
                    <div className="text-xs text-purple-800">Radius = {circleRadius.toFixed(2)} m</div>
                  </div>
                  <div className="text-3xl font-black text-purple-900">{circleArea.toFixed(1)} m²</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Nature's Secrets */}
        {activeTab === "nature" && (
          <div className="space-y-8">
            {/* Soap Bubbles */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-sky-100 text-sky-800 rounded-xl text-xl">🫧</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Why are Soap Bubbles Always Spheres?</h3>
                  <p className="text-sm text-gray-500">Surface tension and minimal energy physics.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700 leading-relaxed">
                <div className="space-y-2 p-5 bg-sky-50/60 border border-sky-200 rounded-2xl">
                  <h4 className="font-extrabold text-sky-950">The Physics of Surface Tension</h4>
                  <p>
                    Soap film contains water molecules held together by surface tension. The film acts like an elastic skin that constantly pulls inward to minimize its surface area.
                  </p>
                  <p className="text-xs text-sky-900 font-semibold">
                    The 3D shape that holds the maximum air volume with the minimum outer surface area is mathematically a <strong>SPHERE</strong>!
                  </p>
                </div>

                <div className="space-y-2 p-5 bg-amber-50/60 border border-amber-200 rounded-2xl">
                  <h4 className="font-extrabold text-amber-950">🐝 The Honeycomb Conjecture</h4>
                  <p>
                    Why do bees use hexagons instead of squares or triangles?
                  </p>
                  <p>
                    All three shapes tile a flat surface without gaps. But regular hexagons enclose the same cell area with <strong>the least perimeter of wax</strong>! Bees save tons of energy producing less beeswax.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Quiz */}
        {activeTab === "quiz" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-2xl font-bold text-gray-900">Area & Optimization Quiz</h3>
              <p className="text-sm text-gray-500 mt-1">Test your geometry and optimization skills to earn 10 XP!</p>
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
                            className={`p-3.5 rounded-xl border text-left font-medium transition-all cursor-pointer ${
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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl shadow transition duration-200 cursor-pointer"
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
                    {quizScore === quizQuestions.length ? "🌟 Perfect! 10 XP points awarded!" : "Good practice! Review the explanations below."}
                  </p>
                  <button
                    onClick={() => {
                      setQuizScore(null);
                      setAnswers({});
                    }}
                    className="mt-4 bg-white border border-blue-200 text-blue-600 font-bold px-4 py-2 rounded-lg text-xs hover:bg-gray-50 cursor-pointer"
                  >
                    Retake Quiz
                  </button>
                </div>

                <div className="space-y-6">
                  <h4 className="font-bold text-gray-900">Explanations & Solutions:</h4>
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
