USE skillmatch_db;

INSERT INTO skills (skill_name, category) VALUES
('Python', 'Programming'),
('Java', 'Programming'),
('C++', 'Programming'),
('DBMS', 'Database'),
('SQL', 'Database'),
('React', 'Frontend'),
('JavaScript', 'Frontend'),
('Machine Learning', 'AI/ML'),
('AI', 'AI/ML'),
('UI/UX', 'Design'),
('Flask', 'Backend'),
('Node.js', 'Backend'),
('Data Structures', 'Core CS');

CALL AddNewUser('Aarav Mehta', 'aarav.mehta@example.com', 'CSE', '3rd Year', 'Backend focused student with strong SQL and system design basics.');
CALL AddNewUser('Riya Sharma', 'riya.sharma@example.com', 'IT', '4th Year', 'Frontend developer with React and UI prototyping experience.');
CALL AddNewUser('Kabir Singh', 'kabir.singh@example.com', 'CSE', '2nd Year', 'Interested in AI and analytics projects.');
CALL AddNewUser('Ananya Patel', 'ananya.patel@example.com', 'ECE', '3rd Year', 'Works on IoT dashboards and full-stack integrations.');
CALL AddNewUser('Dev Khanna', 'dev.khanna@example.com', 'CSE', '4th Year', 'Competitive programmer with strong C++ and algorithms background.');
CALL AddNewUser('Ishita Rao', 'ishita.rao@example.com', 'IT', '3rd Year', 'Enjoys product design and frontend engineering.');
CALL AddNewUser('Rahul Verma', 'rahul.verma@example.com', 'CSE', '4th Year', 'Data engineering and database optimization enthusiast.');
CALL AddNewUser('Sneha Iyer', 'sneha.iyer@example.com', 'AI&DS', '2nd Year', 'Focused on machine learning and applied AI.');
CALL AddNewUser('Yash Kulkarni', 'yash.kulkarni@example.com', 'AI&DS', '3rd Year', 'Builds NLP and recommendation system demos.');
CALL AddNewUser('Nidhi Arora', 'nidhi.arora@example.com', 'IT', '2nd Year', 'Learning full-stack with JavaScript and Flask.');

CALL AssignSkillToUser(1, 1, 9);
CALL AssignSkillToUser(1, 4, 8);
CALL AssignSkillToUser(1, 5, 9);
CALL AssignSkillToUser(1, 12, 7);
CALL AssignSkillToUser(1, 13, 8);

CALL AssignSkillToUser(2, 6, 9);
CALL AssignSkillToUser(2, 7, 8);
CALL AssignSkillToUser(2, 10, 8);
CALL AssignSkillToUser(2, 5, 6);

CALL AssignSkillToUser(3, 1, 7);
CALL AssignSkillToUser(3, 8, 8);
CALL AssignSkillToUser(3, 9, 7);
CALL AssignSkillToUser(3, 5, 6);

CALL AssignSkillToUser(4, 7, 7);
CALL AssignSkillToUser(4, 6, 6);
CALL AssignSkillToUser(4, 12, 8);
CALL AssignSkillToUser(4, 4, 6);

CALL AssignSkillToUser(5, 3, 9);
CALL AssignSkillToUser(5, 2, 7);
CALL AssignSkillToUser(5, 13, 9);
CALL AssignSkillToUser(5, 5, 7);

CALL AssignSkillToUser(6, 10, 9);
CALL AssignSkillToUser(6, 6, 8);
CALL AssignSkillToUser(6, 7, 8);
CALL AssignSkillToUser(6, 1, 5);

CALL AssignSkillToUser(7, 5, 9);
CALL AssignSkillToUser(7, 4, 9);
CALL AssignSkillToUser(7, 1, 8);
CALL AssignSkillToUser(7, 12, 7);

CALL AssignSkillToUser(8, 8, 9);
CALL AssignSkillToUser(8, 9, 8);
CALL AssignSkillToUser(8, 1, 7);
CALL AssignSkillToUser(8, 5, 6);

