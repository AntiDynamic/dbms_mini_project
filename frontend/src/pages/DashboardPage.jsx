import { useEffect, useState } from "react";
import api from "../services/api";

export default function DashboardPage() {
  const [data, setData] = useState({ totals: {}, topSkills: [], recentActivity: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/dashboard");
        setData(res.data);
      } catch (err) {
        setError(err?.response?.data?.message || "Could not load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p className="notice">Loading dashboard...</p>;
  if (error) return <p className="notice error">{error}</p>;

  return (
    <div>
      <h2 className="page-title">Dashboard</h2>
      <div className="grid four">
        <div className="card stat"><h3>Total Users</h3><p>{data.totals.users || 0}</p></div>
        <div className="card stat"><h3>Total Skills</h3><p>{data.totals.skills || 0}</p></div>
        <div className="card stat"><h3>Total Projects</h3><p>{data.totals.projects || 0}</p></div>
        <div className="card stat"><h3>Total Searches</h3><p>{data.totals.searches || 0}</p></div>
      </div>

      <div className="grid two">
        <div className="card">
          <h3>Top Skills</h3>
          <table>
            <thead><tr><th>Skill</th><th>Count</th></tr></thead>
            <tbody>
              {data.topSkills.map((item) => (
                <tr key={item.skill_name}><td>{item.skill_name}</td><td>{item.count}</td></tr>
              ))}
              {!data.topSkills.length ? <tr><td colSpan="2" className="muted">No data found.</td></tr> : null}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>Recent Activity</h3>
          <table>
            <thead><tr><th>Action</th><th>Table</th><th>Description</th></tr></thead>
            <tbody>
              {data.recentActivity.map((item, idx) => (
                <tr key={idx}><td>{item.action_type}</td><td>{item.table_name}</td><td>{item.description}</td></tr>
              ))}
              {!data.recentActivity.length ? <tr><td colSpan="3" className="muted">No recent activity.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
