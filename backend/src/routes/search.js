import { Router } from "express";
import pool from "../db/pool.js";
import { normalizeKeywords } from "../services/tokenizer.js";

const router = Router();

router.post("/", async (req, res) => {
  const { user_id = null, query_text } = req.body;
  const keywords = normalizeKeywords(query_text);

  if (!query_text || keywords.length === 0) {
    return res.status(400).json({ message: "Search query is required." });
  }

  const [queryInsert] = await pool.query(
    "INSERT INTO search_queries(user_id, query_text) VALUES(?, ?)",
    [user_id, query_text]
  );

  const queryId = queryInsert.insertId;
  const keywordsJson = JSON.stringify(keywords);

  const [resultSets] = await pool.query("CALL RunSkillSearch(?, ?)", [queryId, keywordsJson]);

  const combinedResults = resultSets[0] || [];
  const userResults = combinedResults.filter((row) => row.result_type === "user");
  const projectResults = combinedResults.filter((row) => row.result_type === "project");

  res.json({
    query_id: queryId,
    query_text,
    keywords,
    users: userResults,
    projects: projectResults
  });
});

router.get("/history", async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT sq.query_id, sq.user_id, u.full_name, sq.query_text, sq.search_time
     FROM search_queries sq
     LEFT JOIN users u ON sq.user_id = u.user_id
     ORDER BY sq.search_time DESC`
  );
  res.json(rows);
});

router.get("/history/:queryId/results", async (req, res) => {
  const { queryId } = req.params;
  const [rows] = await pool.query(
    `SELECT
      sr.result_id,
      sr.query_id,
      sr.match_score,
      sr.matched_user_id,
      u.full_name,
      sr.matched_project_id,
      p.project_title
     FROM search_results sr
     LEFT JOIN users u ON sr.matched_user_id = u.user_id
     LEFT JOIN projects p ON sr.matched_project_id = p.project_id
     WHERE sr.query_id = ?
     ORDER BY sr.match_score DESC`,
    [queryId]
  );
  res.json(rows);
});

export default router;
