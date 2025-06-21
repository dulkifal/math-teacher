import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "Missing userId" });
    try {
      const userScore = await prisma.userScore.findUnique({
        where: { userId: String(userId) },
      });
      return res.status(200).json({ score: userScore?.score ?? 0 });
    } catch (error) {
      console.error("GET /api/score error:", error);
      return res.status(500).json({ error: "Database error" });
    }
  } else if (req.method === "POST") {
    const { userId, score } = req.body;
    if (!userId) return res.status(400).json({ error: "Missing userId" });
    try {
      const updated = await prisma.userScore.upsert({
        where: { userId },
        update: { score },
        create: { userId, score },
      });
      return res.status(200).json({ score: updated.score });
    } catch (error) {
      console.error("POST /api/score error:", error);
      return res.status(500).json({ error: "Database error" });
    }
  } else {
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}