import { useEffect, useState } from "react";
import api from "../services/api";

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/audit");
        setLogs(res.data);
      } catch (err) {
        setError(err?.response?.data?.message || "Could not load audit log.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <h2 className="page-title">Audit Log</h2>
      {error ? <p className="notice error">{error}</p> : null}
      <div className="card">
        {loading ? <p className="muted">Loading audit log...</p> : null}
        <table>
          <thead><tr><th>Log ID</th><th>Action</th><th>Table</th><th>Time</th><th>Description</th></tr></thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.log_id}>
                <td>{log.log_id}</td>
                <td>{log.action_type}</td>
                <td>{log.table_name}</td>
                <td>{new Date(log.action_time).toLocaleString()}</td>
                <td>{log.description}</td>
              </tr>
            ))}
            {!loading && !logs.length ? <tr><td colSpan="5" className="muted">No audit entries found.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
