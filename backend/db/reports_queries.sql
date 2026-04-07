USE skillmatch_db;

-- JOIN queries
SELECT u.user_id, u.full_name, s.skill_name, us.proficiency_score
FROM users u
JOIN user_skills us ON u.user_id = us.user_id
JOIN skills s ON us.skill_id = s.skill_id
ORDER BY u.user_id, s.skill_name;

SELECT u.user_id, u.full_name, p.project_id, p.project_title, p.domain
FROM users u
LEFT JOIN projects p ON u.user_id = p.user_id
ORDER BY u.user_id, p.project_id;

SELECT sq.query_id, sq.query_text, sr.result_id, sr.match_score, sr.matched_user_id, sr.matched_project_id
FROM search_queries sq
JOIN search_results sr ON sq.query_id = sr.query_id
ORDER BY sq.query_id, sr.match_score DESC;

-- Aggregate queries
SELECT s.skill_name, COUNT(*) AS usage_count
FROM user_skills us
JOIN skills s ON us.skill_id = s.skill_id
GROUP BY s.skill_id, s.skill_name
ORDER BY usage_count DESC;

SELECT u.department, AVG(us.proficiency_score) AS avg_proficiency
FROM users u
JOIN user_skills us ON u.user_id = us.user_id
GROUP BY u.department
HAVING AVG(us.proficiency_score) >= 6
ORDER BY avg_proficiency DESC;

SELECT query_text, COUNT(*) AS search_count
FROM search_queries
GROUP BY query_text
ORDER BY search_count DESC;

SELECT u.user_id, u.full_name, COUNT(p.project_id) AS project_count
FROM users u
LEFT JOIN projects p ON u.user_id = p.user_id
GROUP BY u.user_id, u.full_name
ORDER BY project_count DESC;

-- Subqueries and advanced SQL
SELECT u.user_id, u.full_name, GetTotalSkillScore(u.user_id) AS total_skill_score
FROM users u
WHERE GetTotalSkillScore(u.user_id) > (
  SELECT AVG(user_total)
  FROM (
    SELECT GetTotalSkillScore(user_id) AS user_total
    FROM users
  ) t
);

SELECT u.user_id, u.full_name, COUNT(us.skill_id) AS skill_count
FROM users u
JOIN user_skills us ON u.user_id = us.user_id
GROUP BY u.user_id, u.full_name
HAVING skill_count > (
  SELECT AVG(skill_cnt)
  FROM (
    SELECT COUNT(*) AS skill_cnt
    FROM user_skills
    GROUP BY user_id
  ) x
);

SELECT *
FROM user_skill_summary
WHERE total_skill_score = (SELECT MAX(total_skill_score) FROM user_skill_summary);
