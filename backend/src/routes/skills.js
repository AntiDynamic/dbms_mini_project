import { Router } from "express";
import pool from "../db/pool.js";

const router = Router();

router.get("/", async (_req, res) => {
  const [rows] = await pool.query("SELECT * FROM skills ORDER BY skill_name");
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { skill_name, category } = req.body;
  const [result] = await pool.query(
    "INSERT INTO skills(skill_name, category) VALUES(?, ?)",
    [skill_name, category]
  );
  const [rows] = await pool.query("SELECT * FROM skills WHERE skill_id = ?", [result.insertId]);
  res.status(201).json(rows[0]);
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { skill_name, category } = req.body;
  await pool.query("UPDATE skills SET skill_name = ?, category = ? WHERE skill_id = ?", [skill_name, category, id]);
  const [rows] = await pool.query("SELECT * FROM skills WHERE skill_id = ?", [id]);
  res.json(rows[0]);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM skills WHERE skill_id = ?", [id]);
  res.json({ message: "Skill deleted" });
});

router.get("/user-mappings", async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT us.user_skill_id, us.user_id, u.full_name, us.skill_id, s.skill_name, us.proficiency_score
     FROM user_skills us
     JOIN users u ON us.user_id = u.user_id
     JOIN skills s ON us.skill_id = s.skill_id
     ORDER BY us.user_id, s.skill_name`
  );
  res.json(rows);
});

router.post("/assign", async (req, res) => {
  const { user_id, skill_id, proficiency_score } = req.body;
  const [resultSets] = await pool.query("CALL AssignSkillToUser(?, ?, ?)", [user_id, skill_id, proficiency_score]);
  res.status(201).json(resultSets[0][0]);
});

router.put("/assign/:userSkillId", async (req, res) => {
  const { userSkillId } = req.params;
  const { proficiency_score } = req.body;
  await pool.query("UPDATE user_skills SET proficiency_score = ? WHERE user_skill_id = ?", [proficiency_score, userSkillId]);
  const [rows] = await pool.query(
    `SELECT us.user_skill_id, us.user_id, u.full_name, us.skill_id, s.skill_name, us.proficiency_score
     FROM user_skills us
     JOIN users u ON us.user_id = u.user_id
     JOIN skills s ON us.skill_id = s.skill_id
     WHERE us.user_skill_id = ?`,
    [userSkillId]
  );
  res.json(rows[0]);
});

router.delete("/assign/:userSkillId", async (req, res) => {
  const { userSkillId } = req.params;
  await pool.query("DELETE FROM user_skills WHERE user_skill_id = ?", [userSkillId]);
  res.json({ message: "Skill removed from user" });
});

export default router;