CALL AssignSkillToUser(9, 9, 9);
CALL AssignSkillToUser(9, 8, 8);
CALL AssignSkillToUser(9, 1, 7);
CALL AssignSkillToUser(9, 5, 6);

CALL AssignSkillToUser(10, 7, 8);
CALL AssignSkillToUser(10, 11, 7);
CALL AssignSkillToUser(10, 6, 7);
CALL AssignSkillToUser(10, 5, 5);

CALL AddProject(1, 'Campus Skill Portal', 'DBMS', 'A portal to manage student skill profiles and advanced DB reports.', 'Node.js,MySQL,React,SQL', 'https://github.com/example/campus-skill-portal');
CALL AddProject(1, 'SQL Query Optimizer Demo', 'Database', 'Visualized index impact on query execution.', 'Python,MySQL,SQL', 'https://github.com/example/sql-optimizer-demo');
CALL AddProject(2, 'UI Component Studio', 'Frontend', 'Reusable React component library for campus projects.', 'React,JavaScript,UI/UX', 'https://github.com/example/ui-component-studio');
CALL AddProject(2, 'Alumni Dashboard', 'Web', 'Dashboard with charts and profile filters.', 'React,SQL,JavaScript', NULL);
CALL AddProject(3, 'Student Placement Predictor', 'AI', 'Prediction model for placement readiness.', 'Python,Machine Learning,SQL', 'https://github.com/example/placement-predictor');
CALL AddProject(4, 'Smart Attendance Monitor', 'IoT', 'IoT attendance with web analytics.', 'Node.js,React,DBMS,JavaScript', 'https://github.com/example/smart-attendance');
CALL AddProject(5, 'DSA Visual Playground', 'Education', 'Visualized common DSA patterns.', 'C++,JavaScript,React', NULL);
CALL AddProject(6, 'Design Feedback Hub', 'Frontend', 'Collaborative UI feedback and design review tool.', 'React,UI/UX,JavaScript', 'https://github.com/example/design-feedback-hub');
CALL AddProject(7, 'Query Performance Analyzer', 'DBMS', 'Analyzed slow queries and indexing strategy.', 'Python,MySQL,SQL,DBMS', 'https://github.com/example/query-performance-analyzer');
CALL AddProject(7, 'Data Pipeline Tracker', 'Data Engineering', 'Monitored ETL task status and failures.', 'Python,SQL,Flask', NULL);
CALL AddProject(8, 'Medical Chatbot Classifier', 'AI', 'Classification model for symptom categories.', 'Python,AI,Machine Learning', 'https://github.com/example/medical-chatbot');
CALL AddProject(9, 'Resume Ranker', 'AI', 'Rule and score-based profile ranking system.', 'Python,SQL,AI', NULL);
CALL AddProject(9, 'Recommendation Engine Lite', 'Machine Learning', 'Lightweight recommendation demo for mini projects.', 'Python,Machine Learning,DBMS', 'https://github.com/example/reco-lite');
CALL AddProject(10, 'Mini Freelance Board', 'Web', 'Project listing board for student freelancers.', 'Flask,JavaScript,React,SQL', 'https://github.com/example/freelance-board');

INSERT INTO search_queries(user_id, query_text) VALUES
(NULL, 'Python React DBMS'),
(2, 'AI ML SQL'),
(NULL, 'Frontend JavaScript UI'),
(7, 'Database SQL Optimization');

CALL RunSkillSearch(1, JSON_ARRAY('python', 'react', 'dbms'));
CALL RunSkillSearch(2, JSON_ARRAY('ai', 'machine learning', 'sql'));
CALL RunSkillSearch(3, JSON_ARRAY('frontend', 'javascript', 'ui/ux'));
CALL RunSkillSearch(4, JSON_ARRAY('database', 'sql', 'optimization'));
