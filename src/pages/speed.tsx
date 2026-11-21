import React, { useState, useEffect, useRef } from "react";
import { useUser } from "@/lib/auth";
import axios from "axios";

export default function SpeedVelocityPage() {
  const { user } = useUser();
  const userId = user?.id || "";

  // Progress States
  const [completed, setCompleted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  // Tabs: "race" | "formula" | "experiments" | "quiz"
  const [activeTab, setActiveTab] = useState<"race" | "formula" | "experiments" | "quiz">("race");

  // ─── Race Sandbox State ───────────────────────────────────────────────────
  const [speed1, setSpeed1] = useState(60); // km/h (Sports Car)
  const [speed2, setSpeed2] = useState(120); // km/h (Superjet / Bullet Train)
  const [targetDistance, setTargetDistance] = useState(100); // km
  const [raceProgress, setRaceProgress] = useState(0); // 0 to 1
  const [isRacing, setIsRacing] = useState(false);
  const animRef = useRef<number | null>(null);

  // Calculated times
  const time1Hours = targetDistance / Math.max(1, speed1);
  const time2Hours = targetDistance / Math.max(1, speed2);
  const time1Mins = Math.round(time1Hours * 60);
  const time2Mins = Math.round(time2Hours * 60);

  useEffect(() => {
    if (!isRacing) return;
    const startTime = Date.now();
    const animDurationMs = 5000;

    const frame = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(1, elapsed / animDurationMs);
      setRaceProgress(progress);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(frame);
      } else {
        setIsRacing(false);
      }
    };

    animRef.current = requestAnimationFrame(frame);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isRacing, time1Hours, time2Hours]);

  const handleStartRace = () => {
    setRaceProgress(0);
    setIsRacing(true);
  };

  const handleResetRace = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsRacing(false);
    setRaceProgress(0);
  };

  // ─── Formula Triangle Solver State ─────────────────────────────────────────
  const [solvingFor, setSolvingFor] = useState<"distance" | "speed" | "time">("distance");
  const [fSpeed, setFSpeed] = useState(80); // km/h
  const [fTime, setFTime] = useState(2.5); // hours
  const [fDistance, setFDistance] = useState(200); // km

  // ─── Experiments State ────────────────────────────────────────────────────
  // Experiment 1: Average Speed Paradox (Harmonic Mean)
  const [speedUp, setSpeedUp] = useState(30); // km/h
  const [speedDown, setSpeedDown] = useState(60); // km/h
  const tripDist = 60; // km each way
  const timeUp = tripDist / speedUp;
  const timeDown = tripDist / speedDown;
  const totalTime = timeUp + timeDown;
  const averageSpeed = (tripDist * 2) / totalTime;
  const naiveAverage = (speedUp + speedDown) / 2;

  // Experiment 2: Thunder & Lightning Distance Timer
  const [flashSeconds, setFlashSeconds] = useState(5);
  const speedOfSound = 343; // m/s
  const lightningDistanceMeters = flashSeconds * speedOfSound;
  const lightningDistanceKm = (lightningDistanceMeters / 1000).toFixed(2);
  const lightningDistanceMiles = (lightningDistanceMeters / 1609.34).toFixed(2);

  // ─── Quiz State ───────────────────────────────────────────────────────────
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const quizQuestions = [
    {
      id: 1,
      question: "A high-speed train travels at 150 km/h for 3 hours. How far does it travel?",
      options: ["300 km", "450 km", "500 km", "50 km"],
      correct: "450 km",
      explanation: "Distance = Speed × Time. 150 km/h × 3 hours = 450 km.",
    },
    {
      id: 2,
      question: "You see lightning and hear thunder 6 seconds later. Approximately how far away is the storm?",
      options: ["About 2 km", "About 6 km", "About 20 km", "About 600 meters"],
      correct: "About 2 km",
      explanation: "Sound travels at roughly 343 m/s (~1 km every 3 seconds). 6 seconds ÷ 3 = ~2 km.",
    },
    {
      id: 3,
      question: "If you drive to school at 20 km/h and return along the same route at 60 km/h, is your average speed 40 km/h?",
      options: [
        "Yes, (20 + 60) / 2 = 40 km/h",
        "No, it is 30 km/h because you spend 3x more time at 20 km/h",
        "No, it is 50 km/h",
        "It depends on the time of day",
      ],
      correct: "No, it is 30 km/h because you spend 3x more time at 20 km/h",
      explanation: "Average speed is Total Distance / Total Time (harmonic mean). Because you spend much more time at 20 km/h, the true average speed is 30 km/h!",
    },
    {
      id: 4,
      question: "What is the key difference between Speed and Velocity?",
      options: [
        "Speed has direction, while velocity is just a number",
        "Velocity is speed with a specific direction (vector quantity)",
        "Velocity is measured in miles and speed in kilometers",
        "There is no difference",
      ],
      correct: "Velocity is speed with a specific direction (vector quantity)",
      explanation: "Speed is scalar (how fast, e.g. 50 km/h), while Velocity is a vector (how fast and in what direction, e.g. 50 km/h North).",
    },
  ];

  // Fetch completion state on mount
  useEffect(() => {
    if (userId) {
      axios.get(`/api/progress?userId=${userId}`).then((res) => {
        const completedLessons = res.data.completedLessons || [];
        if (completedLessons.includes("speed")) {
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
        lessonId: "speed",
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
          topic: "Speed & Velocity",
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

  // Progress of each car based on relative speeds
  const maxTime = Math.max(time1Hours, time2Hours);
  const car1DistRatio = Math.min(1, (raceProgress * maxTime) / time1Hours);
  const car2DistRatio = Math.min(1, (raceProgress * maxTime) / time2Hours);

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-950 flex items-center gap-2">
              🏎️ Speed, Distance & Velocity
            </h1>
            <p className="text-gray-500 mt-1">
              Explore kinematic motion, race vehicles, uncover the average speed paradox, and master the D = S × T triangle.
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
            onClick={() => setActiveTab("race")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "race" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Race Track Sandbox
          </button>
          <button
            onClick={() => setActiveTab("formula")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "formula" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Formula Triangle
          </button>
          <button
            onClick={() => setActiveTab("experiments")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "experiments" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Real-World Experiments
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

        {/* Tab 1: Race Track Sandbox */}
        {activeTab === "race" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Virtual Drag Race Simulator</h3>
                <p className="text-sm text-gray-500">
                  Set vehicle speeds and total track distance, then start the race to observe motion live!
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleStartRace}
                  disabled={isRacing}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-bold rounded-xl shadow transition duration-200 cursor-pointer"
                >
                  {isRacing ? "Racing..." : "🏁 Start Race!"}
                </button>
                <button
                  onClick={handleResetRace}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition duration-200 cursor-pointer"
                >
                  ↺ Reset
                </button>
              </div>
            </div>

            {/* Race Tracks Canvas */}
            <div className="bg-slate-900 rounded-2xl p-6 space-y-6 text-white shadow-inner relative overflow-hidden">
              {/* Finish Line Marker */}
              <div className="absolute right-8 top-0 bottom-0 w-3 bg-gradient-to-b from-amber-400 via-white to-amber-400 opacity-80 border-r-2 border-dashed border-red-500 z-10" />

              {/* Lane 1: Sports Car */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-blue-300">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block scale-x-[-1]">🏎️</span> Sports Car ({speed1} km/h)
                  </span>
                  <span>Arrival: {time1Mins} mins ({time1Hours.toFixed(2)}h)</span>
                </div>
                <div className="relative h-12 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex items-center px-2">
                  <div className="absolute inset-x-0 h-0.5 border-t border-dashed border-slate-600" />
                  <div
                    className="absolute text-2xl transition-transform duration-75 flex items-center"
                    style={{ left: `calc(${car1DistRatio * 85}% + 8px)` }}
                  >
                    {isRacing && <span className="text-xs mr-0.5 opacity-80 animate-pulse">💨</span>}
                    <span className="inline-block scale-x-[-1] select-none">🏎️</span>
                  </div>
                </div>
              </div>

              {/* Lane 2: Bullet Train */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-purple-300">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-block scale-x-[-1]">🚄</span> Bullet Train ({speed2} km/h)
                  </span>
                  <span>Arrival: {time2Mins} mins ({time2Hours.toFixed(2)}h)</span>
                </div>
                <div className="relative h-12 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden flex items-center px-2">
                  <div className="absolute inset-x-0 h-0.5 border-t border-dashed border-slate-600" />
                  <div
                    className="absolute text-2xl transition-transform duration-75 flex items-center"
                    style={{ left: `calc(${car2DistRatio * 85}% + 8px)` }}
                  >
                    {isRacing && <span className="text-xs mr-0.5 opacity-80 animate-pulse">⚡</span>}
                    <span className="inline-block scale-x-[-1] select-none">🚄</span>
                  </div>
                </div>
              </div>

              <div className="text-right text-xs text-amber-300 font-mono font-bold tracking-wider">
                🏁 FINISH LINE: {targetDistance} KM
              </div>
            </div>

            {/* Sliders Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <div className="flex justify-between font-bold text-xs text-gray-700">
                  <span>🏎️ Car Speed:</span>
                  <span className="text-blue-600">{speed1} km/h</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  step="5"
                  value={speed1}
                  onChange={(e) => setSpeed1(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <div className="flex justify-between font-bold text-xs text-gray-700">
                  <span>🚄 Train Speed:</span>
                  <span className="text-purple-600">{speed2} km/h</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="350"
                  step="10"
                  value={speed2}
                  onChange={(e) => setSpeed2(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                <div className="flex justify-between font-bold text-xs text-gray-700">
                  <span>🏁 Track Distance:</span>
                  <span className="text-emerald-600">{targetDistance} km</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="500"
                  step="10"
                  value={targetDistance}
                  onChange={(e) => setTargetDistance(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            {/* Educational takeaway */}
            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="font-bold">Inverse Relationship Insight:</p>
                <p>
                  Notice that when you <strong>double the speed</strong> (e.g. from 60 km/h to 120 km/h), the time required is <strong>cut in half</strong>! Speed and Time are inversely proportional for any fixed distance.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Formula Triangle */}
        {activeTab === "formula" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900">The Magic Speed Triangle</h3>
              <p className="text-sm text-gray-500">
                Click on the variable you want to solve for. The triangle shows you the exact formula!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Interactive SVG Triangle */}
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <svg width="240" height="200" viewBox="0 0 240 200" className="cursor-pointer">
                  {/* Triangle outline */}
                  <polygon points="120,20 20,180 220,180" fill="#F8FAFC" stroke="#334155" strokeWidth="3" />
                  
                  {/* Dividing Lines */}
                  <line x1="60" y1="110" x2="180" y2="110" stroke="#334155" strokeWidth="3" />
                  <line x1="120" y1="110" x2="120" y2="180" stroke="#334155" strokeWidth="3" />

                  {/* Top: Distance (D) */}
                  <g onClick={() => setSolvingFor("distance")}>
                    <polygon
                      points="120,22 62,108 178,108"
                      fill={solvingFor === "distance" ? "#3B82F6" : "transparent"}
                      className="transition-colors hover:fill-blue-100"
                    />
                    <text
                      x="120"
                      y="78"
                      textAnchor="middle"
                      fontSize="24"
                      fontWeight="bold"
                      fill={solvingFor === "distance" ? "#FFFFFF" : "#1E293B"}
                    >
                      D
                    </text>
                  </g>

                  {/* Bottom Left: Speed (S) */}
                  <g onClick={() => setSolvingFor("speed")}>
                    <polygon
                      points="22,178 61,112 118,112 118,178"
                      fill={solvingFor === "speed" ? "#10B981" : "transparent"}
                      className="transition-colors hover:fill-emerald-100"
                    />
                    <text
                      x="75"
                      y="155"
                      textAnchor="middle"
                      fontSize="24"
                      fontWeight="bold"
                      fill={solvingFor === "speed" ? "#FFFFFF" : "#1E293B"}
                    >
                      S
                    </text>
                  </g>

                  {/* Bottom Right: Time (T) */}
                  <g onClick={() => setSolvingFor("time")}>
                    <polygon
                      points="122,112 179,112 218,178 122,178"
                      fill={solvingFor === "time" ? "#8B5CF6" : "transparent"}
                      className="transition-colors hover:fill-purple-100"
                    />
                    <text
                      x="165"
                      y="155"
                      textAnchor="middle"
                      fontSize="24"
                      fontWeight="bold"
                      fill={solvingFor === "time" ? "#FFFFFF" : "#1E293B"}
                    >
                      T
                    </text>
                  </g>
                </svg>
                <div className="text-xs text-gray-400 mt-3 font-semibold text-center">
                  Click D, S, or T inside the triangle to change target!
                </div>
              </div>

              {/* Formula & Calculator */}
              <div className="space-y-5">
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Active Formula</span>
                  <div className="text-2xl font-black text-blue-950 font-mono">
                    {solvingFor === "distance" && "Distance = Speed × Time"}
                    {solvingFor === "speed" && "Speed = Distance ÷ Time"}
                    {solvingFor === "time" && "Time = Distance ÷ Speed"}
                  </div>
                </div>

                {/* Input Fields */}
                {solvingFor === "distance" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-gray-500">Speed (km/h): {fSpeed}</label>
                      <input
                        type="range"
                        min="10"
                        max="200"
                        value={fSpeed}
                        onChange={(e) => setFSpeed(Number(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500">Time (hours): {fTime}</label>
                      <input
                        type="range"
                        min="0.5"
                        max="10"
                        step="0.5"
                        value={fTime}
                        onChange={(e) => setFTime(Number(e.target.value))}
                        className="w-full accent-purple-600"
                      />
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <div className="text-xs font-semibold text-emerald-600 uppercase">Calculated Distance</div>
                      <div className="text-3xl font-black text-emerald-900">{(fSpeed * fTime).toFixed(1)} km</div>
                    </div>
                  </div>
                )}

                {solvingFor === "speed" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-gray-500">Distance (km): {fDistance}</label>
                      <input
                        type="range"
                        min="20"
                        max="500"
                        value={fDistance}
                        onChange={(e) => setFDistance(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500">Time (hours): {fTime}</label>
                      <input
                        type="range"
                        min="0.5"
                        max="10"
                        step="0.5"
                        value={fTime}
                        onChange={(e) => setFTime(Number(e.target.value))}
                        className="w-full accent-purple-600"
                      />
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="text-xs font-semibold text-blue-600 uppercase">Calculated Speed</div>
                      <div className="text-3xl font-black text-blue-900">{(fDistance / fTime).toFixed(1)} km/h</div>
                    </div>
                  </div>
                )}

                {solvingFor === "time" && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-gray-500">Distance (km): {fDistance}</label>
                      <input
                        type="range"
                        min="20"
                        max="500"
                        value={fDistance}
                        onChange={(e) => setFDistance(Number(e.target.value))}
                        className="w-full accent-blue-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500">Speed (km/h): {fSpeed}</label>
                      <input
                        type="range"
                        min="10"
                        max="200"
                        value={fSpeed}
                        onChange={(e) => setFSpeed(Number(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                      <div className="text-xs font-semibold text-purple-600 uppercase">Calculated Time</div>
                      <div className="text-3xl font-black text-purple-900">
                        {(fDistance / fSpeed).toFixed(2)} hours ({( (fDistance / fSpeed) * 60 ).toFixed(0)} mins)
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Real-World Experiments */}
        {activeTab === "experiments" && (
          <div className="space-y-8">
            {/* Experiment 1: The Average Speed Paradox */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-amber-100 text-amber-800 rounded-xl text-xl">🏔️</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Experiment 1: The Average Speed Paradox</h3>
                  <p className="text-sm text-gray-500">Why the average speed of a round trip is NOT the simple average!</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Imagine driving <strong>60 km uphill</strong> at speed <strong>{speedUp} km/h</strong>, then turning around and driving <strong>60 km downhill</strong> at speed <strong>{speedDown} km/h</strong>.
                  </p>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-gray-500">Uphill Speed: {speedUp} km/h</label>
                      <input
                        type="range"
                        min="10"
                        max="60"
                        step="5"
                        value={speedUp}
                        onChange={(e) => setSpeedUp(Number(e.target.value))}
                        className="w-full accent-amber-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500">Downhill Speed: {speedDown} km/h</label>
                      <input
                        type="range"
                        min="30"
                        max="120"
                        step="5"
                        value={speedDown}
                        onChange={(e) => setSpeedDown(Number(e.target.value))}
                        className="w-full accent-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3 text-sm">
                  <div className="font-bold text-amber-900 flex justify-between border-b border-amber-200 pb-2">
                    <span>Intuitive Guess (Arithmetic Mean):</span>
                    <span className="text-rose-600 line-through font-extrabold">{naiveAverage.toFixed(1)} km/h</span>
                  </div>
                  <div className="font-bold text-amber-900 flex justify-between text-base">
                    <span>True Average Speed (Harmonic Mean):</span>
                    <span className="text-emerald-700 font-black text-xl">{averageSpeed.toFixed(1)} km/h</span>
                  </div>
                  <p className="text-xs text-amber-800 pt-2 border-t border-amber-100">
                    <strong>Why?</strong> You spend {timeUp.toFixed(1)} hours going up and only {timeDown.toFixed(1)} hours coming down. Because you spend far more time at the slower speed, the overall average is pulled heavily toward the slower speed!
                  </p>
                </div>
              </div>
            </div>

            {/* Experiment 2: Thunder & Lightning Distance */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-sky-100 text-sky-800 rounded-xl text-xl">⚡</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Experiment 2: Thunderstorm Distance Timer</h3>
                  <p className="text-sm text-gray-500">Calculate how far a lightning bolt struck based on sound delay.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Light travels almost instantaneously (300,000 km/s), while thunder travels at the speed of sound (&asymp; 343 m/s). Drag the slider to set the delay between the flash and the boom!
                  </p>
                  <div>
                    <label className="text-xs font-bold text-gray-700">Seconds until thunder is heard: {flashSeconds}s</label>
                    <input
                      type="range"
                      min="1"
                      max="20"
                      step="1"
                      value={flashSeconds}
                      onChange={(e) => setFlashSeconds(Number(e.target.value))}
                      className="w-full accent-sky-600"
                    />
                  </div>
                </div>

                <div className="p-5 bg-sky-50 border border-sky-100 rounded-2xl text-center space-y-2">
                  <div className="text-xs font-bold text-sky-600 uppercase">Estimated Distance to Lightning</div>
                  <div className="text-3xl font-black text-sky-950">{lightningDistanceKm} km</div>
                  <div className="text-xs text-sky-700">({lightningDistanceMiles} miles away)</div>
                  <div className="text-[11px] text-gray-500 pt-2 border-t border-sky-200/50">
                    Quick rule of thumb: Every 3 seconds of delay equals roughly 1 kilometer of distance!
                  </div>
                </div>
              </div>
            </div>

            {/* Cool Facts */}
            <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl space-y-4 shadow-md">
              <h4 className="font-extrabold text-lg flex items-center gap-2">
                <span>🚀</span> Mind-Blowing Velocity Facts
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-white/10 rounded-xl space-y-1">
                  <div className="font-bold text-amber-300">Cheetah vs Usain Bolt</div>
                  <p className="opacity-90">Usain Bolt reached 44.72 km/h. A cheetah accelerates from 0 to 100 km/h in under 3 seconds!</p>
                </div>
                <div className="p-3 bg-white/10 rounded-xl space-y-1">
                  <div className="font-bold text-cyan-300">Mach 1 (Sound Barrier)</div>
                  <p className="opacity-90">343 m/s (~1,235 km/h). When an aircraft exceeds this speed, it generates a dramatic sonic boom.</p>
                </div>
                <div className="p-3 bg-white/10 rounded-xl space-y-1">
                  <div className="font-bold text-pink-300">Orbital Velocity</div>
                  <p className="opacity-90">The International Space Station orbits Earth at 27,600 km/h (7.66 km/s), completing an entire orbit in 90 minutes!</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Quiz */}
        {activeTab === "quiz" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-2xl font-bold text-gray-900">Speed & Velocity Challenge</h3>
              <p className="text-sm text-gray-500 mt-1">Test your mastery of kinematics and formulas to earn up to 10 points!</p>
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
                    {quizScore === quizQuestions.length ? "🌟 Perfect score! 10 XP points awarded!" : "Well done! Review the answers below to reach 100%."}
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
