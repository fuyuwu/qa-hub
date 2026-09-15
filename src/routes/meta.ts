import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/tags", async (_req, res) => {
  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
  res.json(tags.map((t) => t.name));
});

router.get("/categories", async (_req, res) => {
  const rows = await prisma.question.findMany({
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });
  res.json(rows.map((r) => r.category));
});

export default router;
