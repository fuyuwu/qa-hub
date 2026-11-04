import { Router } from "express";
import { apiKeyAuth } from "../middleware/apiKeyAuth";

const router = Router();

router.post("/verify", apiKeyAuth, (_req, res) => {
  res.status(204).end();
});

export default router;
