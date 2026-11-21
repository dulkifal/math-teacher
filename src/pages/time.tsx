import React, { useState, useEffect } from "react";
import { useUser } from "@/lib/auth";
import axios from "axios";

export default function TimeCalculationPage() {
  const { user } = useUser();
  const userId = user?.id || "";

  // Progress States
  const [completed, setCompleted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  // Tabs: "clock" | "elapsed" | "experiments" | "quiz"
  const [activeTab, setActiveTab] = useState<"clock" | "elapsed" | "experiments" | "quiz">("clock");

  // ─── Interactive Clock State ──────────────────────────────────────────────
  const [minutesOfDay, setMinutesOfDay] = useState(630); // 10:30 AM default (10 * 60 + 30)

  const currentHour24 = Math.floor(minutesOfDay / 60);
  const currentMinute = minutesOfDay % 60;
  const isPM = currentHour24 >= 12;
  const currentHour12 = currentHour24 % 12 === 0 ? 12 : currentHour24 % 12;

  // Clock Hand Angles
  const minuteAngle = currentMinute * 6; // 360 / 60 = 6 deg/min
  const hourAngle = (currentHour12 + currentMinute / 60) * 30; // 360 / 12 = 30 deg/hour

  // ─── Elapsed Time Journey State ───────────────────────────────────────────
  const [startHour, setStartHour] = useState(9);
  const [startMinute, setStartMinute] = useState(15);
  const [startPeriod, setStartPeriod] = useState<"AM" | "PM">("AM");

  const [endHour, setEndHour] = useState(2);
  const [endMinute, setEndMinute] = useState(45);
  const [endPeriod, setEndPeriod] = useState<"AM" | "PM">("PM");

  // Calculate elapsed minutes
  const startMinsTotal = (startHour % 12 + (startPeriod === "PM" ? 12 : 0)) * 60 + startMinute;
  let endMinsTotal = (endHour % 12 + (endPeriod === "PM" ? 12 : 0)) * 60 + endMinute;
  if (endMinsTotal < startMinsTotal) {
    endMinsTotal += 24 * 60; // Next day
  }
  const diffMinutes = endMinsTotal - startMinsTotal;
  const elapsedHours = Math.floor(diffMinutes / 60);
  const elapsedRemainingMins = diffMinutes % 60;

  // ─── Quiz State ───────────────────────────────────────────────────────────
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const quizQuestions = [
    {
      id: 1,
      question: "A movie starts at 7:45 PM and lasts 2 hours and 25 minutes. What time does it finish?",
      options: ["9:50 PM", "10:10 PM", "10:15 PM", "10:00 PM"],
      correct: "10:10 PM",
      explanation: "7:45 PM + 2 hours = 9:45 PM. 9:45 PM + 15 mins = 10:00 PM. Adding remaining 10 mins gives 10:10 PM.",
    },
    {
      id: 2,
      question: "Why do hours have 60 minutes and circles 360 degrees instead of base-10 (decimal)?",
      options: [
        "60 was the lucky number of Roman Emperors",
        "The ancient Babylonians used base-60 because 60 has 12 factors and divides evenly into many fractions",
        "It was determined by the number of days in an exact solar year",
        "It was invented by clockmakers in the 1700s",
      ],
      correct: "The ancient Babylonians used base-60 because 60 has 12 factors and divides evenly into many fractions",
      explanation: "60 is divisible by 1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, and 60, making half, third, quarter, and fifth fractions clean integers!",
    },
    {
      id: 3,
      question: "The Earth rotates 360 degrees in 24 hours. How many degrees of longitude correspond to each 1-hour time zone?",
      options: ["10 degrees", "15 degrees", "24 degrees", "30 degrees"],
      correct: "15 degrees",
      explanation: "360 degrees ÷ 24 hours = 15 degrees of longitude per time zone.",
    },
    {
      id: 4,
      question: "If your flight departs London at 14:00 GMT and arrives in New York (GMT-5) after an 8-hour flight, what local time do you land in New York?",
      options: ["22:00 (10:00 PM)", "17:00 (5:00 PM)", "19:00 (7:00 PM)", "12:00 (12:00 PM)"],
      correct: "17:00 (5:00 PM)",
      explanation: "London departure 14:00 + 8 hours flight = 22:00 GMT. New York is GMT-5, so 22:00 - 5 hours = 17:00 (5:00 PM) local time.",
    },
  ];

  // Fetch completion state on mount
  useEffect(() => {
    if (userId) {
      axios.get(`/api/progress?userId=${userId}`).then((res) => {
        const completedLessons = res.data.completedLessons || [];
        if (completedLessons.includes("time")) {
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
        lessonId: "time",
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
          topic: "Time & Clocks",
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
              ⏰ Time & Elapsed Time Calculation
            </h1>
            <p className="text-gray-500 mt-1">
              Explore analog & digital clock synchronization, calculate journey elapsed times, and uncover ancient Babylonian base-60 math.
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
            onClick={() => setActiveTab("clock")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "clock" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Analog & Digital Clock
          </button>
          <button
            onClick={() => setActiveTab("elapsed")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "elapsed" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Elapsed Time Journey
          </button>
          <button
            onClick={() => setActiveTab("experiments")}
            className={`flex-1 text-center py-3.5 font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "experiments" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Time Zones & Base-60
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

        {/* Tab 1: Clock */}
        {activeTab === "clock" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* SVG Analog Clock */}
              <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
                <svg width="220" height="220" viewBox="0 0 220 220" className="filter drop-shadow-md">
                  {/* Clock Face */}
                  <circle cx="110" cy="110" r="100" fill="#FFFFFF" stroke="#334155" strokeWidth="4" />
                  
                  {/* Hour markers */}
                  {Array.from({ length: 12 }, (_, i) => {
                    const ang = (i * 30 * Math.PI) / 180;
                    const x1 = 110 + 82 * Math.sin(ang);
                    const y1 = 110 - 82 * Math.cos(ang);
                    const x2 = 110 + 94 * Math.sin(ang);
                    const y2 = 110 - 94 * Math.cos(ang);
                    const tx = 110 + 72 * Math.sin(ang);
                    const ty = 110 - 72 * Math.cos(ang) + 4;
                    const num = i === 0 ? 12 : i;

                    return (
                      <g key={i}>
                        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#64748B" strokeWidth="2.5" />
                        <text x={tx} y={ty} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#334155">
                          {num}
                        </text>
                      </g>
                    );
                  })}

                  {/* Hour Hand */}
                  <line
                    x1="110"
                    y1="110"
                    x2={110 + 50 * Math.sin((hourAngle * Math.PI) / 180)}
                    y2={110 - 50 * Math.cos((hourAngle * Math.PI) / 180)}
                    stroke="#1E293B"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />

                  {/* Minute Hand */}
                  <line
                    x1="110"
                    y1="110"
                    x2={110 + 75 * Math.sin((minuteAngle * Math.PI) / 180)}
                    y2={110 - 75 * Math.cos((minuteAngle * Math.PI) / 180)}
                    stroke="#2563EB"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Center Pivot */}
                  <circle cx="110" cy="110" r="6" fill="#DC2626" />
                </svg>

                <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-800" /> Hour Hand (Short)
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 ml-2" /> Minute Hand (Long)
                </div>
              </div>

              {/* Digital & Slider Controls */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Synchronized Time Controls</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Drag the slider across 24 hours to observe day, night, and hand rotations in sync!
                  </p>
                </div>

                {/* Digital Display Box */}
                <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-inner text-center space-y-2">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                    <span>{isPM ? "🌙 Night / Afternoon" : "☀️ Morning"}</span>
                    <span>•</span>
                    <span>{isPM ? "PM" : "AM"}</span>
                  </div>

                  {/* 12h Format */}
                  <div className="text-4xl sm:text-5xl font-black font-mono tracking-wider text-amber-300">
                    {currentHour12}:{currentMinute.toString().padStart(2, "0")}{" "}
                    <span className="text-2xl font-bold">{isPM ? "PM" : "AM"}</span>
                  </div>

                  {/* 24h Military Format */}
                  <div className="text-xs text-slate-400 font-mono">
                    24-Hour Format: {currentHour24.toString().padStart(2, "0")}:{currentMinute.toString().padStart(2, "0")}
                  </div>
                </div>

                {/* Scrubber Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between font-bold text-xs text-gray-700">
                    <span>Adjust Minutes of the Day:</span>
                    <span className="text-blue-600 font-mono">{minutesOfDay} / 1440 mins</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1439"
                    step="5"
                    value={minutesOfDay}
                    onChange={(e) => setMinutesOfDay(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "🌅 7:00 AM", mins: 7 * 60 },
                    { label: "☀️ 12:00 PM", mins: 12 * 60 },
                    { label: "🏫 3:30 PM", mins: 15 * 60 + 30 },
                    { label: "🌙 8:45 PM", mins: 20 * 60 + 45 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setMinutesOfDay(preset.mins)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition cursor-pointer"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Elapsed Time Journey */}
        {activeTab === "elapsed" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Journey Elapsed Time Calculator</h3>
              <p className="text-sm text-gray-500">
                Plan a train or flight departure and arrival to see the duration broken down step-by-step.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Departure */}
              <div className="p-5 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
                <div className="font-extrabold text-blue-900 flex items-center gap-1.5 text-base">
                  <span>🛫 Departure Time</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-blue-700 uppercase">Hour</label>
                    <select
                      value={startHour}
                      onChange={(e) => setStartHour(Number(e.target.value))}
                      className="w-full bg-white border border-blue-200 rounded-lg p-2 text-sm font-bold text-gray-800"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-blue-700 uppercase">Minute</label>
                    <select
                      value={startMinute}
                      onChange={(e) => setStartMinute(Number(e.target.value))}
                      className="w-full bg-white border border-blue-200 rounded-lg p-2 text-sm font-bold text-gray-800"
                    >
                      {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                        <option key={m} value={m}>{m.toString().padStart(2, "0")}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-blue-700 uppercase">AM / PM</label>
                    <select
                      value={startPeriod}
                      onChange={(e) => setStartPeriod(e.target.value as "AM" | "PM")}
                      className="w-full bg-white border border-blue-200 rounded-lg p-2 text-sm font-bold text-gray-800"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Arrival */}
              <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                <div className="font-extrabold text-emerald-900 flex items-center gap-1.5 text-base">
                  <span>🛬 Arrival Time</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-emerald-700 uppercase">Hour</label>
                    <select
                      value={endHour}
                      onChange={(e) => setEndHour(Number(e.target.value))}
                      className="w-full bg-white border border-emerald-200 rounded-lg p-2 text-sm font-bold text-gray-800"
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-emerald-700 uppercase">Minute</label>
                    <select
                      value={endMinute}
                      onChange={(e) => setEndMinute(Number(e.target.value))}
                      className="w-full bg-white border border-emerald-200 rounded-lg p-2 text-sm font-bold text-gray-800"
                    >
                      {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                        <option key={m} value={m}>{m.toString().padStart(2, "0")}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-emerald-700 uppercase">AM / PM</label>
                    <select
                      value={endPeriod}
                      onChange={(e) => setEndPeriod(e.target.value as "AM" | "PM")}
                      className="w-full bg-white border border-emerald-200 rounded-lg p-2 text-sm font-bold text-gray-800"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Total Duration Banner */}
            <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl text-center space-y-1 shadow-md">
              <div className="text-xs uppercase font-bold text-blue-200 tracking-wider">Total Journey Duration</div>
              <div className="text-4xl font-black">
                {elapsedHours} Hours {elapsedRemainingMins > 0 ? `and ${elapsedRemainingMins} Minutes` : ""}
              </div>
              <div className="text-xs text-blue-100 font-mono pt-1">
                Total: {diffMinutes} minutes elapsed
              </div>
            </div>

            {/* Step-by-step Timeline Hop breakdown */}
            <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
              <h4 className="font-bold text-xs text-gray-700 uppercase tracking-wider">
                Mental Math Hop Breakdown:
              </h4>
              <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-700">
                <span className="p-2 bg-white rounded-lg border border-gray-200">
                  {startHour}:{startMinute.toString().padStart(2, "0")} {startPeriod}
                </span>
                <span>➔ (+{60 - startMinute > 0 && startMinute !== 0 ? `${60 - startMinute} mins` : "0 mins"}) ➔</span>
                <span className="p-2 bg-white rounded-lg border border-gray-200">
                  Nearest Next Hour
                </span>
                <span>➔ (+{Math.max(0, elapsedHours - (startMinute > 0 ? 1 : 0))} hours) ➔</span>
                <span className="p-2 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 font-bold">
                  {endHour}:{endMinute.toString().padStart(2, "0")} {endPeriod}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Experiments */}
        {activeTab === "experiments" && (
          <div className="space-y-8">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-amber-100 text-amber-800 rounded-xl text-xl">🏛️</span>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Why are hours 60 minutes and days 24 hours?</h3>
                  <p className="text-sm text-gray-500">The fascinating history of Babylonian sexagesimal base-60 mathematics.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700 leading-relaxed">
                <div className="space-y-3 p-5 bg-amber-50/60 border border-amber-200 rounded-2xl">
                  <h4 className="font-extrabold text-amber-950">1. Why Base 60?</h4>
                  <p>
                    Most human cultures use base 10 because we have 10 fingers. But 10 is only divisible by 2 and 5.
                  </p>
                  <p>
                    The ancient Babylonians (~3,000 BC) used <strong>base 60</strong> because 60 has <strong>12 factors</strong>:
                    <br />
                    <code className="text-xs font-mono font-bold text-amber-800 bg-white px-1.5 py-0.5 rounded">
                      1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, 60
                    </code>
                  </p>
                  <p className="text-xs text-amber-900">
                    This made splitting time into halves (30m), thirds (20m), quarters (15m), and fifths (12m) effortlessly simple without messy decimals!
                  </p>
                </div>

                <div className="space-y-3 p-5 bg-sky-50/60 border border-sky-200 rounded-2xl">
                  <h4 className="font-extrabold text-sky-950">2. Why 24 Hours in a Day?</h4>
                  <p>
                    Ancient Egyptians divided the daytime into <strong>10 hours</strong> of sunlight, plus <strong>2 twilight hours</strong> (dawn & dusk) = 12 daytime hours.
                  </p>
                  <p>
                    At night, they tracked <strong>12 &apos;decans&apos;</strong> (star groups) across the night sky, giving 12 nighttime hours.
                  </p>
                  <p className="text-xs text-sky-900 font-bold">
                    12 Day Hours + 12 Night Hours = 24 Hours per Earth rotation!
                  </p>
                </div>
              </div>
            </div>

            {/* Time Zones & Earth Rotation */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-4">
              <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>🌍</span> Earth Rotation & Time Zones
              </h4>
              <p className="text-sm text-gray-600">
                Earth makes one full <strong>360° spin</strong> every <strong>24 hours</strong>:
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center text-slate-800 text-lg font-extrabold">
                360° ÷ 24 Hours = 15° Longitude per 1-Hour Time Zone
              </div>
              <p className="text-xs text-gray-500">
                Every time you travel 15 degrees East or West on the globe, the local solar time shifts by exactly 1 hour.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Quiz */}
        {activeTab === "quiz" && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-2xl font-bold text-gray-900">Time & Clocks Challenge</h3>
              <p className="text-sm text-gray-500 mt-1">Test your elapsed time, time zone, and clock math skills!</p>
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
                    {quizScore === quizQuestions.length ? "🌟 Perfect! 10 XP points awarded!" : "Good effort! Review the explanations below."}
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
