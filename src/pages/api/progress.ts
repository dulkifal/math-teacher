import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("API /api/progress called, method:", req.method, "body:", req.body);
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", ["GET", "POST", "OPTIONS"]);
    return res.status(200).end();
  }

  if (req.method === "GET") {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    try {
      const progressList = await prisma.userProgress.findMany({
        where: { userId: String(userId) },
      });

      const quizAttempts = await prisma.quizAttempt.findMany({
        where: { userId: String(userId) },
        orderBy: { createdAt: "desc" },
      });

      return res.status(200).json({
        completedLessons: progressList.map((p) => p.lessonId),
        quizAttempts,
      });
    } catch (error: unknown) {
      console.error("GET /api/progress error:", error);
      const message = error instanceof Error ? error.message : String(error);
      return res.status(500).json({ error: message });
    }
  } else if (req.method === "POST") {
    const { userId, lessonId, action, topic, score, total } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "Missing userId" });
    }

    try {
      if (action === "complete_lesson") {
        if (!lessonId) {
          return res.status(400).json({ error: "Missing lessonId for completing lesson" });
        }
        const progress = await prisma.userProgress.upsert({
          where: {
            userId_lessonId: {
              userId,
              lessonId,
            },
          },
          update: { completed: true },
          create: { userId, lessonId, completed: true },
        });
        return res.status(200).json({ success: true, progress });
      } else if (action === "submit_quiz" || action === "quiz_attempt") {
        if (!topic || score === undefined || total === undefined) {
          return res.status(400).json({ error: "Missing topic, score, or total for quiz submission" });
        }
        const attempt = await prisma.quizAttempt.create({
          data: {
            userId,
            topic,
            score: Number(score),
            total: Number(total),
          },
        });
        return res.status(200).json({ success: true, attempt });
      } else {
        return res.status(400).json({ error: "Invalid action" });
      }
    } catch (error: unknown) {
      console.error("POST /api/progress error:", error);
      const message = error instanceof Error ? error.message : String(error);
      return res.status(500).json({ error: message });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST", "OPTIONS"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
