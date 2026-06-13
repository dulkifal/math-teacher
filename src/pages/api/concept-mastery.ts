import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

/**
 * GET  /api/concept-mastery?userId=xxx            — Get all concept mastery records for a user
 * POST /api/concept-mastery                       — Upsert a concept mastery record and log answer history
 *
 * POST body: {
 *   userId: string,
 *   conceptId: string,       // e.g. "cube_root_basic", "addition_carrying"
 *   questionId: string,      // unique ID of the question asked
 *   isCorrect: boolean,
 *   timeSpentMs?: number     // optional milliseconds taken to answer
 * }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    try {
      const mastery = await prisma.conceptMastery.findMany({
        where: { userId: String(userId) },
        orderBy: { updatedAt: "desc" },
      });
      return res.status(200).json({ mastery });
    } catch (error) {
      console.error("GET /api/concept-mastery error:", error);
      return res.status(500).json({ error: "Database error" });
    }
  }

  if (req.method === "POST") {
    const { userId, conceptId, questionId, isCorrect, timeSpentMs } = req.body;
    if (!userId || !conceptId || !questionId || isCorrect === undefined) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    try {
      // Log the individual answer
      await prisma.answerHistory.create({
        data: {
          userId,
          conceptId,
          questionId,
          isCorrect,
          timeSpentMs: timeSpentMs ?? null,
        },
      });

      // Adaptive proficiency update:
      // Correct answer → +10 proficiency points (max 100)
      // Wrong answer   → -5 proficiency points (min 0)
      const delta = isCorrect ? 10 : -5;

      const existing = await prisma.conceptMastery.findUnique({
        where: { userId_conceptId: { userId, conceptId } },
      });

      const currentProficiency = existing?.proficiency ?? 50; // start at 50%
      const newProficiency = Math.max(0, Math.min(100, currentProficiency + delta));

      const updated = await prisma.conceptMastery.upsert({
        where: { userId_conceptId: { userId, conceptId } },
        update: { proficiency: newProficiency },
        create: { userId, conceptId, proficiency: newProficiency },
      });

      return res.status(200).json({
        proficiency: updated.proficiency,
        delta,
        mastered: updated.proficiency >= 80,
      });
    } catch (error) {
      console.error("POST /api/concept-mastery error:", error);
      return res.status(500).json({ error: "Database error" });
    }
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
