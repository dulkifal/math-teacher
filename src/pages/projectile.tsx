import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@/lib/auth";
import axios from "axios";

export default function ProjectilePage() {
  const { user } = useUser();
  const userId = user?.id || "";

  // Progress States
  const [completed, setCompleted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  // Tabs: "launcher" | "angles" | "gravity" | "quiz"
  const [activeTab, setActiveTab] = useState<"launcher" | "angles" | "gravity" | "quiz">("launcher");

  // ─── Cannon Launcher State ────────────────────────────────────────────────
  const [angleDeg, setAngleDeg] = useState(45);
  const [velocity, setVelocity] = useState(40); // m/s
  const [targetDist, setTargetDist] = useState(150); // meters
  const [planetG, setPlanetG] = useState(9.8); // m/s² (Earth)
  const [isFiring, setIsFiring] = useState(false);
  const [shotProgress, setShotProgress] = useState(0); // 0 to 1
  const animRef = useRef<number | null>(null);

  // Physics formulas
  const angleRad = (angleDeg * Math.PI) / 180;
  const timeOfFlight = (2 * velocity * Math.sin(angleRad)) / planetG;
  const maxRange = (velocity * velocity * Math.sin(2 * angleRad)) / planetG;
  const maxHeight = (velocity * velocity * Math.sin(angleRad) * Math.sin(angleRad)) / (2 * planetG);
  const isTargetHit = Math.abs(maxRange - targetDist) <= 8;

  // Animation handler
  const handleFireCannon = () => {
    setIsFiring(true);
    setShotProgress(0);
    const startTime = Date.now();
    const animDurationMs = 2500;

    const frame = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(1, elapsed / animDurationMs);
      setShotProgress(p);

      if (p < 1) {
        animRef.current = requestAnimationFrame(frame);
      } else {
        setIsFiring(false);
      }
    };

    animRef.current = requestAnimationFrame(frame);
  };

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // ─── Quiz State ───────────────────────────────────────────────────────────
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const quizQuestions = [
    {
      id: 1,
      question: "On flat ground without air resistance, which launch angle achieves the maximum horizontal flight distance?",
      options: ["30 degrees", "45 degrees", "60 degrees", "90 degrees"],
      correct: "45 degrees",
      explanation: "Range depends on sin(2θ). Because sin(2 × 45°) = sin(90°) = 1 (its maximum possible value), 45 degrees yields maximum distance.",
    },
    {
      id: 2,
      question: "Which of the following angle pairs will land at the EXACT same horizontal distance for the same launch speed?",
      options: ["30° and 60°", "20° and 40°", "45° and 90°", "15° and 45°"],
      correct: "30° and 60°",
      explanation: "Complementary angles that add up to 90° (such as 30° + 60° = 90°) have identical horizontal ranges because sin(2 × 30°) = sin(60°) = sin(2 × 60°)!",
    },
    {
      id: 3,
      question: "What is the primary geometric shape of an ideal projectile trajectory under constant gravity?",
      options: ["A circular arc", "A parabola", "A straight diagonal line", "A hyperbola"],
      correct: "A parabola",
      explanation: "Horizontal motion has constant velocity, while vertical motion experiences constant downward gravitational acceleration (y ∝ x²), creating a parabola.",
    },
    {
      id: 4,
      question: "On the Moon (gravity is ~1/6th of Earth's), how does the horizontal flight range of a golf ball compare to Earth?",
      options: [
        "It flies about 6 times farther",
        "It flies the same distance",
        "It flies 6 times shorter",
        "It never lands",
      ],
      correct: "It flies about 6 times farther",
      explanation: "Because Range = (v² sin(2θ)) / g, reducing gravity by a factor of 6 increases the range by a factor of 6!",
    },
  ];

  // Fetch completion state on mount
  useEffect(() => {
    if (userId) {
      axios.get(`/api/progress?userId=${userId}`).then((res) => {
        const completedLessons = res.data.completedLessons || [];
        if (completedLessons.includes("projectile")) {
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
        lessonId: "projectile",
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
          topic: "Projectile Trajectory",
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

  // SVG dimensions for Trajectory plotting
  const svgW = 440;
  const svgH = 220;
  const maxScaleX = 280; // meters shown on canvas
  const maxScaleY = 90; // meters height shown on canvas

  // Generate Trajectory curve points
  const numSteps = 50;
  const pathPoints = [];
  for (let i = 0; i <= numSteps; i++) {
    const t = (i / numSteps) * timeOfFlight;
    const xDist = velocity * Math.cos(angleRad) * t;
    const yHeight = velocity * Math.sin(angleRad) * t - 0.5 * planetG * t * t;

    const svgX = 20 + (xDist / maxScaleX) * (svgW - 40);
    const svgY = svgH - 25 - (Math.max(0, yHeight) / maxScaleY) * (svgH - 50);
    pathPoints.push({ x: svgX, y: svgY });
  }

  const trajectoryPathD = pathPoints
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  // Current ball position along animation
  const currentStepIdx = Math.min(pathPoints.length - 1, Math.floor(shotProgress * (pathPoints.length - 1)));
  const currentBall = pathPoints[currentStepIdx] || pathPoints[0];

  // Target X position on SVG
  const targetSvgX = 20 + (targetDist / maxScaleX) * (svgW - 40);

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-950 flex items-center gap-2">
              🚀 Gravity, Angles & Projectile Trajectory
            </h1>
            <p className="text-gray-500 mt-1">
              Launch cannonballs along parabolic arcs, test the 45-degree distance rule, and simulate gravitational motion across planets.
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
            onClick={() => setActiveTab("launcher")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "launcher" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Cannon Trajectory Launcher
          </button>
          <button
            onClick={() => setActiveTab("angles")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "angles" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            The 45° Rule & Pairs
          </button>
          <button
            onClick={() => setActiveTab("gravity")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "gravity" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Earth vs Moon vs Mars
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

        {/* Tab 1: Launcher */}
        {activeTab === "launcher" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Parabolic Cannon Simulator</h3>
                <p className="text-sm text-gray-500">
                  Aim your cannon and adjust launch velocity to strike the target!
                </p>
              </div>

              <button
                onClick={handleFireCannon}
                disabled={isFiring}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-300 text-white font-black rounded-xl shadow-md transition duration-200 cursor-pointer flex items-center gap-2"
              >
                <span>💣</span> {isFiring ? "In Flight..." : "FIRE CANNON!"}
              </button>
            </div>

            {/* Trajectory Canvas */}
            <div className="bg-slate-900 rounded-2xl p-4 shadow-inner relative overflow-hidden">
              <svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} className="overflow-visible">
                {/* Ground */}
                <line x1="10" y1={svgH - 25} x2={svgW - 10} y2={svgH - 25} stroke="#334155" strokeWidth="3" />

                {/* Target Flag */}
                <g transform={`translate(${targetSvgX}, ${svgH - 50})`}>
                  <line x1="0" y1="0" x2="0" y2="25" stroke="#F59E0B" strokeWidth="2.5" />
                  <polygon points="0,0 16,6 0,12" fill="#EF4444" />
                  <circle cx="0" cy="25" r="4" fill="#F59E0B" />
                  <text x="0" y="38" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#F59E0B">
                    {targetDist}m
                  </text>
                </g>

                {/* Parabolic Trajectory Path */}
                <path d={trajectoryPathD} fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeDasharray="5 3" opacity="0.75" />

                {/* Cannon Icon at Origin */}
                <text x="12" y={svgH - 22} fontSize="22">
                  💣
                </text>

                {/* Cannonball In-Flight */}
                {isFiring && (
                  <circle
                    cx={currentBall.x}
                    cy={currentBall.y}
                    r="6"
                    fill="#F43F5E"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="filter drop-shadow"
                  />
                )}
              </svg>

              {/* Status Banner */}
              <div className="flex justify-between items-center text-xs font-mono text-slate-400 pt-2 border-t border-slate-800">
                <span>Flight Distance: <strong className="text-white">{maxRange.toFixed(1)} m</strong></span>
                <span>Peak Height: <strong className="text-white">{maxHeight.toFixed(1)} m</strong></span>
                <span>Air Time: <strong className="text-white">{timeOfFlight.toFixed(2)} s</strong></span>
                <span>
                  {isTargetHit ? (
                    <span className="text-emerald-400 font-bold">🎯 DIRECT HIT!</span>
                  ) : maxRange < targetDist ? (
                    <span className="text-amber-400 font-bold">⚠️ Fell Short (-{(targetDist - maxRange).toFixed(0)}m)</span>
                  ) : (
                    <span className="text-rose-400 font-bold">⚠️ Overshot (+{(maxRange - targetDist).toFixed(0)}m)</span>
                  )}
                </span>
              </div>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <div className="flex justify-between font-bold text-xs text-gray-700">
                  <span>📐 Launch Angle:</span>
                  <span className="text-blue-600">{angleDeg}°</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={angleDeg}
                  onChange={(e) => setAngleDeg(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <div className="flex justify-between font-bold text-xs text-gray-700">
                  <span>🚀 Launch Speed (v₀):</span>
                  <span className="text-emerald-600">{velocity} m/s</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="50"
                  value={velocity}
                  onChange={(e) => setVelocity(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <div className="flex justify-between font-bold text-xs text-gray-700">
                  <span>🎯 Target Distance:</span>
                  <span className="text-rose-600">{targetDist} m</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="240"
                  step="5"
                  value={targetDist}
                  onChange={(e) => setTargetDist(Number(e.target.value))}
                  className="w-full accent-rose-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: The 45° Rule */}
        {activeTab === "angles" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900">The 45-Degree Rule & Complementary Pairs</h3>
              <p className="text-sm text-gray-500">
                Discover why 45° always throws the farthest, and why angles adding to 90° land at the exact same location!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5">
                  <h4 className="font-bold text-amber-900">Why 45° is Optimal:</h4>
                  <p className="text-xs text-amber-800">
                    The horizontal range formula is:
                    <br />
                    <code className="font-mono font-bold text-amber-950 bg-white px-2 py-0.5 rounded text-xs">
                      Range = (v₀² × sin(2θ)) ÷ g
                    </code>
                  </p>
                  <p className="text-xs text-amber-800">
                    The sine function reaches its maximum value of <strong>1.0</strong> when its input is <strong>90°</strong>. Thus, 2θ = 90° ➔ <strong>θ = 45°</strong>!
                  </p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5">
                  <h4 className="font-bold text-blue-900">Complementary Angle Twins:</h4>
                  <p className="text-xs text-blue-800">
                    Any two angles that sum to 90° (like <strong>30° and 60°</strong>, or <strong>15° and 75°</strong>) yield the exact same ground distance!
                  </p>
                  <p className="text-xs text-blue-800">
                    The higher angle goes high and stays in the air longer; the lower angle is flatter and faster, but both land on the same spot.
                  </p>
                </div>
              </div>

              {/* Static Arc comparison graphic */}
              <div className="p-6 bg-slate-900 rounded-2xl shadow-inner text-center space-y-3">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Trajectory Comparison at Same Speed (40 m/s)
                </div>
                <svg width="100%" height="160" viewBox="0 0 300 160">
                  <line x1="10" y1="140" x2="290" y2="140" stroke="#475569" strokeWidth="2" />
                  
                  {/* 60 deg (High arc) */}
                  <path d="M 20 140 Q 90 20 160 140" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 2" />
                  <text x="90" y="30" fontSize="10" fill="#F59E0B" fontWeight="bold">60° (High)</text>

                  {/* 45 deg (Farthest arc) */}
                  <path d="M 20 140 Q 105 40 190 140" fill="none" stroke="#10B981" strokeWidth="3" />
                  <text x="105" y="55" fontSize="11" fill="#10B981" fontWeight="black">45° (MAX RANGE)</text>

                  {/* 30 deg (Low arc) */}
                  <path d="M 20 140 Q 90 80 160 140" fill="none" stroke="#38BDF8" strokeWidth="2" strokeDasharray="3 2" />
                  <text x="90" y="90" fontSize="10" fill="#38BDF8" fontWeight="bold">30° (Flat)</text>

                  {/* Landing dots */}
                  <circle cx="160" cy="140" r="4" fill="#F59E0B" />
                  <circle cx="190" cy="140" r="5" fill="#10B981" />
                </svg>
                <div className="text-[11px] text-emerald-400 font-mono">
                  Notice: 30° and 60° land on the exact same dot!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Gravity Across Planets */}
        {activeTab === "gravity" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900">How Far Can You Throw a Ball on the Moon?</h3>
              <p className="text-sm text-gray-500">
                Compare flight trajectories when the downward pull of gravity changes!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: "🌍 Earth", g: 9.8, desc: "Standard Gravity (1.0g)", color: "border-blue-200 bg-blue-50/60 text-blue-900" },
                { name: "🔴 Mars", g: 3.7, desc: "38% of Earth Gravity (0.38g)", color: "border-amber-200 bg-amber-50/60 text-amber-900" },
                { name: "🌕 Moon", g: 1.6, desc: "16% of Earth Gravity (0.16g)", color: "border-purple-200 bg-purple-50/60 text-purple-900" },
              ].map((planet) => {
                const rangeOnPlanet = (velocity * velocity * Math.sin(2 * angleRad)) / planet.g;
                const isSelected = Math.abs(planetG - planet.g) < 0.1;

                return (
                  <button
                    key={planet.name}
                    onClick={() => setPlanetG(planet.g)}
                    className={`p-5 rounded-2xl border text-left transition cursor-pointer ${
                      isSelected
                        ? "border-blue-600 bg-blue-50 shadow-md ring-2 ring-blue-300"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="text-2xl mb-1">{planet.name}</div>
                    <div className="text-xs text-gray-500 font-semibold">{planet.desc}</div>
                    <div className="text-2xl font-black mt-3 text-slate-800">
                      {rangeOnPlanet.toFixed(1)} m
                    </div>
                    <div className="text-[11px] text-gray-500">Distance at {velocity} m/s, 45°</div>
                  </button>
                );
              })}
            </div>

            <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900 space-y-1">
              <span className="font-bold">Astronaut Fact (Apollo 14):</span>
              <p>
                In 1971 on the Moon, astronaut Alan Shepard hit two golf balls using a makeshift 6-iron. Because of low gravity and no air resistance, he famously radioed back that the ball flew &quot;miles and miles and miles!&quot;
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Quiz */}
        {activeTab === "quiz" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-2xl font-bold text-gray-900">Projectile Physics Quiz</h3>
              <p className="text-sm text-gray-500 mt-1">Test your trajectory, angle, and gravity intuition to earn 10 XP!</p>
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
