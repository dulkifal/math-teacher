import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useUser } from "@/lib/auth";
import axios from "axios";

// ─── TYPES ───────────────────────────────────────────────────────────────────

type AccountCategory = "asset" | "liability" | "equity" | "revenue" | "expense";

interface Account {
  id: string;
  name: string;
  category: AccountCategory;
  normalBalance: "debit" | "credit";
  icon: string;
}

interface Transaction {
  id: number;
  date: string;
  description: string;
  debitAccount: string;
  creditAccount: string;
  amount: number;
  explanation: string;
}

interface TEntry {
  txId: number;
  type: "debit" | "credit";
  amount: number;
  ref: string;
}

// ─── PRESET ACCOUNTS ─────────────────────────────────────────────────────────

const MASTER_ACCOUNTS: Account[] = [
  { id: "cash", name: "Cash at Bank", category: "asset", normalBalance: "debit", icon: "💵" },
  { id: "ar", name: "Accounts Receivable", category: "asset", normalBalance: "debit", icon: "📑" },
  { id: "supplies", name: "Office Supplies", category: "asset", normalBalance: "debit", icon: "📦" },
  { id: "equipment", name: "Computers & Gear", category: "asset", normalBalance: "debit", icon: "💻" },
  { id: "ap", name: "Accounts Payable", category: "liability", normalBalance: "credit", icon: "🤝" },
  { id: "loan", name: "Bank Loan", category: "liability", normalBalance: "credit", icon: "🏦" },
  { id: "capital", name: "Owner's Capital", category: "equity", normalBalance: "credit", icon: "🏛️" },
  { id: "revenue", name: "Consulting Revenue", category: "revenue", normalBalance: "credit", icon: "📈" },
  { id: "rent", name: "Rent Expense", category: "expense", normalBalance: "debit", icon: "🏢" },
  { id: "salaries", name: "Salary Expense", category: "expense", normalBalance: "debit", icon: "👥" },
];

// Initial Business Journey Preset Transactions
const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 1,
    date: "Day 1",
    description: "Owner invested cash to launch business",
    debitAccount: "cash",
    creditAccount: "capital",
    amount: 10000,
    explanation: "Cash (Asset) increases with Debit. Capital (Equity) increases with Credit.",
  },
  {
    id: 2,
    date: "Day 3",
    description: "Purchased high-spec workstations for cash",
    debitAccount: "equipment",
    creditAccount: "cash",
    amount: 3200,
    explanation: "Equipment (Asset) increases with Debit. Cash (Asset) decreases with Credit.",
  },
  {
    id: 3,
    date: "Day 7",
    description: "Bought office supplies on credit from Vendor",
    debitAccount: "supplies",
    creditAccount: "ap",
    amount: 600,
    explanation: "Supplies (Asset) increases with Debit. Accounts Payable (Liability) increases with Credit.",
  },
  {
    id: 4,
    date: "Day 12",
    description: "Delivered app design to client on invoice",
    debitAccount: "ar",
    creditAccount: "revenue",
    amount: 4500,
    explanation: "Accounts Receivable (Asset) increases with Debit. Revenue (Equity boost) increases with Credit.",
  },
  {
    id: 5,
    date: "Day 18",
    description: "Paid monthly studio workspace rent",
    debitAccount: "rent",
    creditAccount: "cash",
    amount: 1000,
    explanation: "Rent (Expense) increases with Debit. Cash (Asset) decreases with Credit.",
  },
  {
    id: 6,
    date: "Day 24",
    description: "Client paid cash for earlier invoice",
    debitAccount: "cash",
    creditAccount: "ar",
    amount: 2500,
    explanation: "Cash increases with Debit. Accounts Receivable decreases with Credit (Asset swap).",
  },
];

