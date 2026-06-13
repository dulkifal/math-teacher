import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isYesterday(date: Date, today: Date) {
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return isSameDay(date, yesterday);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", ["GET", "POST", "OPTIONS"]);
    return res.status(200).end();
  }

  if (req.method === "GET") {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "Missing userId" });
    try {
      const userScore = await prisma.userScore.findUnique({
        where: { userId: String(userId) },
      });
      return res.status(200).json({
        score: userScore?.score ?? 0,
        currentStreak: userScore?.currentStreak ?? 0,
        highestStreak: userScore?.highestStreak ?? 0,
        lastActivityAt: userScore?.lastActivityAt ?? null,
      });
    } catch (error) {
      console.error("GET /api/score error:", error);
      return res.status(500).json({ error: "Database error" });
    }
  } else if (req.method === "POST") {
    const { userId, score } = req.body;
    if (!userId) return res.status(400).json({ error: "Missing userId" });
    try {
      const today = new Date();
      const existing = await prisma.userScore.findUnique({ where: { userId } });

      let currentStreak = existing?.currentStreak ?? 0;
      let highestStreak = existing?.highestStreak ?? 0;
      const lastActivity = existing?.lastActivityAt;

      if (lastActivity) {
        if (isSameDay(lastActivity, today)) {
          // Already active today — keep streak as-is
        } else if (isYesterday(lastActivity, today)) {
          // Active yesterday — extend streak
          currentStreak += 1;
        } else {
          // Streak broken — reset
          currentStreak = 1;
        }
      } else {
        // First activity ever
        currentStreak = 1;
      }

      if (currentStreak > highestStreak) highestStreak = currentStreak;

      const updated = await prisma.userScore.upsert({
        where: { userId },
        update: { score, currentStreak, highestStreak, lastActivityAt: today },
        create: { userId, score, currentStreak, highestStreak, lastActivityAt: today },
      });

      return res.status(200).json({
        score: updated.score,
        currentStreak: updated.currentStreak,
        highestStreak: updated.highestStreak,
      });
    } catch (error) {
      console.error("POST /api/score error:", error);
      return res.status(500).json({ error: "Database error" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "OPTIONS"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}