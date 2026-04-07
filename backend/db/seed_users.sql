USE skillmatch_db;

INSERT INTO users (full_name, email, department, academic_year, short_bio) VALUES
('Neha Gupta', 'neha.gupta@example.com', 'CSE', '3rd Year', 'Full-stack learner with focus on React and APIs.'),
('Arjun Nair', 'arjun.nair@example.com', 'IT', '4th Year', 'Backend developer interested in databases and system design.'),
('Priya Das', 'priya.das@example.com', 'AI&DS', '2nd Year', 'Builds ML prototypes and analytics dashboards.'),
('Manav Joshi', 'manav.joshi@example.com', 'ECE', '3rd Year', 'Works on IoT integrations and web monitoring tools.'),
('Sara Khan', 'sara.khan@example.com', 'CSE', '4th Year', 'Strong in DSA, C++, and SQL query optimization.'),
('Rohan Bhat', 'rohan.bhat@example.com', 'IT', '3rd Year', 'Frontend and UI-focused developer using React.'),
('Kriti Malhotra', 'kriti.malhotra@example.com', 'CSE', '2nd Year', 'Learning Node.js, Express, and relational modeling.'),
('Aditya Menon', 'aditya.menon@example.com', 'AI&DS', '4th Year', 'Interested in NLP systems and recommendation pipelines.')
ON DUPLICATE KEY UPDATE
  full_name = VALUES(full_name),
  department = VALUES(department),
  academic_year = VALUES(academic_year),
  short_bio = VALUES(short_bio);
