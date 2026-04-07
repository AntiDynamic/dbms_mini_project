import { useEffect, useState } from "react";
import api from "../services/api";

function SimpleTable({ title, columns, rows }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <table>
        <thead>
          <tr>{columns.map((c) => <th key={c}>{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows?.map((row, idx) => (
            <tr key={idx}>{columns.map((c) => <td key={c}>{String(row[c] ?? "")}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setError("");
      try {
        const res = await api.get("/reports");
        setReport(res.data);
      } catch (err) {
        setError(err?.response?.data?.message || "Could not load reports.");
      }
    };
    load();
  }, []);

  if (error) return <p className="notice error">{error}</p>;
  if (!report) return <p className="notice">Loading reports...</p>;

  return (
    <div>
      <h2 className="page-title">Reports & Analytics</h2>
      <div className="grid two">
        <SimpleTable title="Most Common Skills" columns={["skill_name", "usage_count"]} rows={report.mostCommonSkills} />
        <SimpleTable title="Avg Proficiency by Department" columns={["department", "avg_proficiency"]} rows={report.avgProficiencyByDept} />
        <SimpleTable title="Top Searched Terms" columns={["query_text", "search_count", "last_searched"]} rows={report.topSearchedTerms} />
        <SimpleTable title="Projects Per User" columns={["user_id", "full_name", "project_count"]} rows={report.projectsPerUser} />
        <SimpleTable title="Top Matching Users" columns={["user_id", "full_name", "cumulative_match_score", "appearances"]} rows={report.topMatchingUsers} />
        <SimpleTable title="Above Average Skill Profiles" columns={["user_id", "full_name", "total_skill_score"]} rows={report.aboveAverageProfiles} />
        <SimpleTable title="Users > Avg Skill Count" columns={["user_id", "full_name", "skill_count"]} rows={report.usersMoreThanAvgSkills} />
        <SimpleTable title="Projects in Top Searched Domains" columns={["project_id", "project_title", "domain"]} rows={report.topSearchedDomainsProjects} />
        <SimpleTable title="Highest Total Skill Profiles" columns={["user_id", "full_name", "department", "total_skills", "total_skill_score"]} rows={report.highestTotalSkillProfiles} />
      </div>

      <div className="grid three">
        <SimpleTable title="View: user_skill_summary" columns={["user_id", "full_name", "department", "total_skills", "total_skill_score", "avg_skill_score", "profile_strength"]} rows={report.views?.userSkillSummary} />
        <SimpleTable title="View: project_overview" columns={["project_id", "project_title", "domain", "tech_stack", "full_name", "department"]} rows={report.views?.projectOverview} />
        <SimpleTable title="View: top_profile_scores" columns={["user_id", "full_name", "total_skill_score", "avg_skill_score", "relevance_label"]} rows={report.views?.topProfileScores} />
      </div>
    </div>
  );
}
