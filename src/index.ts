import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import questionsRouter from "./routes/questions";
import metaRouter from "./routes/meta";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/questions", questionsRouter);
app.use("/api", metaRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`qa-hub API listening on http://localhost:${port}`);
});
