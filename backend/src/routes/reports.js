import { Router } from "express";
import pool from "../db/pool.js";

const router = Router();

router.get("/", async (_req, res) => {
  const [mostCommonSkills] = await pool.query(
    `SELECT s.skill_name, COUNT(*) AS usage_count
     FROM user_skills us
     JOIN skills s ON us.skill_id = s.skill_id
     GROUP BY s.skill_id, s.skill_name
     ORDER BY usage_count DESC, s.skill_name ASC`
  );

  const [avgProficiencyByDept] = await pool.query(
    `SELECT u.department, AVG(us.proficiency_score) AS avg_proficiency
     FROM users u
     JOIN user_skills us ON u.user_id = us.user_id
     GROUP BY u.department
     HAVING AVG(us.proficiency_score) >= 6
     ORDER BY avg_proficiency DESC`
  );

  const [topSearchedTerms] = await pool.query(
    `SELECT query_text, COUNT(*) AS search_count, MAX(search_time) AS last_searched
     FROM search_queries
     GROUP BY query_text
     ORDER BY search_count DESC, last_searched DESC
     LIMIT 10`
  );

  const [projectsPerUser] = await pool.query(
    `SELECT u.user_id, u.full_name, COUNT(p.project_id) AS project_count
     FROM users u
     LEFT JOIN projects p ON u.user_id = p.user_id
     GROUP BY u.user_id, u.full_name
     ORDER BY project_count DESC, u.full_name`
  );

  const [topMatchingUsers] = await pool.query(
    `SELECT
      u.user_id,
      u.full_name,
      SUM(sr.match_score) AS cumulative_match_score,
      COUNT(*) AS appearances
     FROM search_results sr
     JOIN users u ON sr.matched_user_id = u.user_id
     GROUP BY u.user_id, u.full_name
     ORDER BY cumulative_match_score DESC
     LIMIT 10`
  );

  const [aboveAverageProfiles] = await pool.query(
    `SELECT u.user_id, u.full_name, GetTotalSkillScore(u.user_id) AS total_skill_score
     FROM users u
     WHERE GetTotalSkillScore(u.user_id) > (
       SELECT AVG(user_total)
       FROM (
         SELECT GetTotalSkillScore(user_id) AS user_total
         FROM users
       ) avg_table
     )
     ORDER BY total_skill_score DESC`
  );

  const [usersMoreThanAvgSkills] = await pool.query(
    `SELECT u.user_id, u.full_name, COUNT(us.skill_id) AS skill_count
     FROM users u
     JOIN user_skills us ON u.user_id = us.user_id
     GROUP BY u.user_id, u.full_name
     HAVING skill_count > (
       SELECT AVG(skill_counts.skill_count)
       FROM (
         SELECT COUNT(*) AS skill_count
         FROM user_skills
         GROUP BY user_id
       ) skill_counts
     )
     ORDER BY skill_count DESC`
  );

  const [topSearchedDomainsProjects] = await pool.query(
    `SELECT p.project_id, p.project_title, p.domain
     FROM projects p
     WHERE LOWER(p.domain) IN (
       SELECT LOWER(top_terms.query_text)
       FROM (
         SELECT query_text, COUNT(*) AS c
         FROM search_queries
         GROUP BY query_text
         ORDER BY c DESC
         LIMIT 5
       ) top_terms
     )`
  );

  const [highestTotalSkillProfiles] = await pool.query(
    `SELECT *
     FROM user_skill_summary
     WHERE total_skill_score = (SELECT MAX(total_skill_score) FROM user_skill_summary)`
  );

  const [views_userSkillSummary] = await pool.query("SELECT * FROM user_skill_summary ORDER BY total_skill_score DESC");
  const [views_projectOverview] = await pool.query("SELECT * FROM project_overview ORDER BY created_at DESC");
  const [views_topProfileScores] = await pool.query("SELECT * FROM top_profile_scores");

  res.json({
    mostCommonSkills,
    avgProficiencyByDept,
    topSearchedTerms,
    projectsPerUser,
    topMatchingUsers,
    aboveAverageProfiles,
    usersMoreThanAvgSkills,
    topSearchedDomainsProjects,
    highestTotalSkillProfiles,
    views: {
      userSkillSummary: views_userSkillSummary,
      projectOverview: views_projectOverview,
      topProfileScores: views_topProfileScores
    }
  });
});

export default router;
