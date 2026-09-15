import { Router } from "express";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { apiKeyAuth } from "../middleware/apiKeyAuth";
import {
  createQuestionSchema,
  updateQuestionSchema,
  listQuestionsQuerySchema,
} from "../schemas/question";

const router = Router();

const questionInclude = {
  tags: { include: { tag: true } },
} satisfies Prisma.QuestionInclude;

type QuestionWithTags = Prisma.QuestionGetPayload<{ include: typeof questionInclude }>;

function serializeQuestion(q: QuestionWithTags) {
  const { tags, ...rest } = q;
  return { ...rest, tags: tags.map((t) => t.tag.name) };
}

router.get("/", async (req, res) => {
  const parsed = listQuestionsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { category, difficulty, reviewStatus, tag, q, page, pageSize } = parsed.data;

  const where: Prisma.QuestionWhereInput = {
    ...(category && { category }),
    ...(difficulty && { difficulty }),
    ...(reviewStatus && { reviewStatus }),
    ...(tag && { tags: { some: { tag: { name: tag } } } }),
    ...(q && {
      OR: [{ question: { contains: q } }, { answer: { contains: q } }],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.question.findMany({
      where,
      include: questionInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.question.count({ where }),
  ]);

  res.json({
    data: items.map(serializeQuestion),
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
});

router.get("/:id", async (req, res) => {
  const id = String(req.params.id);
  const item = await prisma.question.findUnique({
    where: { id },
    include: questionInclude,
  });
  if (!item) {
    res.status(404).json({ error: "Question not found" });
    return;
  }
  res.json(serializeQuestion(item));
});

router.post("/", apiKeyAuth, async (req, res) => {
  const parsed = createQuestionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { tags, ...data } = parsed.data;

  const created = await prisma.question.create({
    data: {
      ...data,
      tags: {
        create: tags.map((name) => ({
          tag: { connectOrCreate: { where: { name }, create: { name } } },
        })),
      },
    },
    include: questionInclude,
  });

  res.status(201).json(serializeQuestion(created));
});

router.put("/:id", apiKeyAuth, async (req, res) => {
  const parsed = updateQuestionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { tags, ...data } = parsed.data;
  const id = String(req.params.id);

  const exists = await prisma.question.findUnique({ where: { id } });
  if (!exists) {
    res.status(404).json({ error: "Question not found" });
    return;
  }

  const updated = await prisma.question.update({
    where: { id },
    data: {
      ...data,
      ...(tags !== undefined && {
        tags: {
          deleteMany: {},
          create: tags.map((name) => ({
            tag: { connectOrCreate: { where: { name }, create: { name } } },
          })),
        },
      }),
    },
    include: questionInclude,
  });

  res.json(serializeQuestion(updated));
});

router.delete("/:id", apiKeyAuth, async (req, res) => {
  const id = String(req.params.id);
  const exists = await prisma.question.findUnique({ where: { id } });
  if (!exists) {
    res.status(404).json({ error: "Question not found" });
    return;
  }
  await prisma.question.delete({ where: { id } });
  res.status(204).send();
});

export default router;
