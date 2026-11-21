import { PrismaClient } from "@prisma/client";

type UserScoreRecord = {
  id: number;
  userId: string;
  score: number;
  currentStreak: number;
  highestStreak: number;
  lastActivityAt: Date | null;
};

type UserProgressRecord = {
  id: string;
  userId: string;
  lessonId: string;
  completed: boolean;
  updatedAt: Date;
};

type QuizAttemptRecord = {
  id: string;
  userId: string;
  topic: string;
  score: number;
  total: number;
  createdAt: Date;
};

type ConceptMasteryRecord = {
  id: string;
  userId: string;
  conceptId: string;
  proficiency: number;
  updatedAt: Date;
};

type AnswerHistoryRecord = {
  id: string;
  userId: string;
  conceptId: string;
  questionId: string;
  isCorrect: boolean;
  timeSpentMs: number | null;
  createdAt: Date;
};

interface MockStore {
  nextId: number;
  userScores: Map<string, UserScoreRecord>;
  userProgress: Map<string, UserProgressRecord>;
  quizAttempts: QuizAttemptRecord[];
  conceptMastery: Map<string, ConceptMasteryRecord>;
  answerHistory: AnswerHistoryRecord[];
}

function createMockPrisma(store: MockStore): PrismaClient {
  const genId = (prefix: string) => `${prefix}_${Date.now()}_${store.nextId++}`;

  const mock = {
    userScore: {
      findUnique: async ({ where }: { where: { userId: string } }) => {
        return store.userScores.get(where.userId) ?? null;
      },
      upsert: async ({
        where,
        update,
        create,
      }: {
        where: { userId: string };
        update: Partial<UserScoreRecord>;
        create: Omit<UserScoreRecord, "id">;
      }) => {
        const existing = store.userScores.get(where.userId);
        if (existing) {
          const updated: UserScoreRecord = { ...existing, ...update };
          store.userScores.set(where.userId, updated);
          return updated;
        }
        const created: UserScoreRecord = {
          id: store.nextId++,
          userId: create.userId,
          score: create.score ?? 0,
          currentStreak: create.currentStreak ?? 0,
          highestStreak: create.highestStreak ?? 0,
          lastActivityAt: create.lastActivityAt ?? null,
        };
        store.userScores.set(where.userId, created);
        return created;
      },
    },
    userProgress: {
      findMany: async ({ where }: { where?: { userId?: string } } = {}) => {
        const all = Array.from(store.userProgress.values());
        if (!where?.userId) return all;
        return all.filter((item) => item.userId === where.userId);
      },
      upsert: async ({
        where,
        update,
        create,
      }: {
        where: { userId_lessonId: { userId: string; lessonId: string } };
        update: { completed?: boolean };
        create: { userId: string; lessonId: string; completed?: boolean };
      }) => {
        const key = `${where.userId_lessonId.userId}::${where.userId_lessonId.lessonId}`;
        const existing = store.userProgress.get(key);
        const now = new Date();
        if (existing) {
          const updated: UserProgressRecord = {
            ...existing,
            completed: update.completed ?? existing.completed,
            updatedAt: now,
          };
          store.userProgress.set(key, updated);
          return updated;
        }
        const created: UserProgressRecord = {
          id: genId("prog"),
          userId: create.userId,
          lessonId: create.lessonId,
          completed: create.completed ?? true,
          updatedAt: now,
        };
        store.userProgress.set(key, created);
        return created;
      },
    },
    quizAttempt: {
      findMany: async ({
        where,
        orderBy,
      }: {
        where?: { userId?: string };
        orderBy?: { createdAt?: "asc" | "desc" };
      } = {}) => {
        let items = store.quizAttempts.slice();
        if (where?.userId) {
          items = items.filter((a) => a.userId === where.userId);
        }
        if (orderBy?.createdAt === "desc") {
          items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        } else if (orderBy?.createdAt === "asc") {
          items.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        }
        return items;
      },
      create: async ({
        data,
      }: {
        data: { userId: string; topic: string; score: number; total: number };
      }) => {
        const record: QuizAttemptRecord = {
          id: genId("quiz"),
          userId: data.userId,
          topic: data.topic,
          score: data.score,
          total: data.total,
          createdAt: new Date(),
        };
        store.quizAttempts.push(record);
        return record;
      },
    },
    conceptMastery: {
      findMany: async ({
        where,
        orderBy,
      }: {
        where?: { userId?: string };
        orderBy?: { updatedAt?: "asc" | "desc" };
      } = {}) => {
        let items = Array.from(store.conceptMastery.values());
        if (where?.userId) {
          items = items.filter((m) => m.userId === where.userId);
        }
        if (orderBy?.updatedAt === "desc") {
          items.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        }
        return items;
      },
      findUnique: async ({
        where,
      }: {
        where: { userId_conceptId: { userId: string; conceptId: string } };
      }) => {
        const key = `${where.userId_conceptId.userId}::${where.userId_conceptId.conceptId}`;
        return store.conceptMastery.get(key) ?? null;
      },
      upsert: async ({
        where,
        update,
        create,
      }: {
        where: { userId_conceptId: { userId: string; conceptId: string } };
        update: { proficiency: number };
        create: { userId: string; conceptId: string; proficiency: number };
      }) => {
        const key = `${where.userId_conceptId.userId}::${where.userId_conceptId.conceptId}`;
        const existing = store.conceptMastery.get(key);
        const now = new Date();
        if (existing) {
          const updated: ConceptMasteryRecord = {
            ...existing,
            proficiency: update.proficiency,
            updatedAt: now,
          };
          store.conceptMastery.set(key, updated);
          return updated;
        }
        const created: ConceptMasteryRecord = {
          id: genId("cm"),
          userId: create.userId,
          conceptId: create.conceptId,
          proficiency: create.proficiency,
          updatedAt: now,
        };
        store.conceptMastery.set(key, created);
        return created;
      },
    },
    answerHistory: {
      create: async ({
        data,
      }: {
        data: {
          userId: string;
          conceptId: string;
          questionId: string;
          isCorrect: boolean;
          timeSpentMs?: number | null;
        };
      }) => {
        const record: AnswerHistoryRecord = {
          id: genId("ans"),
          userId: data.userId,
          conceptId: data.conceptId,
          questionId: data.questionId,
          isCorrect: data.isCorrect,
          timeSpentMs: data.timeSpentMs ?? null,
          createdAt: new Date(),
        };
        store.answerHistory.push(record);
        return record;
      },
    },
  };

  const fallbackModel = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d?: { data?: Record<string, unknown> }) => d?.data ?? {},
    update: async (d?: { data?: Record<string, unknown> }) => d?.data ?? {},
    upsert: async (d?: { create?: Record<string, unknown> }) => d?.create ?? {},
    delete: async () => ({}),
  };

  return new Proxy(mock, {
    get(target, prop: string) {
      if (prop in target) {
        return target[prop as keyof typeof target];
      }
      return fallbackModel;
    },
  }) as unknown as PrismaClient;
}

const globalForPrisma = global as unknown as {
  prisma?: PrismaClient;
  mockStore?: MockStore;
};

function initPrisma(): PrismaClient {
  if (process.env.DATABASE_URL) {
    try {
      return new PrismaClient({
        log: ["query", "error", "warn"],
        accelerateUrl: process.env.DATABASE_URL,
      });
    } catch (err) {
      console.warn("[AI Studio] Prisma initialization failed — using in-memory mock:", err);
    }
  } else {
    console.warn("[AI Studio] DATABASE_URL not set — using in-memory mock database");
  }

  if (!globalForPrisma.mockStore) {
    globalForPrisma.mockStore = {
      nextId: 1,
      userScores: new Map(),
      userProgress: new Map(),
      quizAttempts: [],
      conceptMastery: new Map(),
      answerHistory: [],
    };
  }
  return createMockPrisma(globalForPrisma.mockStore);
}

const prisma = globalForPrisma.prisma || initPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;