import { Router } from "express";
import pool from "../db/pool.js";

const router = Router();

router.get("/", async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT p.*, u.full_name
     FROM projects p
     JOIN users u ON p.user_id = u.user_id
     ORDER BY p.project_id DESC`
  );
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { user_id, project_title, domain, description, tech_stack, github_link } = req.body;
  const [resultSets] = await pool.query(
    "CALL AddProject(?, ?, ?, ?, ?, ?)",
    [user_id, project_title, domain, description, tech_stack, github_link || null]
  );
  res.status(201).json(resultSets[0][0]);
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { user_id, project_title, domain, description, tech_stack, github_link } = req.body;
  await pool.query(
    `UPDATE projects
     SET user_id = ?, project_title = ?, domain = ?, description = ?, tech_stack = ?, github_link = ?
     WHERE project_id = ?`,
    [user_id, project_title, domain, description, tech_stack, github_link || null, id]
  );
  const [rows] = await pool.query("SELECT * FROM projects WHERE project_id = ?", [id]);
  res.json(rows[0]);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM projects WHERE project_id = ?", [id]);
  res.json({ message: "Project deleted" });
});

export default router;
