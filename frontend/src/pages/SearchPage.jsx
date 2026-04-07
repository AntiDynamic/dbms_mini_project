import { useEffect, useState } from "react";
import api from "../services/api";

export default function SearchPage() {
  const [queryText, setQueryText] = useState("Python React DBMS");
  const [result, setResult] = useState({ users: [], projects: [], keywords: [] });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await api.get("/search/history");
      setHistory(res.data.slice(0, 8));
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const runSearch = async (e) => {
    e.preventDefault();
    if (!queryText.trim()) {
      setError("Please type a search query.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const res = await api.post("/search", { query_text: queryText.trim() });
      setResult(res.data);
      loadHistory();
    } catch (err) {
      setError(err?.response?.data?.message || "Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const runFromHistory = async (entry) => {
    setQueryText(entry.query_text);
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/search", { query_text: entry.query_text });
      setResult(res.data);
      loadHistory();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to run history search.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="page-title">Similarity Search</h2>
      {error ? <p className="notice error">{error}</p> : null}
      <form className="card search-box" onSubmit={runSearch}>
        <input
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder="Try: Python DBMS React or a user name"
        />
        <button type="submit" disabled={loading}>{loading ? "Searching..." : "Run Search"}</button>
      </form>

      <div className="grid two">
        <div className="card">
          <h3 className="section-title">Parsed Keywords</h3>
          <div className="tags">
            {result.keywords?.map((kw) => <span key={kw} className="tag">{kw}</span>)}
          </div>
          {!result.keywords?.length ? <p className="muted">Run a search to see extracted keywords.</p> : null}
        </div>

        <div className="card">
          <h3 className="section-title">Recent Searches</h3>
          {historyLoading ? <p className="muted">Loading history...</p> : null}
          {!historyLoading && !history.length ? <p className="muted">No search history yet.</p> : null}
          {history.map((entry) => (
            <div key={entry.query_id} className="history-item">
              <div>
                <strong>{entry.query_text}</strong>
                <p className="muted">{new Date(entry.search_time).toLocaleString()}</p>
              </div>
              <button className="small" onClick={() => runFromHistory(entry)} disabled={loading}>Run</button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid two">
        <div className="card">
          <h3 className="section-title">Ranked Users</h3>
          <table>
            <thead><tr><th>Name</th><th>Department</th><th>Score</th><th>Label</th></tr></thead>
            <tbody>
              {result.users?.map((u) => (
                <tr key={u.result_id}>
                  <td>{u.full_name}</td>
                  <td>{u.department}</td>
                  <td>{u.match_score}</td>
                  <td><span className={`pill ${u.relevance_label?.toLowerCase().replace(/\s+/g, "-")}`}>{u.relevance_label}</span></td>
                </tr>
              ))}
              {!result.users?.length ? <tr><td colSpan="4" className="muted">No matching users found.</td></tr> : null}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3 className="section-title">Ranked Projects</h3>
          <table>
            <thead><tr><th>Project</th><th>Score</th><th>Label</th></tr></thead>
            <tbody>
              {result.projects?.map((p) => (
                <tr key={p.result_id}>
                  <td>{p.project_title}</td>
                  <td>{p.match_score}</td>
                  <td><span className={`pill ${p.relevance_label?.toLowerCase().replace(/\s+/g, "-")}`}>{p.relevance_label}</span></td>
                </tr>
              ))}
              {!result.projects?.length ? <tr><td colSpan="3" className="muted">No matching projects found.</td></tr> : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
