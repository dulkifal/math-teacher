import React, { useState, useEffect } from "react";
import { useUser } from "@/lib/auth";
import axios from "axios";

export default function InterestPage() {
  const { user } = useUser();
  const userId = user?.id || "";

  // Progress States
  const [completed, setCompleted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  // Tabs: "calculator" | "doubling" | "quiz"
  const [activeTab, setActiveTab] = useState<"calculator" | "doubling" | "quiz">("calculator");

  // ─── Calculator State ─────────────────────────────────────────────────────
  const [principal, setPrincipal] = useState(1000); // $
  const [annualRate, setAnnualRate] = useState(8); // %
  const [years, setYears] = useState(10); // years
  const [compoundFreq, setCompoundFreq] = useState<number>(12); // 1 = yearly, 12 = monthly, 365 = daily

  // Calculations
  const r = annualRate / 100;
  // Simple interest: A = P(1 + rt)
  const simpleTotal = principal * (1 + r * years);
  const simpleInterestEarned = simpleTotal - principal;

  // Compound interest: A = P(1 + r/n)^(nt)
  const compoundTotal = principal * Math.pow(1 + r / compoundFreq, compoundFreq * years);
  const compoundInterestEarned = compoundTotal - principal;
  const compoundingBonus = compoundTotal - simpleTotal;

  // Generate Year-by-Year points for SVG chart
  const chartPoints = [];
  const maxYear = Math.max(1, years);
  for (let yr = 0; yr <= maxYear; yr++) {
    const sVal = principal * (1 + r * yr);
    const cVal = principal * Math.pow(1 + r / compoundFreq, compoundFreq * yr);
    chartPoints.push({ year: yr, simple: sVal, compound: cVal });
  }

  const maxVal = Math.max(compoundTotal, simpleTotal) * 1.1;

  // ─── Doubling Penny Experiment State ───────────────────────────────────────
  const [pennyDay, setPennyDay] = useState(30);
  const pennyValue = 0.01 * Math.pow(2, pennyDay - 1);

  // Rule of 72 State
  const [ruleRate, setRuleRate] = useState(8);
  const rule72Years = (72 / Math.max(0.5, ruleRate)).toFixed(1);
  const exactDoublingYears = (Math.log(2) / Math.log(1 + ruleRate / 100)).toFixed(1);

  // ─── Quiz State ───────────────────────────────────────────────────────────
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const quizQuestions = [
    {
      id: 1,
      question: "You deposit $1,000 at a 5% simple annual interest rate for 3 years. How much interest do you earn?",
      options: ["$150", "$50", "$1,150", "$300"],
      correct: "$150",
      explanation: "Simple Interest = Principal × Rate × Time = $1,000 × 0.05 × 3 = $150.",
    },
    {
      id: 2,
      question: "Why does Compound Interest grow much faster than Simple Interest over long periods?",
      options: [
        "Because the bank gives you extra bonus discounts",
        "Because interest is calculated on both the initial principal AND the accumulated interest",
        "Because simple interest only applies on leap years",
        "Because taxes are waived on compound interest",
      ],
      correct: "Because interest is calculated on both the initial principal AND the accumulated interest",
      explanation: "Compound interest is 'interest on interest' — as the balance grows, future interest calculations apply to a continuously larger base.",
    },
    {
      id: 3,
      question: "According to the 'Rule of 72', roughly how many years will it take an investment to double at a 9% annual interest rate?",
      options: ["9 years", "8 years", "12 years", "6 years"],
      correct: "8 years",
      explanation: "Rule of 72: 72 ÷ Interest Rate = 72 ÷ 9 = 8 years.",
    },
    {
      id: 4,
      question: "Which of the following compounding frequencies yields the highest return for the same nominal annual rate?",
      options: ["Compounded Annually (1 time/year)", "Compounded Quarterly (4 times/year)", "Compounded Monthly (12 times/year)", "Compounded Daily (365 times/year)"],
      correct: "Compounded Daily (365 times/year)",
      explanation: "More frequent compounding periods mean interest is credited sooner and starts earning interest on itself sooner, producing the highest yield.",
    },
  ];

  // Fetch completion state on mount
  useEffect(() => {
    if (userId) {
      axios.get(`/api/progress?userId=${userId}`).then((res) => {
        const completedLessons = res.data.completedLessons || [];
        if (completedLessons.includes("interest")) {
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
        lessonId: "interest",
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
          topic: "Simple & Compound Interest",
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

  // Helper for Chart coordinates
  const svgW = 400;
  const svgH = 220;
  const padL = 50;
  const padR = 20;
  const padT = 20;
  const padB = 30;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;

  const toCoords = (yr: number, val: number) => {
    const x = padL + (yr / maxYear) * plotW;
    const y = padT + plotH - (val / maxVal) * plotH;
    return `${x},${y}`;
  };

  const simplePathD = chartPoints.map((p, idx) => `${idx === 0 ? "M" : "L"} ${toCoords(p.year, p.simple)}`).join(" ");
  const compoundPathD = chartPoints.map((p, idx) => `${idx === 0 ? "M" : "L"} ${toCoords(p.year, p.compound)}`).join(" ");

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-950 flex items-center gap-2">
              💰 Simple & Compound Interest
            </h1>
            <p className="text-gray-500 mt-1">
              Explore the 8th wonder of the world: watch money grow exponentially, test the Rule of 72, and master financial math.
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
            onClick={() => setActiveTab("calculator")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "calculator" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Growth Curves Visualizer
          </button>
          <button
            onClick={() => setActiveTab("doubling")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "doubling" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Doubling & Rule of 72
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

        {/* Tab 1: Growth Visualizer */}
        {activeTab === "calculator" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Linear Growth vs Exponential Compounding</h3>
              <p className="text-sm text-gray-500">
                Observe how the simple interest straight line is outpaced by the exponential compound curve as time grows!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Dynamic SVG Growth Chart */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="w-full flex justify-between items-center text-xs font-bold mb-2 px-2">
                  <span className="flex items-center gap-1.5 text-blue-600">
                    <span className="w-3 h-0.5 bg-blue-600 inline-block" /> Simple Interest
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <span className="w-3 h-0.5 bg-emerald-600 inline-block" /> Compound Interest
                  </span>
                </div>

                <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="overflow-visible">
                  {/* Grid Lines */}
                  <line x1={padL} y1={padT} x2={padL} y2={padT + plotH} stroke="#CBD5E1" strokeWidth="1.5" />
                  <line x1={padL} y1={padT + plotH} x2={svgW - padR} y2={padT + plotH} stroke="#CBD5E1" strokeWidth="1.5" />

                  {/* Y Axis labels */}
                  <text x={padL - 6} y={padT + 10} textAnchor="end" fontSize="10" fill="#64748B" fontWeight="bold">
                    ${(maxVal).toFixed(0)}
                  </text>
                  <text x={padL - 6} y={padT + plotH} textAnchor="end" fontSize="10" fill="#64748B" fontWeight="bold">
                    $0
                  </text>

                  {/* X Axis labels */}
                  <text x={padL} y={svgH - 10} textAnchor="middle" fontSize="10" fill="#64748B" fontWeight="bold">
                    Yr 0
                  </text>
                  <text x={svgW - padR} y={svgH - 10} textAnchor="middle" fontSize="10" fill="#64748B" fontWeight="bold">
                    Yr {years}
                  </text>

                  {/* Curves */}
                  <path d={simplePathD} fill="none" stroke="#3B82F6" strokeWidth="3" strokeDasharray="4 2" />
                  <path d={compoundPathD} fill="none" stroke="#10B981" strokeWidth="3.5" />

                  {/* Final Points */}
                  <circle
                    cx={toCoords(years, simpleTotal).split(",")[0]}
                    cy={toCoords(years, simpleTotal).split(",")[1]}
                    r="4"
                    fill="#3B82F6"
                  />
                  <circle
                    cx={toCoords(years, compoundTotal).split(",")[0]}
                    cy={toCoords(years, compoundTotal).split(",")[1]}
                    r="5"
                    fill="#10B981"
                  />
                </svg>
                <div className="text-[11px] text-gray-400 mt-2 text-center">
                  Notice how the gap widens each year due to interest earning interest!
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                    <span>💵 Initial Principal:</span>
                    <span className="text-blue-600 font-black">${principal.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    value={principal}
                    onChange={(e) => setPrincipal(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                    <span>📈 Annual Interest Rate:</span>
                    <span className="text-emerald-600 font-black">{annualRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={annualRate}
                    onChange={(e) => setAnnualRate(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-700 mb-1">
                    <span>⏳ Duration (Years):</span>
                    <span className="text-purple-600 font-black">{years} Years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={years}
                    onChange={(e) => setYears(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>

                <div>
                  <div className="text-xs font-bold text-gray-700 mb-1.5">🔄 Compounding Frequency:</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Annually", freq: 1 },
                      { label: "Monthly", freq: 12 },
                      { label: "Daily", freq: 365 },
                    ].map((item) => (
                      <button
                        key={item.label}
                        onClick={() => setCompoundFreq(item.freq)}
                        className={`py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
                          compoundFreq === item.freq
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                            : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-center space-y-1">
                <div className="text-[10px] font-bold text-blue-600 uppercase">Simple Total</div>
                <div className="text-2xl font-black text-blue-950">${simpleTotal.toFixed(2)}</div>
                <div className="text-xs text-blue-700 font-semibold">+${simpleInterestEarned.toFixed(2)} interest</div>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-center space-y-1">
                <div className="text-[10px] font-bold text-emerald-600 uppercase">Compound Total</div>
                <div className="text-2xl font-black text-emerald-950">${compoundTotal.toFixed(2)}</div>
                <div className="text-xs text-emerald-700 font-semibold">+${compoundInterestEarned.toFixed(2)} interest</div>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl text-center space-y-1">
                <div className="text-[10px] font-bold text-purple-600 uppercase">Compounding Advantage</div>
                <div className="text-2xl font-black text-purple-950">+${compoundingBonus.toFixed(2)}</div>
                <div className="text-xs text-purple-700 font-semibold">Extra free money from compounding</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Doubling & Rule of 72 */}
        {activeTab === "doubling" && (
          <div className="space-y-8">
            {/* The Doubling Penny */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-amber-100 text-amber-800 rounded-xl text-xl">🪙</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Experiment 1: The 30-Day Doubling Penny Challenge</h3>
                  <p className="text-sm text-gray-500">Would you rather have $1,000,000 cash right now, or a penny that doubles daily for 30 days?</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between font-bold text-xs text-gray-700 mb-1">
                    <span>Scrub Days (1 to 30):</span>
                    <span className="text-amber-600 font-black text-base">Day {pennyDay}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={pennyDay}
                    onChange={(e) => setPennyDay(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl text-center space-y-2">
                  <div className="text-xs font-bold text-amber-700 uppercase">Total Value on Day {pennyDay}</div>
                  <div className="text-4xl sm:text-5xl font-black text-amber-950 font-mono">
                    ${pennyValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-amber-800 pt-2 font-medium">
                    {pennyDay < 15 && "Slow start... looks like pocket change."}
                    {pennyDay >= 15 && pennyDay < 25 && "Starting to pick up speed quickly!"}
                    {pennyDay >= 25 && "🚀 Explosive compounding! Day 30 yields over $5.3 Million Dollars!"}
                  </p>
                </div>
              </div>
            </div>

            {/* The Rule of 72 */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-blue-100 text-blue-800 rounded-xl text-xl">⏱️</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Experiment 2: The Mental Rule of 72</h3>
                  <p className="text-sm text-gray-500">How to calculate how long it takes any investment to double in your head.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    To estimate how many years it takes for your money to double, divide <strong>72</strong> by the interest rate:
                  </p>
                  <div>
                    <label className="text-xs font-bold text-gray-500">Annual Return Rate: {ruleRate}%</label>
                    <input
                      type="range"
                      min="2"
                      max="18"
                      step="0.5"
                      value={ruleRate}
                      onChange={(e) => setRuleRate(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                </div>

                <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl text-center space-y-2">
                  <div className="text-xs font-bold text-blue-600 uppercase">Years to Double</div>
                  <div className="text-4xl font-black text-blue-950">{rule72Years} Years</div>
                  <div className="text-xs text-blue-700">
                    Formula: 72 ÷ {ruleRate}% ≈ {rule72Years} yrs (Exact log: {exactDoublingYears} yrs)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Quiz */}
        {activeTab === "quiz" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-2xl font-bold text-gray-900">Financial Math Mastery Quiz</h3>
              <p className="text-sm text-gray-500 mt-1">Test your interest and compounding knowledge to earn up to 10 points!</p>
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
