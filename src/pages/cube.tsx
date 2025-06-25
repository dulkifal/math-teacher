import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
type TableRow = { n: number; cube: number };

function generateTableRows(start: number, end: number): TableRow[] {
  return Array.from({ length: end - start + 1 }, (_, i) => {
    const n = i + start;
    return { n, cube: n * n * n };
  });
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function CubeQuiz() {
  const { user } = useUser();
  const userId = user?.id || "";
  const [score, setScore] = useState(0);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [answer, setAnswer] = useState("");
  const [quizVisible, setQuizVisible] = useState(false);
  const [largeTable, setLargeTable] = useState<TableRow[]>([]);
  const answerInputRef = useRef<HTMLInputElement>(null);

  // Fetch score from DB
  useEffect(() => {
    if (userId) {
      axios.get(`/api/score?userId=${userId}`).then(res => {
        setScore(res.data.score || 0);
      });
    }
  }, [userId]);
  console.log("User:", user)

  // Shuffle large table on mount
  useEffect(() => {
    setLargeTable(shuffle(generateTableRows(11, 100)));
  }, []);

  // Focus input when quiz starts
  useEffect(() => {
    if (quizVisible && answerInputRef.current) {
      answerInputRef.current.focus();
    }
  }, [quizVisible, currentNumber]);

  function handleStartQuiz(cube: number) {
    setCurrentNumber(cube);
    setQuizVisible(true);
    setAnswer("");
  }

  async function handleCheckAnswer() {
    if (currentNumber === null) return;
    const correct = Math.round(Math.cbrt(currentNumber));
    if (parseInt(answer) === correct) {
      const newScore = score + 1;
      setScore(newScore);
      await axios.post("/api/score", { userId, score: newScore });
      setQuizVisible(false);
      setCurrentNumber(null);
    } else {
      console.log("Wrong! Try again.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center my-6">Cube Root Quiz</h1>

        {/* Score Display */}
        {userId && (
          <div className="text-center mb-6 text-xl font-bold">
            {user?.fullName}&apos;s Score: {score}
          </div>
        )}

        {/* Tables Container */}
        <div className="flex flex-col md:flex-row justify-between gap-6">
          {/* 1-10 Table */}
          <div className="md:w-1/4">
            <h2 className="text-xl font-bold mb-4">Cubes 1-10</h2>
            <table className="w-full">
              <tbody>
                {generateTableRows(1, 10).map(row => (
                  <tr key={row.n}>
                    <td>
                      <button
                        onClick={() => handleStartQuiz(row.cube)}
                        className="w-full text-left p-2 hover:bg-gray-200 rounded"
                        disabled={!userId}
                      >
                        {row.n} → {row.cube}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Quiz Area */}
          <div className="md:w-1/2 text-center flex flex-col items-center justify-center">
            {quizVisible && currentNumber !== null && (
              <div id="quizArea" className="bg-white rounded shadow p-6 w-full max-w-md">
                <h3 className="text-2xl mb-4">
                  What is the cube root of <span className="font-mono">{currentNumber}</span>?
                </h3>
                <input
                  type="number"
                  ref={answerInputRef}
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  className="border border-gray-300 p-2 rounded mb-2 w-2/3"
                  placeholder="Enter your answer"
                  onKeyDown={e => {
                    if (e.key === "Enter") handleCheckAnswer();
                  }}
                />
                <button
                  onClick={handleCheckAnswer}
                  className="bg-blue-500 text-white p-2 rounded ml-2"
                >
                  Submit
                </button>
              </div>
            )}
          </div>

          {/* 11-100 Table */}
          <div className="md:w-1/4">
            <h2 className="text-xl font-bold mb-4">Cubes 11-100</h2>
            <div className="h-96 overflow-y-auto">
              <table className="w-full">
                <tbody>
                  {largeTable.map(row => (
                    <tr key={row.n}>
                      <td>
                        <button
                          onClick={() => handleStartQuiz(row.cube)}
                          className="w-full text-left p-2 hover:bg-gray-200 rounded"
                          disabled={!userId}
                        >
                          {row.cube}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}