export default function AccountingPlayground() {
  const { user } = useUser();
  const userId = user?.id || "";

  // Progress States
  const [completed, setCompleted] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  // Active Tab: "equation" | "taccounts" | "worksheet" | "facts" | "quiz"
  const [activeTab, setActiveTab] = useState<"equation" | "taccounts" | "worksheet" | "facts" | "quiz">("equation");

  // ─── TAB 1: EQUATION SEESAW STATE ──────────────────────────────────────────
  const [simCash, setSimCash] = useState(12000);
  const [simReceivables, setSimReceivables] = useState(3000);
  const [simEquipment, setSimEquipment] = useState(5000);
  const [simPayables, setSimPayables] = useState(4000);
  const [simBankLoan, setSimBankLoan] = useState(6000);
  const [simOwnerEquity, setSimOwnerEquity] = useState(10000);

  const totalAssets = simCash + simReceivables + simEquipment;
  const totalLiabilities = simPayables + simBankLoan;
  const totalRightSide = totalLiabilities + simOwnerEquity;
  const equationDiff = totalAssets - totalRightSide; // 0 means balanced

  // Quick transaction scenarios for equation
  const applyEquationScenario = (action: string) => {
    switch (action) {
      case "buy_equip_cash":
        // Buy $2,000 gear with cash (Asset swap)
        setSimCash((c) => Math.max(0, c - 2000));
        setSimEquipment((e) => e + 2000);
        break;
      case "borrow_loan":
        // Borrow $5,000 cash from bank
        setSimCash((c) => c + 5000);
        setSimBankLoan((b) => b + 5000);
        break;
      case "pay_supplier":
        // Pay $1,500 owed to supplier
        setSimCash((c) => Math.max(0, c - 1500));
        setSimPayables((p) => Math.max(0, p - 1500));
        break;
      case "earn_profit":
        // Earn $3,000 cash profit
        setSimCash((c) => c + 3000);
        setSimOwnerEquity((eq) => eq + 3000);
        break;
      case "reset":
        setSimCash(12000);
        setSimReceivables(3000);
        setSimEquipment(5000);
        setSimPayables(4000);
        setSimBankLoan(6000);
        setSimOwnerEquity(10000);
        break;
    }
  };

  // ─── TAB 2: DOUBLE ENTRY & T-ACCOUNTS STATE ────────────────────────────────
  const [transactions, setTransactions] = useState<Transaction[]>(DEFAULT_TRANSACTIONS);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(DEFAULT_TRANSACTIONS[0]);

  // Form for custom transaction
  const [customDesc, setCustomDesc] = useState("");
  const [customDebit, setCustomDebit] = useState("cash");
  const [customCredit, setCustomCredit] = useState("revenue");
  const [customAmount, setCustomAmount] = useState<number>(1000);

  const handleAddCustomTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAmount || customAmount <= 0) return;
    if (customDebit === customCredit) {
      alert("Debit account and Credit account must be distinct!");
      return;
    }
    const newTx: Transaction = {
      id: Date.now(),
      date: `Entry #${transactions.length + 1}`,
      description: customDesc.trim() || `Transaction ${transactions.length + 1}`,
      debitAccount: customDebit,
      creditAccount: customCredit,
      amount: customAmount,
      explanation: `Debited ${MASTER_ACCOUNTS.find((a) => a.id === customDebit)?.name} and Credited ${
        MASTER_ACCOUNTS.find((a) => a.id === customCredit)?.name
      }.`,
    };
    setTransactions((prev) => [...prev, newTx]);
    setSelectedTx(newTx);
    setCustomDesc("");
  };

  // Compute T-Account entries and balances
  const tAccountData: Record<string, { entries: TEntry[]; debitSum: number; creditSum: number; netBalance: number }> = {};
  MASTER_ACCOUNTS.forEach((acc) => {
    tAccountData[acc.id] = { entries: [], debitSum: 0, creditSum: 0, netBalance: 0 };
  });

  transactions.forEach((tx) => {
    if (tAccountData[tx.debitAccount]) {
      tAccountData[tx.debitAccount].entries.push({
        txId: tx.id,
        type: "debit",
        amount: tx.amount,
        ref: tx.description,
      });
      tAccountData[tx.debitAccount].debitSum += tx.amount;
    }
    if (tAccountData[tx.creditAccount]) {
      tAccountData[tx.creditAccount].entries.push({
        txId: tx.id,
        type: "credit",
        amount: tx.amount,
        ref: tx.description,
      });
      tAccountData[tx.creditAccount].creditSum += tx.amount;
    }
  });

  // Calculate Net Balances according to Normal Balance
  MASTER_ACCOUNTS.forEach((acc) => {
    const data = tAccountData[acc.id];
    if (acc.normalBalance === "debit") {
      data.netBalance = data.debitSum - data.creditSum;
    } else {
      data.netBalance = data.creditSum - data.debitSum;
    }
  });

  const totalAllDebits = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalAllCredits = transactions.reduce((sum, tx) => sum + tx.amount, 0);

  // ─── TAB 3: ACCOUNTING WORKSHEET & BALANCE SHEET STATE ─────────────────────
  // Interactive Adjustment switches
  const [depreciateEquip, setDepreciateEquip] = useState(true); // $400 depreciation
  const [accruedSalaries, setAccruedSalaries] = useState(true); // $500 salaries owed
  const [suppliesUsed, setSuppliesUsed] = useState(false); // $200 supplies used up

  // Base unadjusted figures
  const worksheetBase = [
    { account: "Cash at Bank", category: "asset", unadjDr: 8300, unadjCr: 0 },
    { account: "Accounts Receivable", category: "asset", unadjDr: 2000, unadjCr: 0 },
    { account: "Office Supplies", category: "asset", unadjDr: 600, unadjCr: 0 },
    { account: "Computers & Gear", category: "asset", unadjDr: 3200, unadjCr: 0 },
    { account: "Accounts Payable", category: "liability", unadjDr: 0, unadjCr: 600 },
    { account: "Salaries Payable", category: "liability", unadjDr: 0, unadjCr: 0 },
    { account: "Owner's Capital", category: "equity", unadjDr: 0, unadjCr: 10000 },
    { account: "Consulting Revenue", category: "revenue", unadjDr: 0, unadjCr: 4500 },
    { account: "Rent Expense", category: "expense", unadjDr: 1000, unadjCr: 0 },
    { account: "Salary Expense", category: "expense", unadjDr: 0, unadjCr: 0 },
    { account: "Supplies Expense", category: "expense", unadjDr: 0, unadjCr: 0 },
    { account: "Depreciation Expense", category: "expense", unadjDr: 0, unadjCr: 0 },
    { account: "Accumulated Depreciation", category: "contra-asset", unadjDr: 0, unadjCr: 0 },
  ];

  // Adjustments map
  const adjustments: Record<string, { dr: number; cr: number }> = {};
  worksheetBase.forEach((r) => {
    adjustments[r.account] = { dr: 0, cr: 0 };
  });

  if (depreciateEquip) {
    adjustments["Depreciation Expense"].dr += 400;
    adjustments["Accumulated Depreciation"].cr += 400;
  }
  if (accruedSalaries) {
    adjustments["Salary Expense"].dr += 500;
    adjustments["Salaries Payable"].cr += 500;
  }
  if (suppliesUsed) {
    adjustments["Supplies Expense"].dr += 200;
    adjustments["Office Supplies"].cr += 200;
  }

  // Calculate adjusted, income statement, and balance sheet columns
  let totalISRevenue = 0;
  let totalISExpense = 0;
  let totalBSAssets = 0;
  let totalBSLiabEquity = 0;

  const worksheetRows = worksheetBase.map((row) => {
    const adj = adjustments[row.account];
    let adjDr = 0;
    let adjCr = 0;

    const netEffect = (row.unadjDr + adj.dr) - (row.unadjCr + adj.cr);
    if (netEffect >= 0) {
      adjDr = netEffect;
    } else {
      adjCr = Math.abs(netEffect);
    }

    // Distribute to Income Statement or Balance Sheet
    let isDr = 0;
    let isCr = 0;
    let bsDr = 0;
    let bsCr = 0;

    if (row.category === "revenue") {
      isCr = adjCr;
      totalISRevenue += isCr;
    } else if (row.category === "expense") {
      isDr = adjDr;
      totalISExpense += isDr;
    } else if (row.category === "asset") {
      bsDr = adjDr;
      totalBSAssets += bsDr;
    } else if (row.category === "contra-asset") {
      bsCr = adjCr;
      totalBSAssets -= bsCr; // offsets assets
    } else {
      // liability or equity
      bsCr = adjCr;
      totalBSLiabEquity += bsCr;
    }

    return {
      ...row,
      adjDr,
      adjCr,
      isDr,
      isCr,
      bsDr,
      bsCr,
    };
  });

  const netIncome = totalISRevenue - totalISExpense; // Net Profit
  const endingEquityWithProfit = totalBSLiabEquity + netIncome;
  const isSheetBalanced = totalBSAssets === endingEquityWithProfit;

  // ─── TAB 5: QUIZ STATE ─────────────────────────────────────────────────────
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const quizQuestions = [
    {
      id: 1,
      question: "Which of the following describes the fundamental Accounting Equation?",
      options: [
        "Assets = Liabilities + Owner's Equity",
        "Assets + Liabilities = Owner's Equity",
        "Assets = Liabilities - Net Income",
        "Revenue - Expenses = Total Assets",
      ],
      correct: "Assets = Liabilities + Owner's Equity",
      explanation: "Everything a business owns (Assets) was funded either by borrowing from creditors (Liabilities) or invested by owners (Equity).",
    },
    {
      id: 2,
      question: "Under the DEALER mnemonic, which accounts increase with a DEBIT?",
      options: [
        "Dividends, Expenses, and Assets",
        "Liabilities, Equity, and Revenue",
        "Cash, Debt, and Capital",
        "Revenue, Expenses, and Liabilities",
      ],
      correct: "Dividends, Expenses, and Assets",
      explanation: "DEALER: Dividends, Expenses, Assets increase on Debit (Left side). Liabilities, Equity, Revenue increase on Credit (Right side).",
    },
    {
      id: 3,
      question: "A company purchases $2,000 of computer hardware on 30-day credit from a vendor. How is this recorded?",
      options: [
        "Debit Equipment $2,000 ; Credit Accounts Payable $2,000",
        "Debit Cash $2,000 ; Credit Equipment $2,000",
        "Debit Accounts Payable $2,000 ; Credit Equipment $2,000",
        "Debit Expense $2,000 ; Credit Cash $2,000",
      ],
      correct: "Debit Equipment $2,000 ; Credit Accounts Payable $2,000",
      explanation: "Equipment is an Asset (increases via Debit). Accounts Payable is a Liability (increases via Credit). Both sides increase equally!",
    },
    {
      id: 4,
      question: "If a company has Revenues of $10,000 and Expenses of $6,000, what happens to the Balance Sheet?",
      options: [
        "Net Income of $4,000 increases Owner's Equity",
        "Assets automatically decrease by $4,000",
        "Liabilities increase by $4,000",
        "The Balance Sheet will be permanently out of balance",
      ],
      correct: "Net Income of $4,000 increases Owner's Equity",
      explanation: "Net Income ($10,000 - $6,000 = $4,000) flows from the Income Statement into Retained Earnings (Owner's Equity) on the Balance Sheet.",
    },
    {
      id: 5,
      question: "Why does a Trial Balance with equal total debits and credits NOT prove that records are error-free?",
      options: [
        "An entire transaction could have been completely omitted or posted twice",
        "Debits and credits never actually balance in modern software",
        "Because assets can never equal liabilities in real business",
        "Accountants only balance books once every 10 years",
      ],
      correct: "An entire transaction could have been completely omitted or posted twice",
      explanation: "A balanced Trial Balance only proves mathematical equality. If an entire transaction was omitted or posted to the wrong account, debits still equal credits!",
    },
  ];

  // Fetch initial progress
  useEffect(() => {
    if (userId) {
      axios
        .get(`/api/progress?userId=${userId}`)
        .then((res) => {
          if (res.data.completedLessons?.includes("accounting")) {
            setCompleted(true);
          }
        })
        .catch(() => {});
    }
  }, [userId]);

  // Mark lesson as complete
  const handleCompleteLesson = async () => {
    if (!userId) return;
    setSavingProgress(true);
    try {
      await axios.post("/api/progress", {
        userId,
        lessonId: "accounting",
        action: "complete_lesson",
      });
      setCompleted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSavingProgress(false);
    }
  };

  // Submit quiz
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
          topic: "Accounting & Double-Entry",
          score,
          total: quizQuestions.length,
        });

        const pointsAwarded = score === quizQuestions.length ? 15 : score * 3;
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
    <>
      <Head>
        <title>Accounting & Double-Entry Bookkeeping — Visual Math Playground</title>
        <meta
          name="description"
          content="Master the foundations of accounting visually: the golden accounting equation seesaw, interactive T-accounts, live double-entry journal, and 10-column worksheet balancing."
        />
      </Head>

      <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Breadcrumbs & Navigation */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition"
            >
              ← Back to Lessons Directory
            </Link>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                Applied Financial Math
              </span>
              <button
                onClick={handleCompleteLesson}
                disabled={completed || savingProgress}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  completed
                    ? "bg-green-600 text-white cursor-default"
                    : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-xs"
                }`}
              >
                {completed ? "✓ Mastered" : savingProgress ? "Saving..." : "Mark as Complete"}
              </button>
            </div>
          </div>

          {/* Hero Header */}
          <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-cyan-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 px-3.5 py-1 rounded-full text-xs font-bold text-emerald-200">
                <span>⚖️</span>
                <span>The Universal Language of Business</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                Accounting & Double-Entry Systems
              </h1>
              <p className="text-emerald-100 text-base sm:text-lg max-w-2xl leading-relaxed">
                Discover the 500-year-old mathematical secret that powers global commerce: where every single financial
                event keeps Debits equal to Credits and the Balance Sheet in perfect harmony.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center min-w-[200px]">
              <div className="text-xs uppercase tracking-widest text-emerald-200 font-bold mb-1">
                The Golden Formula
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">Assets = Liab. + Equity</div>
              <div className="text-[11px] text-emerald-200 mt-2 font-medium">Debits (Dr) = Credits (Cr)</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 bg-white rounded-t-2xl px-4 overflow-x-auto shadow-xs">
            <button
              onClick={() => setActiveTab("equation")}
              className={`flex-1 min-w-[150px] text-center py-4 font-bold border-b-2 text-sm transition-all cursor-pointer ${
                activeTab === "equation"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              1. The Balance Seesaw
            </button>
            <button
              onClick={() => setActiveTab("taccounts")}
              className={`flex-1 min-w-[170px] text-center py-4 font-bold border-b-2 text-sm transition-all cursor-pointer ${
                activeTab === "taccounts"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              2. Double-Entry & T-Accounts
            </button>
            <button
              onClick={() => setActiveTab("worksheet")}
              className={`flex-1 min-w-[180px] text-center py-4 font-bold border-b-2 text-sm transition-all cursor-pointer ${
                activeTab === "worksheet"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              3. Worksheet & Balance Sheet
            </button>
            <button
              onClick={() => setActiveTab("facts")}
              className={`flex-1 min-w-[150px] text-center py-4 font-bold border-b-2 text-sm transition-all cursor-pointer ${
                activeTab === "facts"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              4. Forensics & Facts
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={`flex-1 min-w-[130px] text-center py-4 font-bold border-b-2 text-sm transition-all cursor-pointer ${
                activeTab === "quiz"
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              5. Knowledge Quiz
            </button>
          </div>

          {/* ══════════════════════════════════════════════════════════════════════
              TAB 1: THE FUNDAMENTAL EQUATION SEESAW
          ══════════════════════════════════════════════════════════════════════ */}
          {activeTab === "equation" && (
            <div className="bg-white p-6 sm:p-8 rounded-b-2xl shadow-sm border border-gray-100 space-y-8">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  The Fundamental Accounting Equation: Assets = Liabilities + Equity
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Everything a business possesses (**Assets**) was funded either by borrowed money (**Liabilities**) or
                  contributed/earned by the business founders (**Equity**).
                </p>
              </div>

              {/* Visual Balance Scale Seesaw */}
              <div className="bg-gradient-to-b from-gray-50 to-emerald-50/30 p-6 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">⚖️</span>
                    <span className="font-extrabold text-gray-800 text-sm">Interactive Equilibrium Scale</span>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      equationDiff === 0
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-red-100 text-red-800 border border-red-300"
                    }`}
                  >
                    {equationDiff === 0 ? "✓ In Perfect Equilibrium" : `⚠ Imbalanced by \$${Math.abs(equationDiff).toLocaleString()}`}
                  </div>
                </div>

                {/* The Graphic Scale / Seesaw */}
                <div className="relative py-6">
                  {/* Visual Beam */}
                  <div
                    className="h-3 bg-gradient-to-r from-blue-600 via-gray-700 to-purple-600 rounded-full transition-transform duration-500 shadow-md relative"
                    style={{
                      transform: `rotate(${Math.max(-8, Math.min(8, equationDiff * 0.001))}deg)`,
                      transformOrigin: "center center",
                    }}
                  >
                    {/* Left Pan: Assets */}
                    <div className="absolute left-4 -top-16 bg-blue-600 text-white px-4 py-2 rounded-xl shadow-lg text-center min-w-[140px]">
                      <div className="text-[11px] uppercase tracking-wider font-semibold opacity-90">Left Pan (Assets)</div>
                      <div className="text-xl font-black">${totalAssets.toLocaleString()}</div>
                    </div>

                    {/* Center Fulcrum */}
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-8 w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[28px] border-b-gray-800" />

                    {/* Right Pan: Liabilities + Equity */}
                    <div className="absolute right-4 -top-16 bg-purple-600 text-white px-4 py-2 rounded-xl shadow-lg text-center min-w-[160px]">
                      <div className="text-[11px] uppercase tracking-wider font-semibold opacity-90">
                        Right Pan (Liab + Equity)
                      </div>
                      <div className="text-xl font-black">${totalRightSide.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Fulcrum Base */}
                  <div className="w-24 h-3 bg-gray-400 mx-auto mt-7 rounded-full" />
                </div>

                {/* Subtitle comparison */}
                <div className="text-center mt-6 text-sm font-semibold text-gray-700">
                  <span className="text-blue-600 font-bold">${totalAssets.toLocaleString()}</span> (Assets) ={" "}
                  <span className="text-amber-600 font-bold">${totalLiabilities.toLocaleString()}</span> (Liabilities) +{" "}
                  <span className="text-purple-600 font-bold">${simOwnerEquity.toLocaleString()}</span> (Owner&apos;s Equity)
                </div>
              </div>

              {/* Preset Scenario Buttons */}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                  Test How Real Business Actions Affect The Equation:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    onClick={() => applyEquationScenario("buy_equip_cash")}
                    className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl text-left transition text-xs font-semibold text-blue-900 cursor-pointer"
                  >
                    <div className="font-bold text-sm mb-1">💻 Buy Gear with Cash ($2k)</div>
                    <div className="text-blue-700 text-[11px]">Asset swap: Cash decreases, Equipment increases. Scale remains balanced!</div>
                  </button>

                  <button
                    onClick={() => applyEquationScenario("borrow_loan")}
                    className="p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-left transition text-xs font-semibold text-amber-900 cursor-pointer"
                  >
                    <div className="font-bold text-sm mb-1">🏦 Borrow Bank Loan ($5k)</div>
                    <div className="text-amber-700 text-[11px]">Both sides grow: Cash (Asset) +$5k, Bank Loan (Liability) +$5k.</div>
                  </button>

                  <button
                    onClick={() => applyEquationScenario("pay_supplier")}
                    className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-left transition text-xs font-semibold text-emerald-900 cursor-pointer"
                  >
                    <div className="font-bold text-sm mb-1">🤝 Pay Vendor Debt ($1.5k)</div>
                    <div className="text-emerald-700 text-[11px]">Both sides shrink: Cash (Asset) -$1.5k, Accounts Payable -$1.5k.</div>
                  </button>

                  <button
                    onClick={() => applyEquationScenario("earn_profit")}
                    className="p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-left transition text-xs font-semibold text-purple-900 cursor-pointer"
                  >
                    <div className="font-bold text-sm mb-1">📈 Earn Cash Profit ($3k)</div>
                    <div className="text-purple-700 text-[11px]">Both sides grow: Cash (Asset) +$3k, Equity (Retained Earnings) +$3k.</div>
                  </button>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={() => applyEquationScenario("reset")}
                    className="text-xs text-gray-500 hover:text-gray-800 underline font-semibold"
                  >
                    Reset to Initial Balances
                  </button>
                </div>
              </div>

              {/* Deep Dive Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                {/* Assets Card */}
                <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-black text-blue-900 text-lg">Assets (What We Own)</span>
                    <span className="text-xl">🏢</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-4">Economic resources that will generate future economic value.</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-blue-100">
                      <span className="text-gray-600">💵 Cash at Bank</span>
                      <span className="font-bold text-gray-900">${simCash.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-blue-100">
                      <span className="text-gray-600">📑 Accounts Receivable</span>
                      <span className="font-bold text-gray-900">${simReceivables.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-blue-100">
                      <span className="text-gray-600">💻 Equipment & Hardware</span>
                      <span className="font-bold text-gray-900">${simEquipment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 text-sm font-black text-blue-900">
                      <span>Total Assets</span>
                      <span>${totalAssets.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Liabilities Card */}
                <div className="p-5 bg-amber-50/50 rounded-2xl border border-amber-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-black text-amber-900 text-lg">Liabilities (What We Owe)</span>
                    <span className="text-xl">💳</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-4">Obligations owed to external parties and creditors.</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-amber-100">
                      <span className="text-gray-600">🤝 Accounts Payable (Suppliers)</span>
                      <span className="font-bold text-gray-900">${simPayables.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-amber-100">
                      <span className="text-gray-600">🏦 Bank Loan Notes</span>
                      <span className="font-bold text-gray-900">${simBankLoan.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-6 text-sm font-black text-amber-900">
                      <span>Total Liabilities</span>
                      <span>${totalLiabilities.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Equity Card */}
                <div className="p-5 bg-purple-50/50 rounded-2xl border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-black text-purple-900 text-lg">Equity (Net Worth)</span>
                    <span className="text-xl">🏛️</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-4">The owners&apos; residual claim on assets after settling all liabilities.</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-purple-100">
                      <span className="text-gray-600">🏛️ Capital & Retained Earnings</span>
                      <span className="font-bold text-gray-900">${simOwnerEquity.toLocaleString()}</span>
                    </div>
                    <div className="py-2 text-[11px] text-purple-700 italic">
                      Formula: Equity = Total Assets - Total Liabilities
                    </div>
                    <div className="flex justify-between pt-6 text-sm font-black text-purple-900">
                      <span>Total Equity</span>
                      <span>${simOwnerEquity.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              TAB 2: DOUBLE-ENTRY & T-ACCOUNTS
          ══════════════════════════════════════════════════════════════════════ */}
          {activeTab === "taccounts" && (
            <div className="bg-white p-6 sm:p-8 rounded-b-2xl shadow-sm border border-gray-100 space-y-8">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  The Double-Entry System & T-Accounts
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Every business event affects at least two accounts: one with a **Debit** (Dr, Left side) and one with an
                  equal **Credit** (Cr, Right side).
                </p>
              </div>

              {/* The Famous DEALER Rule Banner */}
              <div className="bg-gray-900 text-white p-5 rounded-2xl shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                    The Universal Memory Key: &ldquo;DEALER&rdquo;
                  </span>
                  <span className="text-xs font-medium text-gray-400">Dr. (Left) = Cr. (Right)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-blue-900/60 border border-blue-500/40">
                    <div className="text-base font-black text-blue-300">D</div>
                    <div className="font-bold text-white">Dividends</div>
                    <div className="text-[10px] text-blue-200 font-semibold mt-1">↑ Debit (Dr)</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-900/60 border border-blue-500/40">
                    <div className="text-base font-black text-blue-300">E</div>
                    <div className="font-bold text-white">Expenses</div>
                    <div className="text-[10px] text-blue-200 font-semibold mt-1">↑ Debit (Dr)</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-900/60 border border-blue-500/40">
                    <div className="text-base font-black text-blue-300">A</div>
                    <div className="font-bold text-white">Assets</div>
                    <div className="text-[10px] text-blue-200 font-semibold mt-1">↑ Debit (Dr)</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-900/60 border border-purple-500/40">
                    <div className="text-base font-black text-purple-300">L</div>
                    <div className="font-bold text-white">Liabilities</div>
                    <div className="text-[10px] text-purple-200 font-semibold mt-1">↑ Credit (Cr)</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-900/60 border border-purple-500/40">
                    <div className="text-base font-black text-purple-300">E</div>
                    <div className="font-bold text-white">Equity</div>
                    <div className="text-[10px] text-purple-200 font-semibold mt-1">↑ Credit (Cr)</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-900/60 border border-purple-500/40">
                    <div className="text-base font-black text-purple-300">R</div>
                    <div className="font-bold text-white">Revenue</div>
                    <div className="text-[10px] text-purple-200 font-semibold mt-1">↑ Credit (Cr)</div>
                  </div>
                </div>
              </div>

              {/* Transactions Timeline & Live Journal Entry */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Transaction List */}
                <div className="lg:col-span-1 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Chronological Business Events ({transactions.length})
                  </div>
                  <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                    {transactions.map((tx) => {
                      const isSel = selectedTx?.id === tx.id;
                      return (
                        <button
                          key={tx.id}
                          onClick={() => setSelectedTx(tx)}
                          className={`w-full text-left p-3 rounded-xl border text-xs transition cursor-pointer ${
                            isSel
                              ? "bg-emerald-50 border-emerald-500 shadow-xs font-semibold text-emerald-950"
                              : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-700"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-gray-900">{tx.date}</span>
                            <span className="font-black text-emerald-600">${tx.amount.toLocaleString()}</span>
                          </div>
                          <div className="line-clamp-1">{tx.description}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Right: Selected Transaction Journal Entry */}
                <div className="lg:col-span-2 bg-gray-50 rounded-2xl p-5 border border-gray-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-black uppercase tracking-widest text-gray-500">
                        General Journal Entry Viewer
                      </span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
                        {selectedTx?.date}
                      </span>
                    </div>

                    {selectedTx ? (
                      <div className="space-y-4">
                        <div className="text-sm font-bold text-gray-900">{selectedTx.description}</div>

                        {/* Standard Accounting Journal Table */}
                        <div className="overflow-x-auto bg-white rounded-xl border border-gray-200 shadow-xs">
                          <table className="w-full text-xs text-left">
                            <thead className="bg-gray-100 border-b border-gray-200 font-bold text-gray-700">
                              <tr>
                                <th className="p-3">Account Title & Explanation</th>
                                <th className="p-3 text-right">Debit (Dr)</th>
                                <th className="p-3 text-right">Credit (Cr)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-mono">
                              <tr>
                                <td className="p-3 font-semibold text-blue-900">
                                  {MASTER_ACCOUNTS.find((a) => a.id === selectedTx.debitAccount)?.name} (Asset / Expense)
                                </td>
                                <td className="p-3 text-right font-bold text-blue-700">
                                  ${selectedTx.amount.toLocaleString()}
                                </td>
                                <td className="p-3 text-right text-gray-400">—</td>
                              </tr>
                              <tr>
                                <td className="p-3 pl-8 font-semibold text-purple-900">
                                  {MASTER_ACCOUNTS.find((a) => a.id === selectedTx.creditAccount)?.name} (Liab / Equity / Rev)
                                </td>
                                <td className="p-3 text-right text-gray-400">—</td>
                                <td className="p-3 text-right font-bold text-purple-700">
                                  ${selectedTx.amount.toLocaleString()}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>

                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-medium">
                          💡 <strong>Accounting Logic:</strong> {selectedTx.explanation}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">Select a transaction on the left to inspect its entry.</div>
                    )}
                  </div>

                  {/* Add Custom Transaction Form */}
                  <form onSubmit={handleAddCustomTransaction} className="mt-4 pt-4 border-t border-gray-200">
                    <div className="text-xs font-bold text-gray-700 mb-2">Record a Custom Transaction:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                      <input
                        type="text"
                        placeholder="Description (e.g. Paid Internet)"
                        value={customDesc}
                        onChange={(e) => setCustomDesc(e.target.value)}
                        className="p-2 border rounded-lg bg-white sm:col-span-1"
                      />
                      <select
                        value={customDebit}
                        onChange={(e) => setCustomDebit(e.target.value)}
                        className="p-2 border rounded-lg bg-white"
                      >
                        {MASTER_ACCOUNTS.map((a) => (
                          <option key={a.id} value={a.id}>
                            Dr: {a.name}
                          </option>
                        ))}
                      </select>
                      <select
                        value={customCredit}
                        onChange={(e) => setCustomCredit(e.target.value)}
                        className="p-2 border rounded-lg bg-white"
                      >
                        {MASTER_ACCOUNTS.map((a) => (
                          <option key={a.id} value={a.id}>
                            Cr: {a.name}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-1.5">
                        <input
                          type="number"
                          placeholder="$"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(Number(e.target.value))}
                          className="w-20 p-2 border rounded-lg bg-white"
                        />
                        <button
                          type="submit"
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg px-3 transition cursor-pointer"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Visual T-Accounts Ledger Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-gray-900">
                    General Ledger T-Accounts (Postings & Ending Balances)
                  </div>
                  <div className="text-xs font-bold text-gray-600">
                    Total Debits:{" "}
                    <span className="text-emerald-600 font-mono">${totalAllDebits.toLocaleString()}</span> | Total
                    Credits: <span className="text-emerald-600 font-mono">${totalAllCredits.toLocaleString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {MASTER_ACCOUNTS.map((acc) => {
                    const data = tAccountData[acc.id];
                    if (!data || data.entries.length === 0) return null;

                    const debitEntries = data.entries.filter((e) => e.type === "debit");
                    const creditEntries = data.entries.filter((e) => e.type === "credit");

                    return (
                      <div
                        key={acc.id}
                        className="bg-white rounded-xl border-2 border-gray-300 p-3 shadow-xs hover:border-emerald-500 transition"
                      >
                        {/* T-Account Header */}
                        <div className="text-center pb-2 border-b-2 border-gray-900">
                          <div className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center justify-center gap-1">
                            <span>{acc.icon}</span>
                            <span>{acc.name}</span>
                          </div>
                          <div className="text-[10px] text-gray-500 font-medium">
                            Normal Balance: {acc.normalBalance.toUpperCase()} ({acc.category})
                          </div>
                        </div>

                        {/* T Split (Left Dr, Right Cr) */}
                        <div className="grid grid-cols-2 divide-x-2 divide-gray-900 min-h-[90px] text-xs font-mono py-1">
                          {/* Debit Column (Left) */}
                          <div className="pr-2 space-y-1">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                              Debit (Dr)
                            </div>
                            {debitEntries.map((e, idx) => (
                              <div key={idx} className="flex justify-between text-blue-700 text-[11px]">
                                <span className="text-[9px] text-gray-400 font-sans truncate max-w-[60px]">
                                  {e.ref}
                                </span>
                                <span>${e.amount.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>

                          {/* Credit Column (Right) */}
                          <div className="pl-2 space-y-1">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">
                              Credit (Cr)
                            </div>
                            {creditEntries.map((e, idx) => (
                              <div key={idx} className="flex justify-between text-purple-700 text-[11px]">
                                <span className="text-[9px] text-gray-400 font-sans truncate max-w-[60px]">
                                  {e.ref}
                                </span>
                                <span>${e.amount.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Ending Balance Footer */}
                        <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center text-xs">
                          <span className="font-bold text-gray-600">Ending Balance:</span>
                          <span
                            className={`font-black font-mono px-2 py-0.5 rounded ${
                              data.netBalance >= 0
                                ? "bg-emerald-100 text-emerald-900"
                                : "bg-red-100 text-red-900"
                            }`}
                          >
                            ${Math.abs(data.netBalance).toLocaleString()}{" "}
                            {data.netBalance >= 0 ? acc.normalBalance.toUpperCase() : "DEFICIT"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              TAB 3: WORKSHEET & BALANCE SHEET
          ══════════════════════════════════════════════════════════════════════ */}
          {activeTab === "worksheet" && (
            <div className="bg-white p-6 sm:p-8 rounded-b-2xl shadow-sm border border-gray-100 space-y-8">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Preparing the Accounting Worksheet & Balance Sheet
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  At the end of an accounting period, accountants build a multi-column worksheet to adjust entries,
                  determine **Net Profit**, and guarantee that the final **Balance Sheet** balances.
                </p>
              </div>

              {/* Interactive Period-End Adjustment Toggles */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Toggle Period-End Adjusting Entries (Accruals & Deferrals):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <label className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-emerald-200 cursor-pointer hover:bg-emerald-50/30 transition">
                    <input
                      type="checkbox"
                      checked={depreciateEquip}
                      onChange={(e) => setDepreciateEquip(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <div>
                      <div className="font-bold text-gray-900">Depreciation on Gear ($400)</div>
                      <div className="text-[11px] text-gray-500">Dr. Depr Expense / Cr. Acc. Depr</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-emerald-200 cursor-pointer hover:bg-emerald-50/30 transition">
                    <input
                      type="checkbox"
                      checked={accruedSalaries}
                      onChange={(e) => setAccruedSalaries(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <div>
                      <div className="font-bold text-gray-900">Accrue Unpaid Salaries ($500)</div>
                      <div className="text-[11px] text-gray-500">Dr. Salary Expense / Cr. Salaries Payable</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-emerald-200 cursor-pointer hover:bg-emerald-50/30 transition">
                    <input
                      type="checkbox"
                      checked={suppliesUsed}
                      onChange={(e) => setSuppliesUsed(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                    />
                    <div>
                      <div className="font-bold text-gray-900">Count Supplies Used Up ($200)</div>
                      <div className="text-[11px] text-gray-500">Dr. Supplies Expense / Cr. Office Supplies</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* The Multi-Column Accounting Worksheet */}
              <div className="overflow-x-auto border border-gray-200 rounded-2xl shadow-xs">
                <table className="w-full text-xs text-left divide-y divide-gray-200">
                  <thead className="bg-gray-100 font-bold text-gray-700">
                    <tr>
                      <th rowSpan={2} className="p-3 border-r border-gray-200">
                        Account Title
                      </th>
                      <th colSpan={2} className="p-2 text-center border-r border-gray-200 bg-gray-200/70">
                        Adjusted Trial Balance
                      </th>
                      <th colSpan={2} className="p-2 text-center border-r border-gray-200 bg-amber-100/70 text-amber-900">
                        Income Statement (P&amp;L)
                      </th>
                      <th colSpan={2} className="p-2 text-center bg-blue-100/70 text-blue-900">
                        Balance Sheet
                      </th>
                    </tr>
                    <tr className="border-t border-gray-200 text-[11px]">
                      <th className="p-2 text-right border-r border-gray-200">Dr</th>
                      <th className="p-2 text-right border-r border-gray-200">Cr</th>
                      <th className="p-2 text-right border-r border-gray-200">Dr (Expense)</th>
                      <th className="p-2 text-right border-r border-gray-200">Cr (Revenue)</th>
                      <th className="p-2 text-right border-r border-gray-200">Dr (Assets)</th>
                      <th className="p-2 text-right">Cr (Liab/Eq)</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100 font-mono bg-white">
                    {worksheetRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="p-2.5 font-sans font-semibold text-gray-900 border-r border-gray-100">
                          {row.account}
                        </td>
                        <td className="p-2.5 text-right border-r border-gray-100 text-blue-700">
                          {row.adjDr > 0 ? `$${row.adjDr.toLocaleString()}` : "—"}
                        </td>
                        <td className="p-2.5 text-right border-r border-gray-100 text-purple-700">
                          {row.adjCr > 0 ? `$${row.adjCr.toLocaleString()}` : "—"}
                        </td>
                        <td className="p-2.5 text-right border-r border-gray-100 text-red-600 bg-amber-50/30">
                          {row.isDr > 0 ? `$${row.isDr.toLocaleString()}` : "—"}
                        </td>
                        <td className="p-2.5 text-right border-r border-gray-100 text-emerald-700 bg-amber-50/30">
                          {row.isCr > 0 ? `$${row.isCr.toLocaleString()}` : "—"}
                        </td>
                        <td className="p-2.5 text-right border-r border-gray-100 text-blue-800 bg-blue-50/30">
                          {row.bsDr > 0 ? `$${row.bsDr.toLocaleString()}` : "—"}
                        </td>
                        <td className="p-2.5 text-right text-purple-800 bg-blue-50/30">
                          {row.bsCr > 0 ? `$${row.bsCr.toLocaleString()}` : "—"}
                        </td>
                      </tr>
                    ))}

                    {/* Net Income Transfer Row */}
                    <tr className="bg-emerald-50/80 font-bold border-t-2 border-emerald-400">
                      <td className="p-2.5 font-sans text-emerald-950">
                        Net Income (Profit transferred to Equity) 🚀
                      </td>
                      <td className="p-2.5 text-right border-r border-gray-200">—</td>
                      <td className="p-2.5 text-right border-r border-gray-200">—</td>
                      <td className="p-2.5 text-right border-r border-gray-200 text-emerald-900">
                        ${netIncome.toLocaleString()}
                      </td>
                      <td className="p-2.5 text-right border-r border-gray-200">—</td>
                      <td className="p-2.5 text-right border-r border-gray-200">—</td>
                      <td className="p-2.5 text-right text-emerald-900">${netIncome.toLocaleString()}</td>
                    </tr>

                    {/* Grand Totals Balancing Check Row */}
                    <tr className="bg-gray-100 font-black text-gray-900 border-t-2 border-gray-400">
                      <td className="p-3 font-sans">Final Balanced Columns</td>
                      <td className="p-3 text-right border-r border-gray-200 text-blue-900">
                        ${worksheetRows.reduce((s, r) => s + r.adjDr, 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-right border-r border-gray-200 text-purple-900">
                        ${worksheetRows.reduce((s, r) => s + r.adjCr, 0).toLocaleString()}
                      </td>
                      <td className="p-3 text-right border-r border-gray-200 text-gray-700">
                        ${totalISRevenue.toLocaleString()}
                      </td>
                      <td className="p-3 text-right border-r border-gray-200 text-gray-700">
                        ${totalISRevenue.toLocaleString()}
                      </td>
                      <td className="p-3 text-right border-r border-gray-200 text-blue-900">
                        ${totalBSAssets.toLocaleString()}
                      </td>
                      <td className="p-3 text-right text-purple-900">
                        ${endingEquityWithProfit.toLocaleString()}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Live Balance Sheet Verification Callout */}
              <div
                className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
                  isSheetBalanced ? "bg-emerald-50 border-emerald-300" : "bg-red-50 border-red-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{isSheetBalanced ? "🎉" : "⚠️"}</span>
                  <div>
                    <div className="font-extrabold text-sm text-gray-900">
                      {isSheetBalanced ? "Balance Sheet is 100% Equal & Verified!" : "Worksheet is Out of Balance!"}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Total Assets: <strong>${totalBSAssets.toLocaleString()}</strong> = Total Liabilities &amp; Ending
                      Equity: <strong>${endingEquityWithProfit.toLocaleString()}</strong>
                    </div>
                  </div>
                </div>
                <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white shadow-xs text-emerald-800 border border-emerald-200">
                  Net Profit: +${netIncome.toLocaleString()}
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              TAB 4: FORENSICS & HISTORICAL FACTS
          ══════════════════════════════════════════════════════════════════════ */}
          {activeTab === "facts" && (
            <div className="bg-white p-6 sm:p-8 rounded-b-2xl shadow-sm border border-gray-100 space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Fascinating Accounting Secrets & History
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Accounting isn&apos;t just bookkeeping — it transformed civilizations and created forensic tools used by
                  the FBI today!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Fact 1 */}
                <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎨</span>
                    <h4 className="font-bold text-gray-900 text-sm">Luca Pacioli & Leonardo da Vinci</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    The &ldquo;Father of Accounting&rdquo;, Franciscan friar Luca Pacioli, published the first treatise
                    on double-entry bookkeeping in Venice in 1494 (*Summa de Arithmetica*). His close friend and roommate,{" "}
                    <strong>Leonardo da Vinci</strong>, was so inspired by Pacioli that he hand-drew the geometrical
                    illustrations for Pacioli&apos;s subsequent book!
                  </p>
                </div>

                {/* Fact 2 */}
                <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🕵️‍♂️</span>
                    <h4 className="font-bold text-gray-900 text-sm">Benford&apos;s Law & Forensic Fraud Catching</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    In natural financial ledgers, numbers starting with the digit &ldquo;1&rdquo; occur{" "}
                    <strong>30.1%</strong> of the time, while &ldquo;9&rdquo; occurs only <strong>4.6%</strong> of the
                    time! When human fraudsters invent fake numbers, they distribute digits uniformly. Forensic
                    accountants use this mathematical anomaly to expose multi-million dollar fraud cases.
                  </p>
                </div>

                {/* Fact 3 */}
                <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🏛️</span>
                    <h4 className="font-bold text-gray-900 text-sm">The Medici Bank & The Renaissance</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    The Italian Renaissance was financed by the Medici Bank, which perfected double-entry bookkeeping
                    and invented international bills of exchange. This allowed merchants to travel across Europe without
                    carrying sacks of heavy gold coins, virtually eliminating highway robbery of trade shipments.
                  </p>
                </div>

                {/* Fact 4 */}
                <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">📜</span>
                    <h4 className="font-bold text-gray-900 text-sm">Why &ldquo;Debit&rdquo; (Dr) and &ldquo;Credit&rdquo; (Cr)?</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    They come directly from Latin: <strong>Debere</strong> (&ldquo;he owes&rdquo; or &ldquo;what is
                    owed to us&rdquo;) and <strong>Credere</strong> (&ldquo;he trusts&rdquo; or &ldquo;what is
                    entrusted to us by creditors and investors&rdquo;). This is why Dr. and Cr. are abbreviated with an
                    &apos;r&apos; from their Latin roots!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              TAB 5: KNOWLEDGE QUIZ
          ══════════════════════════════════════════════════════════════════════ */}
          {activeTab === "quiz" && (
            <div className="bg-white p-6 sm:p-8 rounded-b-2xl shadow-sm border border-gray-100 space-y-6">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  Accounting & Double-Entry Mastery Quiz
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Test your understanding of the golden equation, the DEALER rule, and worksheet balancing.
                </p>
              </div>

              <div className="space-y-6">
                {quizQuestions.map((q) => {
                  const selected = answers[q.id];
                  const isSubmitted = quizScore !== null;
                  const isCorrect = selected === q.correct;

                  return (
                    <div
                      key={q.id}
                      className={`p-5 rounded-2xl border transition ${
                        isSubmitted
                          ? isCorrect
                            ? "bg-green-50/50 border-green-200"
                            : "bg-red-50/50 border-red-200"
                          : "bg-gray-50/50 border-gray-200"
                      }`}
                    >
                      <div className="font-bold text-sm sm:text-base text-gray-900 mb-3">
                        {q.id}. {q.question}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt) => {
                          const isOptionSelected = selected === opt;
                          let btnStyle =
                            "bg-white border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300";

                          if (isSubmitted) {
                            if (opt === q.correct) {
                              btnStyle = "bg-green-600 text-white border-green-600 font-bold";
                            } else if (isOptionSelected) {
                              btnStyle = "bg-red-500 text-white border-red-500";
                            } else {
                              btnStyle = "bg-white text-gray-400 border-gray-100 opacity-60";
                            }
                          } else if (isOptionSelected) {
                            btnStyle = "bg-emerald-600 text-white border-emerald-600 font-bold shadow-xs";
                          }

                          return (
                            <button
                              key={opt}
                              disabled={isSubmitted}
                              onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                              className={`p-3 rounded-xl border text-xs text-left transition cursor-pointer ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {isSubmitted && (
                        <div
                          className={`mt-3 text-xs p-3 rounded-xl ${
                            isCorrect ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"
                          }`}
                        >
                          <strong>{isCorrect ? "✓ Correct!" : "✗ Explanation:"}</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                  {quizScore !== null ? (
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-gray-900">
                        Score: {quizScore} / {quizQuestions.length}
                      </span>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        {quizScore === quizQuestions.length ? "🌟 Perfect Ledger Master!" : "Great Practice!"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500">
                      Answer all 5 questions to verify your accounting knowledge.
                    </span>
                  )}

                  <div className="flex gap-2">
                    {quizScore !== null && (
                      <button
                        onClick={() => {
                          setQuizScore(null);
                          setAnswers({});
                        }}
                        className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs transition cursor-pointer"
                      >
                        Retry Quiz
                      </button>
                    )}
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={Object.keys(answers).length < quizQuestions.length || quizScore !== null}
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs shadow-sm transition cursor-pointer"
                    >
                      Submit Quiz &amp; Save Points
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
