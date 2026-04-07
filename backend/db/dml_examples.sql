USE skillmatch_db;

-- INSERT example
INSERT INTO users(full_name, email, department, academic_year, short_bio)
VALUES ('Demo User', 'demo.user@example.com', 'CSE', '1st Year', 'Temporary row for DML demo');

-- UPDATE example
UPDATE users
SET short_bio = 'Updated bio via DML demo script'
WHERE email = 'demo.user@example.com';

-- DELETE example
DELETE FROM users
WHERE email = 'demo.user@example.com';
