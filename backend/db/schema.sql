DROP DATABASE IF EXISTS skillmatch_db;
CREATE DATABASE skillmatch_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE skillmatch_db;

CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  department VARCHAR(100) NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  short_bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE skills (
  skill_id INT AUTO_INCREMENT PRIMARY KEY,
  skill_name VARCHAR(100) NOT NULL UNIQUE,
  category VARCHAR(80) NOT NULL
);

CREATE TABLE user_skills (
  user_skill_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  skill_id INT NOT NULL,
  proficiency_score TINYINT NOT NULL CHECK (proficiency_score BETWEEN 1 AND 10),
  CONSTRAINT fk_user_skills_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_user_skills_skill FOREIGN KEY (skill_id) REFERENCES skills(skill_id) ON DELETE CASCADE,
  CONSTRAINT uq_user_skill UNIQUE (user_id, skill_id)
);

CREATE TABLE projects (
  project_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  project_title VARCHAR(180) NOT NULL,
  domain VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  tech_stack VARCHAR(255) NOT NULL,
  github_link VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_projects_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE search_queries (
  query_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  query_text VARCHAR(255) NOT NULL,
  search_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_search_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE search_results (
  result_id INT AUTO_INCREMENT PRIMARY KEY,
  query_id INT NOT NULL,
  matched_user_id INT NULL,
  matched_project_id INT NULL,
  match_score DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_result_query FOREIGN KEY (query_id) REFERENCES search_queries(query_id) ON DELETE CASCADE,
  CONSTRAINT fk_result_user FOREIGN KEY (matched_user_id) REFERENCES users(user_id) ON DELETE SET NULL,
  CONSTRAINT fk_result_project FOREIGN KEY (matched_project_id) REFERENCES projects(project_id) ON DELETE SET NULL
);

CREATE TABLE audit_log (
  log_id INT AUTO_INCREMENT PRIMARY KEY,
  action_type VARCHAR(40) NOT NULL,
  table_name VARCHAR(60) NOT NULL,
  action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  description VARCHAR(255) NOT NULL
);

CREATE INDEX idx_skill_name ON skills(skill_name);
CREATE INDEX idx_users_department ON users(department);
CREATE INDEX idx_projects_domain ON projects(domain);
CREATE INDEX idx_search_query_text ON search_queries(query_text);
CREATE INDEX idx_user_skills_user ON user_skills(user_id);
CREATE INDEX idx_user_skills_skill ON user_skills(skill_id);

CREATE OR REPLACE VIEW user_skill_summary AS
SELECT
  u.user_id,
  u.full_name,
  u.department,
  COUNT(us.skill_id) AS total_skills,
  COALESCE(SUM(us.proficiency_score), 0) AS total_skill_score,
  COALESCE(AVG(us.proficiency_score), 0) AS avg_skill_score,
  CASE
    WHEN COUNT(us.skill_id) > 5 THEN 'Strong Profile'
    ELSE 'Developing Profile'
  END AS profile_strength
FROM users u
LEFT JOIN user_skills us ON u.user_id = us.user_id
GROUP BY u.user_id, u.full_name, u.department;

CREATE OR REPLACE VIEW project_overview AS
SELECT
  p.project_id,
  p.project_title,
  p.domain,
  p.tech_stack,
  p.created_at,
  u.user_id,
  u.full_name,
  u.department
FROM projects p
JOIN users u ON p.user_id = u.user_id;

CREATE OR REPLACE VIEW top_profile_scores AS
SELECT
  uss.user_id,
  uss.full_name,
  uss.total_skill_score,
  uss.avg_skill_score,
  CASE
    WHEN uss.total_skill_score > 20 THEN 'Highly Relevant'
    WHEN uss.total_skill_score >= 12 THEN 'Moderately Relevant'
    ELSE 'Low Match'
  END AS relevance_label
FROM user_skill_summary uss
ORDER BY uss.total_skill_score DESC;

DELIMITER $$

CREATE FUNCTION GetTotalSkillScore(p_user_id INT)
RETURNS INT
DETERMINISTIC
BEGIN
  DECLARE total_score INT;
  SELECT COALESCE(SUM(proficiency_score), 0)
  INTO total_score
  FROM user_skills
  WHERE user_id = p_user_id;
  RETURN total_score;
END $$

CREATE FUNCTION GetProjectCount(p_user_id INT)
RETURNS INT
DETERMINISTIC
BEGIN
  DECLARE project_count INT;
  SELECT COUNT(*) INTO project_count
  FROM projects
  WHERE user_id = p_user_id;
  RETURN project_count;
END $$

CREATE PROCEDURE AddNewUser(
  IN p_full_name VARCHAR(120),
  IN p_email VARCHAR(150),
  IN p_department VARCHAR(100),
  IN p_academic_year VARCHAR(20),
  IN p_short_bio TEXT
)
BEGIN
  INSERT INTO users (full_name, email, department, academic_year, short_bio)
  VALUES (p_full_name, p_email, p_department, p_academic_year, p_short_bio);

  SELECT * FROM users WHERE user_id = LAST_INSERT_ID();
END $$

CREATE PROCEDURE AssignSkillToUser(
  IN p_user_id INT,
  IN p_skill_id INT,
  IN p_proficiency_score TINYINT
)
BEGIN
  INSERT INTO user_skills (user_id, skill_id, proficiency_score)
  VALUES (p_user_id, p_skill_id, p_proficiency_score)
  ON DUPLICATE KEY UPDATE proficiency_score = VALUES(proficiency_score);

  SELECT us.user_skill_id, us.user_id, us.skill_id, us.proficiency_score, s.skill_name
  FROM user_skills us
  JOIN skills s ON us.skill_id = s.skill_id
  WHERE us.user_id = p_user_id AND us.skill_id = p_skill_id;
END $$

CREATE PROCEDURE AddProject(
  IN p_user_id INT,
  IN p_project_title VARCHAR(180),
  IN p_domain VARCHAR(100),
  IN p_description TEXT,
  IN p_tech_stack VARCHAR(255),
  IN p_github_link VARCHAR(255)
)
BEGIN
  INSERT INTO projects (user_id, project_title, domain, description, tech_stack, github_link)
  VALUES (p_user_id, p_project_title, p_domain, p_description, p_tech_stack, p_github_link);

  SELECT * FROM projects WHERE project_id = LAST_INSERT_ID();
END $$

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
END $$

CREATE TRIGGER trg_users_insert
AFTER INSERT ON users
FOR EACH ROW
BEGIN
  INSERT INTO audit_log(action_type, table_name, description)
  VALUES ('INSERT', 'users', CONCAT('New user added: ', NEW.full_name, ' (ID ', NEW.user_id, ')'));
END $$

CREATE TRIGGER trg_users_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
  INSERT INTO audit_log(action_type, table_name, description)
  VALUES ('UPDATE', 'users', CONCAT('User updated: ', NEW.full_name, ' (ID ', NEW.user_id, ')'));
END $$

CREATE TRIGGER trg_users_delete
AFTER DELETE ON users
FOR EACH ROW
BEGIN
  INSERT INTO audit_log(action_type, table_name, description)
  VALUES ('DELETE', 'users', CONCAT('User deleted: ', OLD.full_name, ' (ID ', OLD.user_id, ')'));
END $$

CREATE TRIGGER trg_user_skills_insert
AFTER INSERT ON user_skills
FOR EACH ROW
BEGIN
  INSERT INTO audit_log(action_type, table_name, description)
  VALUES ('INSERT', 'user_skills', CONCAT('Skill assigned to user ID ', NEW.user_id, ', skill ID ', NEW.skill_id, ', score ', NEW.proficiency_score));
END $$

CREATE TRIGGER trg_user_skills_update
AFTER UPDATE ON user_skills
FOR EACH ROW
BEGIN
  INSERT INTO audit_log(action_type, table_name, description)
  VALUES ('UPDATE', 'user_skills', CONCAT('Skill score updated for user ID ', NEW.user_id, ', skill ID ', NEW.skill_id, ' to ', NEW.proficiency_score));
END $$

CREATE TRIGGER trg_projects_insert
AFTER INSERT ON projects
FOR EACH ROW
BEGIN
  INSERT INTO audit_log(action_type, table_name, description)
  VALUES ('INSERT', 'projects', CONCAT('Project added: ', NEW.project_title, ' (ID ', NEW.project_id, ')'));
END $$

CREATE TRIGGER trg_projects_delete
AFTER DELETE ON projects
FOR EACH ROW
BEGIN
  INSERT INTO audit_log(action_type, table_name, description)
  VALUES ('DELETE', 'projects', CONCAT('Project deleted: ', OLD.project_title, ' (ID ', OLD.project_id, ')'));
END $$

CREATE TRIGGER trg_search_insert
AFTER INSERT ON search_queries
FOR EACH ROW
BEGIN
  INSERT INTO audit_log(action_type, table_name, description)
  VALUES ('SEARCH', 'search_queries', CONCAT('Search performed: ', NEW.query_text, ' (Query ID ', NEW.query_id, ')'));
END $$

DELIMITER ;
