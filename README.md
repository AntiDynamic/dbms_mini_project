# SkillMatch DB - Intelligent Profile Search using Similarity Scoring

SkillMatch DB is a DBMS mini project that simulates vector-style profile search using explainable weighted matching in MySQL.

## Tech Stack

- Frontend: React (Vite), CSS
- Backend: Node.js, Express
- Database: MySQL 8+

## Project Structure

- `backend/`
  - `src/` Express API routes and services
  - `db/schema.sql` Full schema (tables, constraints, indexes, views, functions, procedures, triggers)
  - `db/sample_data.sql` Realistic initial data and sample searches
  - `db/reports_queries.sql` Join, aggregate, and subquery examples
  - `db/dml_examples.sql` DML examples for insert/update/delete
- `frontend/`
  - `src/pages/` Dashboard, Users, Skills, Projects, Search, Reports, Audit Log
  - `src/components/Layout.jsx` app shell and navigation

## DBMS Concepts Covered

- Relational schema with normalization-friendly tables
- PK/FK constraints and uniqueness rules
- CRUD operations
- JOIN queries
- Aggregate functions (`COUNT`, `SUM`, `AVG`, `MAX`, `GROUP BY`, `HAVING`)
- Subqueries and advanced SQL
- Indexing for query efficiency
- Views for reusable reporting
- Stored procedures for business actions
- SQL functions for reusable computations
- Triggers for automatic audit logging
- Conditional logic using `CASE`
- Search history and result logging

## Database Setup

1. Copy `backend/.env.example` to `backend/.env` and set your MySQL credentials.
2. From `backend/`, install dependencies if needed and load the schema plus sample data:

```bash
npm run db:init
```

3. If you prefer MySQL Workbench, you can still run the SQL files manually:

```sql
SOURCE backend/db/schema.sql;
SOURCE backend/db/sample_data.sql;
```

Optional demo scripts:

```sql
SOURCE backend/db/reports_queries.sql;
SOURCE backend/db/dml_examples.sql;
```

## Backend Setup

1. Open terminal in `backend`.
2. Install dependencies:

```bash
npm install
```

3. Create `.env` from `.env.example` and update DB credentials.
4. Run backend server:

```bash
npm run dev
```

Backend URL: `http://localhost:5000`

## Frontend Setup

1. Open second terminal in `frontend`.
2. Install dependencies:

```bash
npm install
```

3. Start app:

```bash
npm run dev
```

Frontend URL: `http://localhost:5173`

## Main Similarity Search Logic

Input query is tokenized in backend, then passed to MySQL stored procedure `RunSkillSearch(query_id, keywords_json)`.

Scoring:

1. Skill overlap score: sum of matching `proficiency_score`
2. Profile bonus: name, department, and bio keyword matches for user search
3. Project bonus: +2 for domain/tech-stack keyword matches
4. Project result ranking also stores project-focused scores

Results are inserted into `search_results` and ranked descending.

Relevance labels:

- Highly Relevant
- Moderately Relevant
- Low Match

## API Overview

- `GET/POST/PUT/DELETE /api/users`
- `GET/POST/PUT/DELETE /api/skills`
- `GET /api/skills/user-mappings`
- `POST /api/skills/assign`
- `PUT/DELETE /api/skills/assign/:userSkillId`
- `GET/POST/PUT/DELETE /api/projects`
- `POST /api/search`
- `GET /api/search/history`
- `GET /api/search/history/:queryId/results`
- `GET /api/reports`
- `GET /api/audit`
- `GET /api/dashboard`

## Viva Notes

- Explain how many-to-many relationship is implemented: `users` <-> `skills` through `user_skills`.
- Explain why search is DBMS-friendly: no embeddings, only relational scoring.
- Show procedure `RunSkillSearch` and trigger-generated `audit_log` rows.
- Show views (`user_skill_summary`, `project_overview`, `top_profile_scores`) for reusable analytics.
