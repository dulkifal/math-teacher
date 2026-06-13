import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSlidersH, faTrophy, faCheckCircle, faAward, faCheck, faInfoCircle, faSquare, faPlus } from "@fortawesome/free-solid-svg-icons";

// Helper to calculate GCD for simplifying fractions
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);

function getFraction(decimal: number): { numerator: number; denominator: number } {
  if (decimal === 0) return { numerator: 0, denominator: 1 };
  const denominator = 100;
  const numerator = Math.round(decimal * denominator);
  const divisor = Math.abs(gcd(numerator, denominator));
  return {
    numerator: numerator / divisor,
    denominator: denominator / divisor,
  };
}

export default function RationalNumbersPage() {
  const { user } = useUser();
  const userId = user?.id || "";

  // Progress States
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  // Tab State
  const [activeSection, setActiveSection] = useState<"learn" | "properties" | "sandboxes" | "quiz">("learn");

  // Number Line Sandbox State
  const [numberLineVal, setNumberLineVal] = useState(0.5);

  // Grid Shading Sandbox State
  const [gridSize, setGridSize] = useState<2 | 3 | 4>(4);
  const [shadedCells, setShadedCells] = useState<boolean[]>(Array(16).fill(false));

  // Quiz States
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [quizFeedback, setQuizFeedback] = useState<string>("");

  useEffect(() => {
    // Reset shaded cells when grid size changes
    setShadedCells(Array(gridSize * gridSize).fill(false));
  }, [gridSize]);

  // Fetch score & completion from DB
  useEffect(() => {
    if (userId) {
      axios.get(`/api/score?userId=${userId}`).then(res => {
        setScore(res.data.score || 0);
      });
      axios.get(`/api/progress?userId=${userId}`).then(res => {
        const completedLessons = res.data.completedLessons || [];
        if (completedLessons.includes("rational")) {
          setCompleted(true);
        }
      });
    }
  }, [userId]);

  const handleCompleteLesson = async () => {
    if (!userId) return;
    setSavingProgress(true);
    try {
      await axios.post("/api/progress", {
        userId,
        lessonId: "rational",
        action: "complete_lesson",
      });
      setCompleted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProgress(false);
    }
  };

  const handleCellClick = (index: number) => {
    setShadedCells(prev => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const totalCells = gridSize * gridSize;
  const activeShadedCount = shadedCells.filter(Boolean).length;
  const gridFraction = getFraction(activeShadedCount / totalCells);

  const fractionForLine = getFraction(numberLineVal);

  // Quiz Handling
  const quizQuestions = [
    {
      id: 1,
      q: "Which of the following is NOT a rational number?",
      options: ["-3/4", "0.25", "√2", "5"],
      correct: "√2",
      explanation: "√2 is an irrational number because it cannot be written as a simple fraction p/q."
    },
    {
      id: 2,
      q: "What is the additive inverse of 3/5?",
      options: ["5/3", "-3/5", "-5/3", "1"],
      correct: "-3/5",
      explanation: "The additive inverse of a number a is -a, such that a + (-a) = 0."
    },
    {
      id: 3,
      q: "If 1/3 + 2/5 = 11/15, does this demonstrate the closure property?",
      options: ["Yes, since the sum is also a rational number.", "No, since it is a fraction.", "Only for positive fractions.", "None of the above."],
      correct: "Yes, since the sum is also a rational number.",
      explanation: "The Closure property states that adding two rational numbers always results in a rational number."
    }
  ];

  const handleAnswerSelect = (qId: number, val: string) => {
    setUserAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const submitQuiz = async () => {
    let correct = 0;
    quizQuestions.forEach(q => {
      if (userAnswers[q.id] === q.correct) {
        correct++;
      }
    });

    const points = correct * 10;
    setQuizScore(correct);
    setQuizFinished(true);

    if (points > 0 && userId) {
      const newScore = score + points;
      setScore(newScore);
      await axios.post("/api/score", { userId, score: newScore });
      setQuizFeedback(`Excellent work! You got ${correct}/3 correct and earned +${points} points!`);
    } else if (points === 0) {
      setQuizFeedback("Keep studying and try again!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Premium Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white py-12 px-6 shadow-md mb-8">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center max-w-6xl">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-white/20 p-2 rounded-lg text-white">
                <FontAwesomeIcon icon={faInfoCircle} className="w-6 h-6" />
              </span>
              <h1 className="text-4xl font-extrabold tracking-tight">Rational Numbers</h1>
            </div>
            <p className="text-emerald-100 text-lg max-w-xl">
              Understand the definition, explore algebraic properties, and place ratios on dynamic number lines and grids.
            </p>
          </div>
          
          <div className="mt-6 md:mt-0 flex items-center gap-4">
            {userId && (
              <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/20 flex items-center gap-3">
                <FontAwesomeIcon icon={faTrophy} className="text-yellow-300 w-6 h-6" />
                <div>
                  <div className="text-xs text-emerald-200 font-bold uppercase tracking-wider">Your Balance</div>
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
                    ? "bg-teal-500 text-white cursor-default"
                    : "bg-white text-teal-600 hover:bg-teal-50 hover:scale-105"
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
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-8 gap-4 overflow-x-auto">
          <button
            onClick={() => setActiveSection("learn")}
            className={`pb-4 px-2 font-bold text-sm border-b-2 transition ${activeSection === "learn" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            1. Learn & Examples
          </button>
          <button
            onClick={() => setActiveSection("properties")}
            className={`pb-4 px-2 font-bold text-sm border-b-2 transition ${activeSection === "properties" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            2. Algebraic Properties
          </button>
          <button
            onClick={() => setActiveSection("sandboxes")}
            className={`pb-4 px-2 font-bold text-sm border-b-2 transition ${activeSection === "sandboxes" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            3. Interactive Sandboxes
          </button>
          <button
            onClick={() => setActiveSection("quiz")}
            className={`pb-4 px-2 font-bold text-sm border-b-2 transition ${activeSection === "quiz" ? "border-emerald-600 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-800"}`}
          >
            4. Practice Quiz
          </button>
        </div>

        {/* Tab 1: Learn & Examples */}
        {activeSection === "learn" && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">What is a Rational Number?</h2>
              <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                A <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">rational number</span> is any number that can be expressed as the quotient or fraction <span className="font-mono font-bold text-slate-800">p/q</span> of two integers, a numerator <span className="font-mono font-semibold">p</span> and a non-zero denominator <span className="font-mono font-semibold">q</span>.
              </p>

              <div className="border-l-4 border-emerald-500 bg-emerald-50/50 p-4 rounded-r-xl mb-6">
                <div className="font-bold text-emerald-900 mb-1">Formal Rule:</div>
                <div className="font-mono text-emerald-800 text-lg">ℚ = {'{'} p/q : p, q ∈ ℤ and q ≠ 0 {'}'}</div>
              </div>

              <h3 className="text-xl font-bold text-slate-800 mb-3">Core Examples:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-700 mb-1">Simple Fractions</div>
                  <p className="text-slate-500 text-sm">
                    Direct ratios: <span className="font-mono font-semibold text-emerald-600">1/2</span>, <span className="font-mono font-semibold text-emerald-600">-3/4</span>, or <span className="font-mono font-semibold text-emerald-600">7/5</span>.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-700 mb-1">All Integers</div>
                  <p className="text-slate-500 text-sm">
                    Any integer can have a denominator of 1: e.g. <span className="font-semibold text-emerald-600">5 = 5/1</span>, <span className="font-semibold text-emerald-600">-8 = -8/1</span>.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-700 mb-1">Terminating Decimals</div>
                  <p className="text-slate-500 text-sm">
                    Decimals that end: e.g. <span className="font-semibold text-emerald-600">0.75 = 3/4</span>, <span className="font-semibold text-emerald-600">-1.25 = -5/4</span>.
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="font-bold text-slate-700 mb-1">Repeating Decimals</div>
                  <p className="text-slate-500 text-sm">
                    Infinite repeating patterns: e.g. <span className="font-semibold text-emerald-600">0.333... = 1/3</span>, <span className="font-semibold text-emerald-600">0.142857... = 1/7</span>.
                  </p>
                </div>
              </div>
            </div>

            <div className="md:col-span-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8 rounded-2xl shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-4">Did You Know?</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  The word <strong>Rational</strong> originates from the term <strong>ratio</strong>. The symbol <strong>ℚ</strong> used to denote rational numbers stands for <strong>Quotient</strong>.
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Irrational numbers like <strong>π</strong> or <strong>√2</strong> cannot be written as simple fractions because their decimal representations go on forever without repeating.
                </p>
              </div>
              <div className="mt-8 border-t border-slate-700 pt-4 text-xs text-slate-400">
                Math Teacher Platform Lesson series.
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Algebraic Properties */}
        {activeSection === "properties" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
              <h3 className="text-lg font-bold text-emerald-700 mb-2">1. Closure Property</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Adding, subtracting, or multiplying any two rational numbers will always yield another rational number.
              </p>
              <div className="mt-3 font-mono text-xs text-slate-500 bg-slate-50 p-2 rounded">
                Example: 1/4 + 1/2 = 3/4 (All are rational)
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
              <h3 className="text-lg font-bold text-emerald-700 mb-2">2. Commutative Property</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                The order in which you add or multiply numbers does not change the result.
              </p>
              <div className="mt-3 font-mono text-xs text-slate-500 bg-slate-50 p-2 rounded">
                Example: a + b = b + a and a × b = b × a
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
              <h3 className="text-lg font-bold text-emerald-700 mb-2">3. Associative Property</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                The grouping of numbers does not affect the final sum or product.
              </p>
              <div className="mt-3 font-mono text-xs text-slate-500 bg-slate-50 p-2 rounded">
                Example: (a + b) + c = a + (b + c)
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100">
              <h3 className="text-lg font-bold text-emerald-700 mb-2">4. Identity & Inverses</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                <strong>0</strong> is the additive identity, and <strong>1</strong> is the multiplicative identity. Additive inverse is <strong>-a</strong>; multiplicative inverse is <strong>1/a</strong>.
              </p>
              <div className="mt-3 font-mono text-xs text-slate-500 bg-slate-50 p-2 rounded">
                Inverse Example: 2/3 × 3/2 = 1
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Interactive Sandboxes */}
        {activeSection === "sandboxes" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Number Line Sandbox */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <FontAwesomeIcon icon={faSlidersH} className="text-emerald-500 text-sm" />
                  Dynamic Number Line
                </h3>
                <p className="text-sm text-slate-500 mb-6">
                  Drag the slider to move the coordinate point and watch it translate to a simplified rational fraction.
                </p>

                {/* SVG Number Line representation */}
                <div className="my-8 relative">
                  <svg viewBox="0 0 400 60" className="w-full">
                    {/* Main Axis Line */}
                    <line x1="20" y1="30" x2="380" y2="30" stroke="#CBD5E1" strokeWidth="3" strokeLinecap="round" />
                    
                    {/* Ticks (-2, -1, 0, 1, 2) */}
                    <line x1="20" y1="23" x2="20" y2="37" stroke="#94A3B8" strokeWidth="2" />
                    <line x1="110" y1="25" x2="110" y2="35" stroke="#94A3B8" strokeWidth="2" />
                    <line x1="200" y1="20" x2="200" y2="40" stroke="#64748B" strokeWidth="3" />
                    <line x1="290" y1="25" x2="290" y2="35" stroke="#94A3B8" strokeWidth="2" />
                    <line x1="380" y1="23" x2="380" y2="37" stroke="#94A3B8" strokeWidth="2" />

                    {/* Labels */}
                    <text x="20" y="52" fontSize="10" textAnchor="middle" fill="#64748B" className="font-mono">-2.0</text>
                    <text x="110" y="52" fontSize="10" textAnchor="middle" fill="#64748B" className="font-mono">-1.0</text>
                    <text x="200" y="52" fontSize="10" textAnchor="middle" fill="#475569" className="font-mono font-bold">0</text>
                    <text x="290" y="52" fontSize="10" textAnchor="middle" fill="#64748B" className="font-mono">1.0</text>
                    <text x="380" y="52" fontSize="10" textAnchor="middle" fill="#64748B" className="font-mono">2.0</text>

                    {/* Highlighted position point */}
                    {/* Coordinate map: -2.0 is at x=20, 2.0 is at x=380. Range=4.0 mapped to 360px => x = 200 + val * 90 */}
                    <circle cx={200 + numberLineVal * 90} cy="30" r="7" fill="#10B981" stroke="white" strokeWidth="2" className="shadow transition-all duration-150" />
                    
                    <text x={200 + numberLineVal * 90} y="15" fontSize="10" textAnchor="middle" fill="#047857" className="font-bold font-mono">
                      {numberLineVal >= 0 ? "+" : ""}{numberLineVal.toFixed(2)}
                    </text>
                  </svg>
                </div>

                <div className="mt-4">
                  <input
                    type="range"
                    min="-2.0"
                    max="2.0"
                    step="0.25"
                    value={numberLineVal}
                    onChange={e => setNumberLineVal(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>
              </div>

              <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex justify-between items-center text-emerald-900">
                <div>
                  <span className="text-xs font-semibold text-emerald-700 uppercase block">Fraction Representation</span>
                  <span className="text-2xl font-black font-mono">
                    {fractionForLine.numerator} / {fractionForLine.denominator}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-emerald-700 uppercase block">Decimal Value</span>
                  <span className="text-xl font-bold font-mono text-emerald-600">{numberLineVal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Grid Area Shading Sandbox */}
            <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <FontAwesomeIcon icon={faSquare} className="text-emerald-500 text-sm" />
                    Area Shading Simulator
                  </h3>
                  <p className="text-sm text-slate-500">
                    Click cells to shade fractions of the square. Toggle size tabs.
                  </p>
                </div>

                <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                  <button onClick={() => setGridSize(2)} className={`px-2 py-1 rounded-md ${gridSize === 2 ? "bg-white text-emerald-600 shadow" : "text-slate-500"}`}>2x2</button>
                  <button onClick={() => setGridSize(3)} className={`px-2 py-1 rounded-md ${gridSize === 3 ? "bg-white text-emerald-600 shadow" : "text-slate-500"}`}>3x3</button>
                  <button onClick={() => setGridSize(4)} className={`px-2 py-1 rounded-md ${gridSize === 4 ? "bg-white text-emerald-600 shadow" : "text-slate-500"}`}>4x4</button>
                </div>
              </div>

              {/* Shading Grid */}
              <div className="flex justify-center my-6">
                <div
                  className="grid gap-1 bg-slate-100 p-2 rounded-xl border border-slate-200"
                  style={{
                    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                    width: "180px",
                    height: "180px"
                  }}
                >
                  {Array.from({ length: totalCells }).map((_, i) => (
                    <div
                      key={i}
                      onClick={() => handleCellClick(i)}
                      className={`cursor-pointer rounded-md border border-slate-200 transition duration-150 ${
                        shadedCells[i]
                          ? "bg-emerald-500 hover:bg-emerald-600 border-emerald-600"
                          : "bg-white hover:bg-slate-50"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-150 flex justify-between items-center text-slate-700">
                <div>
                  <span className="text-xs text-slate-400 block font-semibold">Shaded Cells</span>
                  <span className="text-lg font-extrabold">{activeShadedCount} / {totalCells}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-semibold">Ratio fraction</span>
                  <span className="text-xl font-black text-emerald-600 font-mono">
                    {gridFraction.numerator} / {gridFraction.denominator}
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 4: Practice Quiz */}
        {activeSection === "quiz" && (
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-800 text-center mb-6">Rational Numbers Quiz</h3>
            
            {!quizFinished ? (
              <div className="space-y-6">
                {quizQuestions.map((q, idx) => (
                  <div key={q.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                      Question {idx + 1}
                    </span>
                    <p className="font-semibold text-slate-800 mb-3">{q.q}</p>
                    
                    <div className="space-y-2">
                      {q.options.map(opt => (
                        <label
                          key={opt}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border-2 cursor-pointer transition ${
                            userAnswers[q.id] === opt
                              ? "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold"
                              : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            value={opt}
                            checked={userAnswers[q.id] === opt}
                            onChange={() => handleAnswerSelect(q.id, opt)}
                            className="hidden"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="text-center">
                  <button
                    onClick={submitQuiz}
                    disabled={Object.keys(userAnswers).length < quizQuestions.length}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit Quiz Answers
                  </button>
                </div>
              </div>
            ) : (
              // Quiz Finished Screen
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center text-yellow-500 mx-auto mb-4 border border-yellow-100">
                  <FontAwesomeIcon icon={faAward} className="w-8 h-8 animate-bounce" />
                </div>
                <h4 className="text-xl font-bold mb-2">Quiz Finished!</h4>
                <p className="text-slate-600 text-lg mb-4">
                  You got <span className="font-bold text-emerald-600">{quizScore} / 3</span> correct.
                </p>

                <div className="p-4 bg-emerald-50 rounded-xl text-emerald-800 border border-emerald-200 max-w-sm mx-auto mb-6">
                  {quizFeedback}
                </div>

                <div className="space-y-4 text-left max-w-md mx-auto mb-6">
                  {quizQuestions.map(q => (
                    <div key={q.id} className="p-3 bg-slate-50 rounded-lg text-xs border border-slate-150">
                      <span className="font-bold text-slate-800">{q.q}</span>
                      <div className="mt-1 text-slate-500">Correct: <span className="font-bold text-emerald-600">{q.correct}</span></div>
                      <div className="mt-1 text-slate-400 italic">{q.explanation}</div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    setUserAnswers({});
                    setQuizFinished(false);
                  }}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 px-6 rounded-xl transition"
                >
                  Retake Quiz
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}