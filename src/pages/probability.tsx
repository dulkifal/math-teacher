import React, { useState, useEffect } from "react";
import { useUser } from "@/lib/auth";
import axios from "axios";

// Helper functions outside component to satisfy purity rules
function getRandomDoor(): number {
  return Math.floor(Math.random() * 3);
}

function getRandomGoat(available: number[]): number {
  return available[Math.floor(Math.random() * available.length)];
}

export default function ProbabilityPlayground() {
  const { user } = useUser();
  const userId = user?.id || "";

  // Progress States
  const [completed, setCompleted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  // Tabs: "sim" | "monty" | "experiments" | "quiz"
  const [activeTab, setActiveTab] = useState<"sim" | "monty" | "experiments" | "quiz">("sim");

  // ─── Coin & Dice Simulator State ──────────────────────────────────────────
  const [headsCount, setHeadsCount] = useState(0);
  const [tailsCount, setTailsCount] = useState(0);
  const [lastFlips, setLastFlips] = useState<("H" | "T")[]>([]);

  const totalFlips = headsCount + tailsCount;
  const headsPct = totalFlips > 0 ? (headsCount / totalFlips) * 100 : 50;
  const tailsPct = totalFlips > 0 ? (tailsCount / totalFlips) * 100 : 50;

  const handleFlipCoins = (n: number) => {
    let newH = 0;
    let newT = 0;
    const flips: ("H" | "T")[] = [];

    for (let i = 0; i < n; i++) {
      const isHead = Math.random() < 0.5;
      if (isHead) newH++;
      else newT++;
      if (flips.length < 20) flips.push(isHead ? "H" : "T");
    }

    setHeadsCount((prev) => prev + newH);
    setTailsCount((prev) => prev + newT);
    setLastFlips(flips);
  };

  const handleResetFlips = () => {
    setHeadsCount(0);
    setTailsCount(0);
    setLastFlips([]);
  };

  // ─── Monty Hall Paradox State ─────────────────────────────────────────────
  // Winning door: 0, 1, or 2 (initialized to 1)
  const [carDoor, setCarDoor] = useState<number>(1);
  const [selectedDoor, setSelectedDoor] = useState<number | null>(null);
  const [revealedGoatDoor, setRevealedGoatDoor] = useState<number | null>(null);
  const [gameStage, setGameStage] = useState<"pick" | "choose_switch" | "revealed">("pick");
  const [finalResult, setFinalResult] = useState<"win" | "lose" | null>(null);

  // Stats across rounds
  const [switchWins, setSwitchWins] = useState(0);
  const [switchPlays, setSwitchPlays] = useState(0);
  const [stayWins, setStayWins] = useState(0);
  const [stayPlays, setStayPlays] = useState(0);

  const startNewMontyGame = () => {
    setCarDoor(getRandomDoor());
    setSelectedDoor(null);
    setRevealedGoatDoor(null);
    setGameStage("pick");
    setFinalResult(null);
  };

  const handlePickDoor = (doorIdx: number) => {
    if (gameStage !== "pick") return;
    setSelectedDoor(doorIdx);

    // Host opens a door that is NOT the car and NOT the player's door
    const availableToGoat = [0, 1, 2].filter((d) => d !== doorIdx && d !== carDoor);
    const hostOpens = getRandomGoat(availableToGoat);
    setRevealedGoatDoor(hostOpens);
    setGameStage("choose_switch");
  };

  const handleFinalChoice = (switchChoice: boolean) => {
    if (selectedDoor === null || revealedGoatDoor === null) return;
    let finalPick = selectedDoor;
    if (switchChoice) {
      finalPick = [0, 1, 2].find((d) => d !== selectedDoor && d !== revealedGoatDoor)!;
    }

    const isWin = finalPick === carDoor;
    setFinalResult(isWin ? "win" : "lose");
    setGameStage("revealed");

    if (switchChoice) {
      setSwitchPlays((p) => p + 1);
      if (isWin) setSwitchWins((w) => w + 1);
    } else {
      setStayPlays((p) => p + 1);
      if (isWin) setStayWins((w) => w + 1);
    }
  };

  // ─── Quiz State ───────────────────────────────────────────────────────────
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const quizQuestions = [
    {
      id: 1,
      question: "If you flip a fair coin 5 times and get Heads every time, what is the probability that the next flip is Heads?",
      options: ["50% (1 in 2)", "Less than 50% (it's due for tails)", "More than 50%", "100%"],
      correct: "50% (1 in 2)",
      explanation: "Each coin flip is an independent event with no memory. The probability remains exactly 50% regardless of previous results (avoiding Gambler's Fallacy).",
    },
    {
      id: 2,
      question: "In the famous Monty Hall game show with 3 doors, what is your probability of winning the sports car if you ALWAYS switch?",
      options: ["1/3 (~33.3%)", "1/2 (50%)", "2/3 (~66.7%)", "100%"],
      correct: "2/3 (~66.7%)",
      explanation: "Your initial pick had a 1/3 chance of being correct and a 2/3 chance of being wrong. Switching wins whenever your initial pick was wrong (which happens 2/3 of the time!).",
    },
    {
      id: 3,
      question: "What is the probability of rolling a total sum of 7 with two standard 6-sided dice?",
      options: ["1 in 6 (6/36)", "1 in 12", "1 in 7", "1 in 36"],
      correct: "1 in 6 (6/36)",
      explanation: "Out of 36 combinations, 6 produce a sum of 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1). 6/36 = 1/6 (~16.7%).",
    },
    {
      id: 4,
      question: "Approximately how many random people need to be in a room for there to be a 50% chance that at least two share the exact same birthday?",
      options: ["183 people", "365 people", "23 people", "50 people"],
      correct: "23 people",
      explanation: "The Birthday Paradox: With 23 people, there are 253 pairs to compare. The cumulative probability of at least one shared birthday exceeds 50.7%!",
    },
  ];

  // Fetch completion state on mount
  useEffect(() => {
    if (userId) {
      axios.get(`/api/progress?userId=${userId}`).then((res) => {
        const completedLessons = res.data.completedLessons || [];
        if (completedLessons.includes("probability")) {
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
        lessonId: "probability",
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
          topic: "Probability & Chance",
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
              🎲 Probability & The Monty Hall Lab
            </h1>
            <p className="text-gray-500 mt-1">
              Test the Law of Large Numbers with 1,000 coin flips, play the Monty Hall 3-Doors game show, and explore probability paradoxes.
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
            onClick={() => setActiveTab("sim")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "sim" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Coin Flip Monte Carlo
          </button>
          <button
            onClick={() => setActiveTab("monty")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "monty" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Monty Hall 3-Doors Game
          </button>
          <button
            onClick={() => setActiveTab("experiments")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "experiments" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Birthday Paradox & Fallacies
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

        {/* Tab 1: Coin Flip Monte Carlo */}
        {activeTab === "sim" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Law of Large Numbers Simulator</h3>
                <p className="text-sm text-gray-500">
                  Flip 1 coin or simulated batches of 100 or 1,000 coins to watch randomness converge to 50%!
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleFlipCoins(1)}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-sm transition cursor-pointer"
                >
                  Flip 1 Coin
                </button>
                <button
                  onClick={() => handleFlipCoins(100)}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition cursor-pointer"
                >
                  Flip 100 Coins
                </button>
                <button
                  onClick={() => handleFlipCoins(1000)}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-sm transition cursor-pointer"
                >
                  ⚡ Flip 1,000 Coins
                </button>
                <button
                  onClick={handleResetFlips}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  ↺ Reset
                </button>
              </div>
            </div>

            {/* Results Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-5 bg-amber-50 border border-amber-100 rounded-2xl space-y-1">
                <div className="text-xs font-bold text-amber-700 uppercase">🪙 Heads</div>
                <div className="text-4xl font-black text-amber-950">{headsCount.toLocaleString()}</div>
                <div className="text-xs font-bold text-amber-600">{headsPct.toFixed(1)}%</div>
              </div>

              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
                <div className="text-xs font-bold text-slate-500 uppercase">Total Flips</div>
                <div className="text-4xl font-black text-slate-900">{totalFlips.toLocaleString()}</div>
                <div className="text-xs text-slate-500">Theoretical Target: 50.0%</div>
              </div>

              <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl space-y-1">
                <div className="text-xs font-bold text-blue-700 uppercase">🪙 Tails</div>
                <div className="text-4xl font-black text-blue-950">{tailsCount.toLocaleString()}</div>
                <div className="text-xs font-bold text-blue-600">{tailsPct.toFixed(1)}%</div>
              </div>
            </div>

            {/* Split Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-amber-700">Heads: {headsPct.toFixed(1)}%</span>
                <span className="text-slate-400">50% Line</span>
                <span className="text-blue-700">Tails: {tailsPct.toFixed(1)}%</span>
              </div>
              <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden flex shadow-inner">
                <div
                  className="bg-amber-500 h-full transition-all duration-300"
                  style={{ width: `${headsPct}%` }}
                />
                <div
                  className="bg-blue-500 h-full transition-all duration-300"
                  style={{ width: `${tailsPct}%` }}
                />
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white opacity-80" />
              </div>
            </div>

            {/* Recent Flips Stream */}
            {lastFlips.length > 0 && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-gray-500">Latest Sample Stream:</div>
                <div className="flex flex-wrap gap-1.5">
                  {lastFlips.map((flip, idx) => (
                    <span
                      key={idx}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-xs ${
                        flip === "H" ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-blue-100 text-blue-800 border border-blue-200"
                      }`}
                    >
                      {flip}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Monty Hall Game Show */}
        {activeTab === "monty" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900">The Monty Hall 3-Doors Game Show</h3>
              <p className="text-sm text-gray-500">
                Behind one door is a brand new sports car (🏎️). Behind the other two are goats (🐐)!
              </p>
            </div>

            {/* Doors Stage */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 py-4">
              {[0, 1, 2].map((doorIdx) => {
                const isSelected = selectedDoor === doorIdx;
                const isRevealedGoat = revealedGoatDoor === doorIdx;
                const isWinningDoor = carDoor === doorIdx;
                const isGameOver = gameStage === "revealed";

                let content = "🚪";
                let badge = `Door ${doorIdx + 1}`;

                if (isRevealedGoat) {
                  content = "🐐";
                  badge = "GOAT!";
                } else if (isGameOver) {
                  content = isWinningDoor ? "🏎️" : "🐐";
                  badge = isWinningDoor ? "WINNER!" : "GOAT";
                }

                return (
                  <button
                    key={doorIdx}
                    onClick={() => handlePickDoor(doorIdx)}
                    disabled={gameStage !== "pick"}
                    className={`p-6 rounded-2xl border-2 flex flex-col items-center justify-center gap-3 transition-all duration-300 cursor-pointer ${
                      isSelected
                        ? "border-blue-600 bg-blue-50 shadow-lg scale-105"
                        : isRevealedGoat
                        ? "border-amber-300 bg-amber-50 opacity-80"
                        : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    <div className="text-5xl">{content}</div>
                    <div className="font-extrabold text-sm text-gray-800">{badge}</div>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded-full shadow-xs">
                        Your Pick
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Game Prompts & Actions */}
            <div className="p-6 bg-slate-900 text-white rounded-2xl text-center space-y-4">
              {gameStage === "pick" && (
                <div>
                  <div className="text-lg font-bold text-amber-300">Step 1: Pick any door!</div>
                  <p className="text-xs text-slate-400 mt-1">Click Door 1, 2, or 3 to lock in your initial guess.</p>
                </div>
              )}

              {gameStage === "choose_switch" && (
                <div className="space-y-4">
                  <div>
                    <div className="text-xl font-black text-amber-300">
                      Host reveals a GOAT behind Door {(revealedGoatDoor || 0) + 1}!
                    </div>
                    <p className="text-sm text-slate-300 mt-1">
                      Do you want to <strong>SWITCH</strong> to the remaining door, or <strong>STAY</strong> with your initial choice?
                    </p>
                  </div>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => handleFinalChoice(true)}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-md transition cursor-pointer text-sm"
                    >
                      🔁 SWITCH Doors!
                    </button>
                    <button
                      onClick={() => handleFinalChoice(false)}
                      className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-extrabold rounded-xl shadow-md transition cursor-pointer text-sm"
                    >
                      🔒 STAY with Door {(selectedDoor || 0) + 1}
                    </button>
                  </div>
                </div>
              )}

              {gameStage === "revealed" && (
                <div className="space-y-3">
                  <div className="text-3xl font-black">
                    {finalResult === "win" ? "🎉 YOU WON THE SPORTS CAR! 🏎️" : "😢 Bummer! You got a goat 🐐"}
                  </div>
                  <button
                    onClick={startNewMontyGame}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition shadow cursor-pointer"
                  >
                    Play Again! ↻
                  </button>
                </div>
              )}
            </div>

            {/* Historical Stats Table */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center space-y-1">
                <div className="text-xs font-bold text-emerald-700 uppercase">Switching Strategy</div>
                <div className="text-2xl font-black text-emerald-950">
                  {switchWins} / {switchPlays}{" "}
                  <span className="text-sm font-semibold">
                    ({switchPlays > 0 ? ((switchWins / switchPlays) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
                <div className="text-[11px] text-emerald-600">Theoretical: 66.7% Win Rate</div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                <div className="text-xs font-bold text-slate-700 uppercase">Staying Strategy</div>
                <div className="text-2xl font-black text-slate-950">
                  {stayWins} / {stayPlays}{" "}
                  <span className="text-sm font-semibold">
                    ({stayPlays > 0 ? ((stayWins / stayPlays) * 100).toFixed(0) : 0}%)
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">Theoretical: 33.3% Win Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Experiments */}
        {activeTab === "experiments" && (
          <div className="space-y-8">
            {/* The Birthday Paradox */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-pink-100 text-pink-800 rounded-xl text-xl">🎂</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">The Birthday Paradox</h3>
                  <p className="text-sm text-gray-500">Why a 50% chance of a shared birthday only requires 23 people!</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                  <p>
                    Most people assume you need <strong>183 people</strong> (half of 365) to have a 50% chance of matching birthdays.
                  </p>
                  <p>
                    In reality, you aren&apos;t asking if someone matches <em>your</em> birthday; you are asking if <em>any two people match each other</em>.
                  </p>
                  <p className="text-xs font-semibold text-pink-900 bg-pink-50 p-3 rounded-xl border border-pink-100">
                    With 23 people, there are <strong>253 different pairs</strong>: (23 × 22) ÷ 2 = 253 comparisons! That gives a <strong>50.7% probability</strong> of at least one match.
                  </p>
                </div>

                <div className="p-6 bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-2xl text-center space-y-2">
                  <div className="text-xs font-bold text-pink-700 uppercase">Classroom of 23 Students</div>
                  <div className="text-5xl font-black text-pink-950 font-mono">50.7%</div>
                  <div className="text-xs text-pink-800">Chance that at least 2 share a birthday!</div>
                  <div className="text-[11px] text-gray-500 pt-2 border-t border-pink-200">
                    With 70 people in a room, the chance exceeds 99.9%!
                  </div>
                </div>
              </div>
            </div>

            {/* Gambler's Fallacy */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>🎰</span> The Gambler&apos;s Fallacy
              </h4>
              <p className="text-sm text-gray-600">
                In 1913 at the Monte Carlo Casino, a roulette ball landed on <strong>black 26 times in a row</strong>. Gamblers lost millions betting on red, falsely believing that red was &quot;due&quot; to balance out the streak.
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                <strong>Remember:</strong> Random processes have no memory. A fair coin or roulette wheel has no obligation to balance out past results in the short run.
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Quiz */}
        {activeTab === "quiz" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-2xl font-bold text-gray-900">Probability & Chance Quiz</h3>
              <p className="text-sm text-gray-500 mt-1">Test your understanding of chance, games, and paradoxes to earn 10 XP!</p>
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
