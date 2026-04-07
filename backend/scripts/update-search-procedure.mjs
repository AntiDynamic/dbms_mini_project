import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import mysql from "mysql2/promise";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(scriptDir, "..");

dotenv.config({ path: path.join(backendRoot, ".env") });

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "skillmatch_db"
});

const procedureSql = `
CREATE PROCEDURE RunSkillSearch(
  IN p_query_id INT,
  IN p_keywords_json JSON
)
BEGIN
  DELETE FROM search_results WHERE query_id = p_query_id;

  INSERT INTO search_results (query_id, matched_user_id, matched_project_id, match_score)
  SELECT
    p_query_id,
    u.user_id,
    NULL,
    COALESCE(skill_part.skill_score, 0) + COALESCE(project_part.domain_bonus, 0) + COALESCE(profile_part.profile_bonus, 0) AS total_score
  FROM users u
  LEFT JOIN (
    SELECT
      us.user_id,
      SUM(us.proficiency_score) AS skill_score
    FROM user_skills us
    JOIN skills s ON us.skill_id = s.skill_id
    JOIN JSON_TABLE(
      p_keywords_json,
      '$[*]' COLUMNS (keyword VARCHAR(100) PATH '$')
    ) kw ON LOWER(s.skill_name) = LOWER(kw.keyword)
    GROUP BY us.user_id
  ) skill_part ON skill_part.user_id = u.user_id
  LEFT JOIN (
    SELECT
      u2.user_id,
      COUNT(*) * 6 AS profile_bonus
    FROM users u2
    JOIN JSON_TABLE(
      p_keywords_json,
      '$[*]' COLUMNS (keyword VARCHAR(100) PATH '$')
    ) kw ON LOWER(u2.full_name) LIKE CONCAT('%', LOWER(kw.keyword), '%')
       OR LOWER(u2.department) LIKE CONCAT('%', LOWER(kw.keyword), '%')
       OR LOWER(COALESCE(u2.short_bio, '')) LIKE CONCAT('%', LOWER(kw.keyword), '%')
    GROUP BY u2.user_id
  ) profile_part ON profile_part.user_id = u.user_id
  LEFT JOIN (
    SELECT
      p.user_id,
      COUNT(*) * 2 AS domain_bonus
    FROM projects p
    JOIN JSON_TABLE(
      p_keywords_json,
      '$[*]' COLUMNS (keyword VARCHAR(100) PATH '$')
    ) kw ON LOWER(p.domain) = LOWER(kw.keyword)
       OR LOWER(p.tech_stack) LIKE CONCAT('%', LOWER(kw.keyword), '%')
    GROUP BY p.user_id
  ) project_part ON project_part.user_id = u.user_id
  WHERE COALESCE(skill_part.skill_score, 0) + COALESCE(project_part.domain_bonus, 0) + COALESCE(profile_part.profile_bonus, 0) > 0;

  INSERT INTO search_results (query_id, matched_user_id, matched_project_id, match_score)
  SELECT
    p_query_id,
    NULL,
    p.project_id,
    (CASE
      WHEN EXISTS (
        SELECT 1
        FROM JSON_TABLE(
          p_keywords_json,
          '$[*]' COLUMNS (keyword VARCHAR(100) PATH '$')
        ) kw
        WHERE LOWER(p.domain) = LOWER(kw.keyword)
      ) THEN 10
      ELSE 0
    END) +
    (
      SELECT COALESCE(COUNT(*), 0)
      FROM JSON_TABLE(
        p_keywords_json,
        '$[*]' COLUMNS (keyword VARCHAR(100) PATH '$')
      ) kw
      WHERE LOWER(p.tech_stack) LIKE CONCAT('%', LOWER(kw.keyword), '%')
    ) * 3 AS project_score
  FROM projects p
  WHERE (
    EXISTS (
      SELECT 1
      FROM JSON_TABLE(
        p_keywords_json,
        '$[*]' COLUMNS (keyword VARCHAR(100) PATH '$')
      ) kw
      WHERE LOWER(p.domain) = LOWER(kw.keyword)
    )
    OR EXISTS (
      SELECT 1
      FROM JSON_TABLE(
        p_keywords_json,
        '$[*]' COLUMNS (keyword VARCHAR(100) PATH '$')
      ) kw
      WHERE LOWER(p.tech_stack) LIKE CONCAT('%', LOWER(kw.keyword), '%')
    )
  );

  SELECT
    'user' AS result_type,
    sr.result_id,
    sr.query_id,
    sr.matched_user_id,
    u.full_name,
    u.department,
    NULL AS matched_project_id,
    NULL AS project_title,
    sr.match_score,
    CASE
      WHEN sr.match_score > 20 THEN 'Highly Relevant'
      WHEN sr.match_score >= 12 THEN 'Moderately Relevant'
      ELSE 'Low Match'
    END AS relevance_label
  FROM search_results sr
  JOIN users u ON sr.matched_user_id = u.user_id
  WHERE sr.query_id = p_query_id

  UNION ALL

  SELECT
    'project' AS result_type,
    sr.result_id,
    sr.query_id,
    NULL AS matched_user_id,
    NULL AS full_name,
    NULL AS department,
    sr.matched_project_id,
    p.project_title,
    sr.match_score,
    CASE
      WHEN sr.match_score > 14 THEN 'Highly Relevant'
      WHEN sr.match_score >= 8 THEN 'Moderately Relevant'
      ELSE 'Low Match'
    END AS relevance_label
  FROM search_results sr
  JOIN projects p ON sr.matched_project_id = p.project_id
  WHERE sr.query_id = p_query_id
  ORDER BY match_score DESC;
END`;

try {
  await connection.query("DROP PROCEDURE IF EXISTS RunSkillSearch");
  await connection.query(procedureSql);
  console.log("RunSkillSearch procedure updated successfully.");
} catch (error) {
  console.error("Failed to update RunSkillSearch procedure:");
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await connection.end();
}