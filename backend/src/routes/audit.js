import { Router } from "express";
import pool from "../db/pool.js";

const router = Router();

router.get("/", async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM audit_log ORDER BY action_time DESC, log_id DESC");
  res.json(rows);
});

export default router;
