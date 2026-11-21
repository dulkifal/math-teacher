import React, { useState, useEffect } from "react";
import { useUser } from "@/lib/auth";
import axios from "axios";

export default function IntegersPage() {
  const { user } = useUser();
  const userId = user?.id || "";

  // Progress States
  const [completed, setCompleted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  // Tabs: "elevation" | "thermometer" | "rules" | "quiz"
  const [activeTab, setActiveTab] = useState<"elevation" | "thermometer" | "rules" | "quiz">("elevation");

  // ─── Elevation State ──────────────────────────────────────────────────────
  const [explorerAltitude, setExplorerAltitude] = useState(-500); // feet
  const [referenceAltitude, setReferenceAltitude] = useState(2000); // feet
  const verticalDifference = Math.abs(referenceAltitude - explorerAltitude);

  // ─── Thermometer State ────────────────────────────────────────────────────
  const [tempCelsius, setTempCelsius] = useState(20);
  const tempFahrenheit = (tempCelsius * 9) / 5 + 32;
  const tempKelvin = tempCelsius + 273.15;

  // ─── Negative Multiplication State ────────────────────────────────────────
  const [numA, setNumA] = useState(-4);
  const [numB, setNumB] = useState(-3);
  const product = numA * numB;

  // ─── Quiz State ───────────────────────────────────────────────────────────
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const quizQuestions = [
    {
      id: 1,
      question: "An airplane flies at +6,000 feet, and a submarine cruises at -800 feet. What is the vertical distance between them?",
      options: ["5,200 feet", "6,800 feet", "6,000 feet", "-6,800 feet"],
      correct: "6,800 feet",
      explanation: "Distance = 6,000 - (-800) = 6,000 + 800 = 6,800 feet.",
    },
    {
      id: 2,
      question: "What is the product of (-7) × (-6)?",
      options: ["-42", "+42", "-13", "+13"],
      correct: "+42",
      explanation: "A negative multiplied by a negative always yields a positive! (-7) × (-6) = +42.",
    },
    {
      id: 3,
      question: "At night, the temperature drops from 5°C by 12°C. What is the new temperature?",
      options: ["-7°C", "7°C", "-17°C", "17°C"],
      correct: "-7°C",
      explanation: "5°C - 12°C = -7°C.",
    },
    {
      id: 4,
      question: "What temperature is known as 'Absolute Zero', where all molecular atomic motion virtually stops?",
      options: ["0°C", "-100°C", "-273.15°C (0 Kelvin)", "-459.67°F (0°C)"],
      correct: "-273.15°C (0 Kelvin)",
      explanation: "Absolute Zero is -273.15°C (or 0 Kelvin). It is the lowest possible theoretical temperature in the universe.",
    },
  ];

  // Fetch completion state on mount
  useEffect(() => {
    if (userId) {
      axios.get(`/api/progress?userId=${userId}`).then((res) => {
        const completedLessons = res.data.completedLessons || [];
        if (completedLessons.includes("integers")) {
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
        lessonId: "integers",
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
          topic: "Negative Numbers & Integers",
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
              🌡️ Negative Numbers & Integers World
            </h1>
            <p className="text-gray-500 mt-1">
              Dive from high-altitude skies into deep ocean trenches, explore temperature conversions, and master signed arithmetic.
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
            onClick={() => setActiveTab("elevation")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "elevation" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Elevation & Depth World
          </button>
          <button
            onClick={() => setActiveTab("thermometer")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "thermometer" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Multi-Scale Thermometer
          </button>
          <button
            onClick={() => setActiveTab("rules")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "rules" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Signed Multiplication Rules
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

        {/* Tab 1: Elevation & Depth */}
        {activeTab === "elevation" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* Vertical Visual Canvas */}
              <div className="relative h-[320px] rounded-2xl border border-slate-300 overflow-hidden shadow-inner flex flex-col">
                {/* Sky (Positive) */}
                <div className="flex-1 bg-gradient-to-b from-sky-400 to-sky-100 relative p-3">
                  <div className="flex justify-between text-xs font-black text-sky-800">
                    <span>✈️ +5,000 ft (Sky)</span>
                    <span>Altitude &gt; 0</span>
                  </div>
                  {/* Airplane icon placed if altitude > 0 */}
                  {explorerAltitude > 0 && (
                    <div
                      className="absolute right-6 text-3xl transition-all duration-200"
                      style={{ bottom: `${(explorerAltitude / 5000) * 80}%` }}
                    >
                      ✈️
                    </div>
                  )}
                </div>

                {/* Sea Level Line (Zero) */}
                <div className="h-6 bg-amber-200/80 border-y-2 border-dashed border-blue-500 flex items-center justify-between px-3 text-[10px] font-black text-blue-900 z-10">
                  <span>🌊 SEA LEVEL (0 ft)</span>
                  <span>Zero Origin</span>
                </div>

                {/* Ocean Depth (Negative) */}
                <div className="flex-1 bg-gradient-to-b from-blue-600 to-slate-950 relative p-3 text-white">
                  <div className="flex justify-between text-xs font-black text-blue-200">
                    <span>Depth &lt; 0</span>
                    <span>🐙 -5,000 ft (Abyss)</span>
                  </div>
                  {/* Submarine icon placed if altitude <= 0 */}
                  {explorerAltitude <= 0 && (
                    <div
                      className="absolute right-6 text-3xl transition-all duration-200"
                      style={{ top: `${(Math.abs(explorerAltitude) / 5000) * 75}%` }}
                    >
                      🚤
                    </div>
                  )}
                </div>
              </div>

              {/* Controls & Math */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Above & Below Zero</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Positive numbers represent height above sea level; negative numbers represent depth below sea level.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between font-bold text-xs text-gray-700 mb-1">
                      <span>Vehicle Position:</span>
                      <span className={`font-black ${explorerAltitude >= 0 ? "text-sky-600" : "text-blue-700"}`}>
                        {explorerAltitude >= 0 ? `+${explorerAltitude}` : explorerAltitude} feet
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-5000"
                      max="5000"
                      step="100"
                      value={explorerAltitude}
                      onChange={(e) => setExplorerAltitude(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-xs text-gray-700 mb-1">
                      <span>Reference Point (e.g. Mountain Top):</span>
                      <span className="text-emerald-600 font-black">+{referenceAltitude} feet</span>
                    </div>
                    <input
                      type="range"
                      min="500"
                      max="4000"
                      step="100"
                      value={referenceAltitude}
                      onChange={(e) => setReferenceAltitude(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>

                {/* Calculation Card */}
                <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl space-y-2">
                  <div className="text-xs font-bold text-blue-600 uppercase">Vertical Distance Formula</div>
                  <div className="text-2xl font-black text-blue-950 font-mono">
                    {referenceAltitude} - ({explorerAltitude}) = {verticalDifference} ft
                  </div>
                  <p className="text-xs text-blue-800">
                    Subtracting a negative number is identical to adding a positive number: <strong>{referenceAltitude} - ({explorerAltitude}) = {referenceAltitude} + {Math.abs(explorerAltitude)} = {verticalDifference} feet</strong>!
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Thermometer */}
        {activeTab === "thermometer" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Multi-Scale Thermometer</h3>
              <p className="text-sm text-gray-500">
                Adjust temperature to observe Celsius, Fahrenheit, and Kelvin conversions in real-time.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Slider */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between font-bold text-xs text-gray-700 mb-1">
                    <span>Adjust Temperature:</span>
                    <span className="text-rose-600 font-black text-base">{tempCelsius}°C</span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="120"
                    step="1"
                    value={tempCelsius}
                    onChange={(e) => setTempCelsius(Number(e.target.value))}
                    className="w-full accent-rose-600"
                  />
                </div>

                {/* Quick Milestones */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "🧊 Freezing (0°C)", c: 0 },
                    { label: "🧍 Body (37°C)", c: 37 },
                    { label: "☕ Boiling (100°C)", c: 100 },
                    { label: "❄️ Cold Winter (-20°C)", c: -20 },
                  ].map((m) => (
                    <button
                      key={m.label}
                      onClick={() => setTempCelsius(m.c)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition cursor-pointer"
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Display Cards */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                  <div className="text-[10px] font-bold text-rose-600 uppercase">Celsius</div>
                  <div className="text-2xl font-black text-rose-950">{tempCelsius}°C</div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                  <div className="text-[10px] font-bold text-amber-600 uppercase">Fahrenheit</div>
                  <div className="text-2xl font-black text-amber-950">{tempFahrenheit.toFixed(1)}°F</div>
                </div>

                <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl">
                  <div className="text-[10px] font-bold text-purple-600 uppercase">Kelvin</div>
                  <div className="text-2xl font-black text-purple-950">{tempKelvin.toFixed(1)} K</div>
                </div>
              </div>
            </div>

            {/* Absolute zero callout */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl text-xs space-y-1">
              <span className="font-bold text-cyan-300">🌌 Absolute Zero Concept:</span>
              <p className="text-slate-300">
                The lowest temperature possible in nature is <strong>-273.15°C (0 Kelvin)</strong>. At this point, particles have minimum thermal motion. You cannot get colder than Absolute Zero!
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Rules */}
        {activeTab === "rules" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Signed Multiplication Lab</h3>
              <p className="text-sm text-gray-500">
                Why does negative times negative equal positive? Test with the interactive multiplier!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between font-bold text-xs text-gray-700 mb-1">
                    <span>Number A:</span>
                    <span className="text-blue-600 font-black">{numA}</span>
                  </div>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    value={numA}
                    onChange={(e) => setNumA(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-xs text-gray-700 mb-1">
                    <span>Number B:</span>
                    <span className="text-purple-600 font-black">{numB}</span>
                  </div>
                  <input
                    type="range"
                    min="-10"
                    max="10"
                    value={numB}
                    onChange={(e) => setNumB(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>
              </div>

              {/* Product Display */}
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-2">
                <div className="text-xs font-bold text-slate-500 uppercase">Calculation Result</div>
                <div className="text-4xl font-black font-mono text-slate-900">
                  ({numA}) × ({numB}) ={" "}
                  <span className={product >= 0 ? "text-emerald-600" : "text-rose-600"}>
                    {product}
                  </span>
                </div>
                <div className="text-xs text-slate-600 font-medium pt-2">
                  {numA < 0 && numB < 0 && "✅ Negative × Negative = Positive (Reversing a reverse!)"}
                  {numA > 0 && numB > 0 && "✅ Positive × Positive = Positive"}
                  {((numA < 0 && numB > 0) || (numA > 0 && numB < 0)) && "⚠️ Positive × Negative = Negative"}
                  {numA === 0 || numB === 0 ? "0 times anything is 0" : ""}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Quiz */}
        {activeTab === "quiz" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-2xl font-bold text-gray-900">Negative Numbers & Integers Challenge</h3>
              <p className="text-sm text-gray-500 mt-1">Test your mastery of signed numbers and distances to earn 10 XP!</p>
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
