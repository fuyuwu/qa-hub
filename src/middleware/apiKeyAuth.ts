import { NextFunction, Request, Response } from "express";

export function apiKeyAuth(req: Request, res: Response, next: NextFunction) {
  const expected = process.env.API_KEY;
  if (!expected) {
    res.status(500).json({ error: "Server misconfigured: API_KEY not set" });
    return;
  }

  const provided = req.header("x-api-key");
  if (provided !== expected) {
    res.status(401).json({ error: "Invalid or missing API key" });
    return;
  }

  next();
}
