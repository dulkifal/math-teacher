import React, { useState, useEffect } from "react";
import { useUser } from "@/lib/auth";
import axios from "axios";

// Helper for GCD to simplify fractions
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

export default function PercentagePlayground() {
  const { user } = useUser();
  const userId = user?.id || "";

  // Progress States
  const [completed, setCompleted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  // Tabs: "grid" | "shopping" | "experiments" | "quiz"
  const [activeTab, setActiveTab] = useState<"grid" | "shopping" | "experiments" | "quiz">("grid");

  // ─── 10x10 Grid Visualizer State ──────────────────────────────────────────
  const [percentVal, setPercentVal] = useState(35);

  const divisor = gcd(percentVal, 100);
  const simplifiedNum = percentVal / divisor;
  const simplifiedDen = 100 / divisor;

  // ─── Shopping Discount Simulator State ─────────────────────────────────────
  const presetItems = [
    { name: "Wireless Headphones", price: 150, icon: "🎧" },
    { name: "Running Sneakers", price: 120, icon: "👟" },
    { name: "School Backpack", price: 60, icon: "🎒" },
    { name: "Gaming Console", price: 500, icon: "🎮" },
  ];

  const [itemPrice, setItemPrice] = useState(120);
  const [discountPercent, setDiscountPercent] = useState(25);
  const [taxPercent, setTaxPercent] = useState(8);

  const discountAmount = (itemPrice * discountPercent) / 100;
  const subtotal = itemPrice - discountAmount;
  const taxAmount = (subtotal * taxPercent) / 100;
  const finalPrice = subtotal + taxAmount;

  // ─── Experiments State ────────────────────────────────────────────────────
  // Experiment 1: The Reversibility Discovery (X% of Y = Y% of X)
  const [revX, setRevX] = useState(16);
  const [revY, setRevY] = useState(50);
  const val1 = (revX * revY) / 100;
  const val2 = (revY * revX) / 100;

  // Experiment 2: The Sequential Percent Paradox
  const [seqInitial, setSeqInitial] = useState(100);
  const [seqRate, setSeqRate] = useState(20);
  const afterDiscount = seqInitial * (1 - seqRate / 100);
  const afterMarkup = afterDiscount * (1 + seqRate / 100);

  // ─── Quiz State ───────────────────────────────────────────────────────────
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const quizQuestions = [
    {
      id: 1,
      question: "What is 15% of $80?",
      options: ["$8", "$12", "$15", "$20"],
      correct: "$12",
      explanation: "10% of 80 is 8, and 5% is 4. Therefore, 15% = 8 + 4 = $12 (or 80 × 0.15 = 12).",
    },
    {
      id: 2,
      question: "Which of the following values is the largest?",
      options: ["40% of 50", "50% of 40", "They are identical", "It depends on the base"],
      correct: "They are identical",
      explanation: "Because x% of y = y% of x = (x × y) / 100. Both equal exactly 20!",
    },
    {
      id: 3,
      question: "A jacket costs $100. It is discounted by 25%, and then 8% sales tax is added. What is the final price?",
      options: ["$83", "$81", "$75", "$85"],
      correct: "$81",
      explanation: "After 25% discount, price is $75. 8% tax on $75 is $6. $75 + $6 = $81.",
    },
    {
      id: 4,
      question: "An item drops by 50% in price. By what percentage must it increase to return to its original price?",
      options: ["50%", "75%", "100%", "200%"],
      correct: "100%",
      explanation: "If a $100 item drops 50% to $50, you must add $50 to it to reach $100. $50 is 100% of $50!",
    },
  ];

  // Fetch completion state on mount
  useEffect(() => {
    if (userId) {
      axios.get(`/api/progress?userId=${userId}`).then((res) => {
        const completedLessons = res.data.completedLessons || [];
        if (completedLessons.includes("percentage")) {
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
        lessonId: "percentage",
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
          topic: "Percentages & Discounts",
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
              🏷️ Percentages & Discounts
            </h1>
            <p className="text-gray-500 mt-1">
              Explore 100-grid visualizers, calculate shopping discounts and sales tax, and discover the reversibility trick.
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
            onClick={() => setActiveTab("grid")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "grid" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            100-Grid Visualizer
          </button>
          <button
            onClick={() => setActiveTab("shopping")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "shopping" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Shopping Simulator
          </button>
          <button
            onClick={() => setActiveTab("experiments")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "experiments" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Math Tricks & Experiments
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

        {/* Tab 1: 100-Grid Visualizer */}
        {activeTab === "grid" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* 10x10 Interactive Grid */}
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="grid grid-cols-10 gap-1 bg-white p-2 rounded-xl border border-slate-300 shadow-sm max-w-[260px] w-full aspect-square">
                  {Array.from({ length: 100 }, (_, i) => {
                    const isShaded = i < percentVal;
                    return (
                      <div
                        key={i}
                        onClick={() => setPercentVal(i + 1)}
                        className={`aspect-square rounded-xs transition-colors duration-150 cursor-pointer ${
                          isShaded ? "bg-amber-500 shadow-xs" : "bg-slate-100 hover:bg-slate-200"
                        }`}
                        title={`Square ${i + 1}`}
                      />
                    );
                  })}
                </div>
                <div className="text-xs text-gray-400 mt-3 font-semibold">
                  Click any square or use the slider below to shade!
                </div>
              </div>

              {/* Stats & Conversions */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Per-Cent = &quot;Per 100&quot;</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Every percentage is literally a fraction with a denominator of 100.
                  </p>
                </div>

                {/* Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between font-bold text-gray-700">
                    <span>Shaded Squares:</span>
                    <span className="text-amber-600 text-xl">{percentVal} / 100</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={percentVal}
                    onChange={(e) => setPercentVal(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                {/* Equivalent Representations Cards */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                    <div className="text-[10px] font-bold text-amber-700 uppercase">Percentage</div>
                    <div className="text-2xl font-black text-amber-900">{percentVal}%</div>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="text-[10px] font-bold text-blue-700 uppercase">Decimal</div>
                    <div className="text-2xl font-black text-blue-900">{(percentVal / 100).toFixed(2)}</div>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="text-[10px] font-bold text-emerald-700 uppercase">Fraction</div>
                    <div className="text-xl font-black text-emerald-900">
                      {simplifiedNum}/{simplifiedDen}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 space-y-1">
                  <p className="font-bold">📝 Fraction Conversion:</p>
                  <p>
                    {percentVal}% = {percentVal}/100 = {simplifiedNum}/{simplifiedDen} (divided numerator & denominator by {divisor}).
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Shopping Simulator */}
        {activeTab === "shopping" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Real-World Shopping Mall Calculator</h3>
              <p className="text-sm text-gray-500">
                Choose an item or enter a custom price, apply discounts, and calculate sales tax!
              </p>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {presetItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setItemPrice(item.price)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    itemPrice === item.price
                      ? "border-blue-600 bg-blue-50 shadow-sm"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-2xl mb-1">{item.icon}</div>
                  <div className="text-xs font-bold text-gray-800 truncate">{item.name}</div>
                  <div className="text-sm font-black text-blue-600">${item.price}</div>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* Sliders */}
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between font-bold text-xs text-gray-700 mb-1">
                    <span>Original Item Price:</span>
                    <span className="text-blue-600 font-black">${itemPrice}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="5"
                    value={itemPrice}
                    onChange={(e) => setItemPrice(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-xs text-gray-700 mb-1">
                    <span>🏷️ Store Discount:</span>
                    <span className="text-emerald-600 font-black">{discountPercent}% OFF</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="80"
                    step="5"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-bold text-xs text-gray-700 mb-1">
                    <span>🏛️ Sales Tax:</span>
                    <span className="text-purple-600 font-black">{taxPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>
              </div>

              {/* Receipt Breakdown Card */}
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 font-mono text-sm shadow-sm">
                <div className="text-center font-bold text-slate-800 uppercase tracking-widest text-xs border-b border-slate-200 pb-2">
                  STORE RECEIPT
                </div>
                
                <div className="flex justify-between text-slate-600">
                  <span>Original Price:</span>
                  <span>${itemPrice.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>- Discount ({discountPercent}%):</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-slate-600 border-t border-dashed border-slate-200 pt-2">
                  <span>Sale Subtotal:</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-purple-600 font-semibold">
                  <span>+ Tax ({taxPercent}%):</span>
                  <span>+${taxAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-lg font-black text-slate-900 border-t-2 border-slate-300 pt-3">
                  <span>FINAL TOTAL:</span>
                  <span>${finalPrice.toFixed(2)}</span>
                </div>

                <div className="bg-emerald-100/60 p-2.5 rounded-xl text-center text-xs font-bold text-emerald-800 mt-2">
                  🎉 You saved ${discountAmount.toFixed(2)} on this purchase!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Experiments */}
        {activeTab === "experiments" && (
          <div className="space-y-8">
            {/* Experiment 1: The Reversibility Trick */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-blue-100 text-blue-800 rounded-xl text-xl">🔁</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Experiment 1: The Magic Percentage Reversal Trick</h3>
                  <p className="text-sm text-gray-500">Why x% of y is ALWAYS equal to y% of x!</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Struggling to calculate a hard percentage in your head like <strong>{revX}% of {revY}</strong>? Just flip it to <strong>{revY}% of {revX}</strong>!
                  </p>
                  <div>
                    <label className="text-xs font-bold text-gray-500">Value X: {revX}</label>
                    <input
                      type="range"
                      min="2"
                      max="100"
                      value={revX}
                      onChange={(e) => setRevX(Number(e.target.value))}
                      className="w-full accent-blue-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500">Value Y: {revY}</label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="5"
                      value={revY}
                      onChange={(e) => setRevY(Number(e.target.value))}
                      className="w-full accent-purple-600"
                    />
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl space-y-4 text-center">
                  <div className="grid grid-cols-2 gap-2 text-sm font-bold">
                    <div className="p-3 bg-white rounded-xl shadow-xs border border-blue-100">
                      <div className="text-xs text-blue-500 uppercase">{revX}% of {revY}</div>
                      <div className="text-2xl font-black text-blue-900">{val1.toFixed(1)}</div>
                    </div>
                    <div className="p-3 bg-white rounded-xl shadow-xs border border-purple-100">
                      <div className="text-xs text-purple-500 uppercase">{revY}% of {revX}</div>
                      <div className="text-2xl font-black text-purple-900">{val2.toFixed(1)}</div>
                    </div>
                  </div>
                  <p className="text-xs text-blue-800 font-mono font-semibold">
                    Formula proof: (X × Y) / 100 = (Y × X) / 100
                  </p>
                </div>
              </div>
            </div>

            {/* Experiment 2: The Double Discount Trap */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-amber-100 text-amber-800 rounded-xl text-xl">⚠️</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Experiment 2: The Sequential Percent Paradox</h3>
                  <p className="text-sm text-gray-500">Does a 20% discount followed by a 20% increase bring you back to where you started?</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500">Starting Price ($): {seqInitial}</label>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      step="10"
                      value={seqInitial}
                      onChange={(e) => setSeqInitial(Number(e.target.value))}
                      className="w-full accent-amber-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-500">Percentage Change Rate: ±{seqRate}%</label>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="5"
                      value={seqRate}
                      onChange={(e) => setSeqRate(Number(e.target.value))}
                      className="w-full accent-amber-600"
                    />
                  </div>
                </div>

                <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3 text-sm">
                  <div className="flex justify-between font-bold text-amber-900">
                    <span>1. Starting Value:</span>
                    <span>${seqInitial.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 font-semibold">
                    <span>2. After -{seqRate}% Discount:</span>
                    <span>${afterDiscount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-bold border-t border-amber-200 pt-2">
                    <span>3. After +{seqRate}% Markup on new price:</span>
                    <span className="text-xl font-black">${afterMarkup.toFixed(2)}</span>
                  </div>
                  <p className="text-xs text-amber-800 pt-1">
                    <strong>Notice:</strong> You end up with <strong>${(seqInitial - afterMarkup).toFixed(2)} LESS</strong> than what you started with! The {seqRate}% increase applies to the smaller discounted base ($ {afterDiscount.toFixed(2)}), not the original!
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
              <h3 className="text-2xl font-bold text-gray-900">Percentage Master Challenge</h3>
              <p className="text-sm text-gray-500 mt-1">Test your mastery of discounts, proportions, and mental math tricks!</p>
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
                    {quizScore === quizQuestions.length ? "🌟 Perfect! You earned 10 XP points!" : "Great practice! Review the explanations below to reach 100%."}
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
