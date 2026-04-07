import { Router } from "express";
import pool from "../db/pool.js";

const router = Router();

router.get("/", async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM users ORDER BY user_id DESC");
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { full_name, email, department, academic_year, short_bio } = req.body;
  const [resultSets] = await pool.query(
    "CALL AddNewUser(?, ?, ?, ?, ?)",
    [full_name, email, department, academic_year, short_bio]
  );
  res.status(201).json(resultSets[0][0]);
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { full_name, email, department, academic_year, short_bio } = req.body;

  await pool.query(
    `UPDATE users
     SET full_name = ?, email = ?, department = ?, academic_year = ?, short_bio = ?
     WHERE user_id = ?`,
    [full_name, email, department, academic_year, short_bio, id]
  );

  const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [id]);
  res.json(rows[0]);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM users WHERE user_id = ?", [id]);
  res.json({ message: "User deleted" });
});

export default router;
