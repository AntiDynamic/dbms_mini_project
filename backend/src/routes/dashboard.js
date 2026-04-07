import { Router } from "express";
import pool from "../db/pool.js";

const router = Router();

router.get("/", async (_req, res) => {
  const [[usersCount]] = await pool.query("SELECT COUNT(*) AS total_users FROM users");
  const [[skillsCount]] = await pool.query("SELECT COUNT(*) AS total_skills FROM skills");
  const [[projectsCount]] = await pool.query("SELECT COUNT(*) AS total_projects FROM projects");
  const [[searchesCount]] = await pool.query("SELECT COUNT(*) AS total_searches FROM search_queries");

  const [topSkills] = await pool.query(
    `SELECT s.skill_name, COUNT(*) AS count
     FROM user_skills us
     JOIN skills s ON us.skill_id = s.skill_id
     GROUP BY s.skill_id, s.skill_name
     ORDER BY count DESC
     LIMIT 6`
  );

  const [recentActivity] = await pool.query(
    `SELECT action_type, table_name, action_time, description
     FROM audit_log
     ORDER BY action_time DESC, log_id DESC
     LIMIT 10`
  );

  res.json({
    totals: {
      users: usersCount.total_users,
      skills: skillsCount.total_skills,
      projects: projectsCount.total_projects,
      searches: searchesCount.total_searches
    },
    topSkills,
    recentActivity
  });
});

export default router;
