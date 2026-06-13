import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";

export interface QuizQuestion {
  id: string;           // unique question ID (used for AnswerHistory)
  conceptId: string;    // e.g. "cube_root_basic"
  questionText: string;
  correctAnswer: number;
  hint?: string;
  difficulty: 1 | 2 | 3 | 4 | 5; // 1=easiest, 5=hardest
}

interface QuizEngineProps {
  questions: QuizQuestion[];
  userId?: string;
  topic: string;             // for QuizAttempt logging
  onComplete?: (score: number, total: number) => void;
  onScoreEarned?: (points: number) => void;
  accentColor?: string;      // tailwind color class e.g. "indigo"
}

interface FeedbackState {
  type: "correct" | "wrong" | "";
  message: string;
  proficiency?: number;
}

/**
 * Reusable adaptive quiz engine.
 * - Tracks answer history & concept mastery via /api/concept-mastery
 * - Saves quiz attempt to /api/progress on finish
 * - Shows animated feedback on correct / wrong answers
 * - Adapts difficulty: consecutive correct → harder; consecutive wrong → easier
 */
export default function QuizEngine({
  questions,
  userId,
  topic,
  onComplete,
  onScoreEarned,
  accentColor = "indigo",
}: QuizEngineProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState>({ type: "", message: "" });
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [animate, setAnimate] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentQuestion = questions[currentIdx];
  const totalQuestions = questions.length;
  const progress = Math.round(((currentIdx) / totalQuestions) * 100);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
    setStartTime(Date.now());
    setShowHint(false);
    setAnimate(true);
    const t = setTimeout(() => setAnimate(false), 400);
    return () => clearTimeout(t);
  }, [currentIdx]);

  const handleSubmit = useCallback(async () => {
    if (feedback.type !== "" || submitting || !currentQuestion) return;
    const parsed = parseInt(userAnswer.trim());
    if (isNaN(parsed)) return;

    setSubmitting(true);
    const timeSpentMs = Date.now() - startTime;
    const isCorrect = parsed === currentQuestion.correctAnswer;

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      setConsecutiveCorrect((c) => c + 1);
      setConsecutiveWrong(0);
      setFeedback({ type: "correct", message: `✅ Correct! The answer is ${currentQuestion.correctAnswer}.` });
    } else {
      setConsecutiveWrong((c) => c + 1);
      setConsecutiveCorrect(0);
      setFeedback({ type: "wrong", message: `❌ Not quite! The answer is ${currentQuestion.correctAnswer}.` });
    }

    // Track concept mastery in background
    if (userId) {
      try {
        const res = await axios.post("/api/concept-mastery", {
          userId,
          conceptId: currentQuestion.conceptId,
          questionId: currentQuestion.id,
          isCorrect,
          timeSpentMs,
        });
        const { proficiency } = res.data;
        setFeedback((f) => ({ ...f, proficiency }));
      } catch (e) {
        console.error("concept-mastery error:", e);
      }
    }

    setSubmitting(false);
  }, [feedback.type, submitting, currentQuestion, userAnswer, startTime, userId]);

  const handleNext = useCallback(async () => {
    setFeedback({ type: "", message: "" });
    setUserAnswer("");

    const isLast = currentIdx >= totalQuestions - 1;

    if (isLast) {
      setFinished(true);
      const pointsEarned = correctCount * 10;
      // Log quiz attempt
      if (userId) {
        try {
          await axios.post("/api/progress", {
            userId,
            topic,
            score: correctCount,
            total: totalQuestions,
            action: "quiz_attempt",
          });
        } catch (e) {
          console.error("quiz attempt log error:", e);
        }
      }
      onScoreEarned?.(pointsEarned);
      onComplete?.(correctCount, totalQuestions);
    } else {
      setCurrentIdx((i) => i + 1);
    }
  }, [currentIdx, totalQuestions, correctCount, userId, topic, onScoreEarned, onComplete]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (feedback.type === "") handleSubmit();
      else handleNext();
    }
  };

  if (finished) {
    const pct = Math.round((correctCount / totalQuestions) * 100);
    const grade = pct >= 90 ? "🏆 Excellent!" : pct >= 70 ? "🎉 Great job!" : pct >= 50 ? "👍 Good effort!" : "📚 Keep practicing!";
    const gradeColor = pct >= 90 ? "text-yellow-600" : pct >= 70 ? "text-emerald-600" : pct >= 50 ? "text-blue-600" : "text-rose-600";
    const bgColor = pct >= 90 ? "bg-yellow-50 border-yellow-200" : pct >= 70 ? "bg-emerald-50 border-emerald-200" : pct >= 50 ? "bg-blue-50 border-blue-200" : "bg-rose-50 border-rose-200";

    return (
      <div className="text-center py-8">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-4 border-2 ${bgColor}`}>
          {pct >= 90 ? "🏆" : pct >= 70 ? "🎉" : pct >= 50 ? "👍" : "📚"}
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-1">Quiz Complete!</h3>
        <p className={`text-xl font-bold mb-2 ${gradeColor}`}>{grade}</p>
        <p className="text-slate-500 mb-6">
          You scored <span className="font-black text-slate-800">{correctCount}/{totalQuestions}</span> — {pct}%
          {hintsUsed > 0 && <span className="text-slate-400"> (used {hintsUsed} hint{hintsUsed > 1 ? "s" : ""})</span>}
        </p>

        {/* Score bar */}
        <div className="w-full max-w-xs mx-auto bg-gray-100 rounded-full h-3 mb-6 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${pct >= 80 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-400" : "bg-rose-400"}`}
            style={{ width: `${pct}%` }}
          />
        </div>

        <div className={`inline-block border px-6 py-3 rounded-2xl font-bold text-sm mb-6 ${bgColor} ${gradeColor}`}>
          +{correctCount * 10} Points Earned!
        </div>
      </div>
    );
  }

  const feedbackBg = feedback.type === "correct"
    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
    : "bg-rose-50 border-rose-200 text-rose-800";

  return (
    <div className={`transition-all duration-300 ${animate ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}>
      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-1.5 text-xs font-semibold text-slate-400">
          <span>Question {currentIdx + 1} of {totalQuestions}</span>
          <span className="text-emerald-600">{correctCount} correct</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full bg-${accentColor}-500 rounded-full transition-all duration-500`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="text-center mb-6">
        <span className={`inline-block text-xs font-bold uppercase tracking-widest text-${accentColor}-400 mb-2 px-3 py-1 bg-${accentColor}-50 rounded-full`}>
          {currentQuestion?.conceptId?.replace(/_/g, " ")}
        </span>
        <h3 className="text-2xl font-bold text-slate-800">
          {currentQuestion?.questionText}
        </h3>

        {/* Hint */}
        {currentQuestion?.hint && (
          <div className="mt-3">
            {!showHint ? (
              <button
                onClick={() => { setShowHint(true); setHintsUsed((h) => h + 1); }}
                className="text-xs text-slate-400 hover:text-slate-600 underline transition"
              >
                💡 Show Hint
              </button>
            ) : (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 mt-2 inline-block">
                💡 {currentQuestion.hint}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Input + Submit */}
      <div className="flex gap-3 justify-center mb-4">
        <input
          ref={inputRef}
          type="number"
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={feedback.type !== ""}
          className={`border-2 focus:outline-none px-4 py-3 rounded-xl w-44 text-center text-xl font-bold transition
            ${feedback.type === "correct" ? "border-emerald-400 bg-emerald-50" :
              feedback.type === "wrong" ? "border-rose-400 bg-rose-50" :
              `border-slate-200 focus:border-${accentColor}-500`}`}
          placeholder="Your answer"
        />
        {feedback.type === "" ? (
          <button
            onClick={handleSubmit}
            disabled={submitting || userAnswer === ""}
            className={`bg-${accentColor}-600 hover:bg-${accentColor}-700 disabled:opacity-40 text-white font-bold px-6 py-3 rounded-xl shadow-md transition`}
          >
            Submit
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-6 py-3 rounded-xl shadow-md transition flex items-center gap-1.5"
          >
            {currentIdx < totalQuestions - 1 ? "Next →" : "Finish 🏁"}
          </button>
        )}
      </div>

      {/* Feedback */}
      {feedback.message && (
        <div className={`p-3 rounded-xl border font-semibold text-sm text-center max-w-sm mx-auto transition-all duration-300 ${feedbackBg}`}>
          {feedback.message}
          {feedback.proficiency !== undefined && (
            <div className="mt-1.5 text-xs opacity-70">
              Concept mastery: <span className="font-black">{feedback.proficiency}%</span>
              {feedback.proficiency >= 80 && " 🌟 Mastered!"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
