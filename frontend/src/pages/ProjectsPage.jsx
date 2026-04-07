import { useEffect, useState } from "react";
import api from "../services/api";

const initialForm = {
  user_id: "",
  project_title: "",
  domain: "",
  description: "",
  tech_stack: "",
  github_link: ""
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [projectRes, usersRes] = await Promise.all([api.get("/projects"), api.get("/users")]);
      setProjects(projectRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load projects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, user_id: Number(form.user_id) };
      if (editingId) {
        await api.put(`/projects/${editingId}`, payload);
      } else {
        await api.post("/projects", payload);
      }
      setForm(initialForm);
      setEditingId(null);
      loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not save project.");
    } finally {
      setSaving(false);
    }
  };

  const editRow = (p) => {
    setForm({
      user_id: String(p.user_id),
      project_title: p.project_title,
      domain: p.domain,
      description: p.description,
      tech_stack: p.tech_stack,
      github_link: p.github_link || ""
    });
    setEditingId(p.project_id);
  };

  const deleteRow = async (id) => {
    setError("");
    try {
      await api.delete(`/projects/${id}`);
      loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not delete project.");
    }
  };

  return (
    <div>
      <h2 className="page-title">Projects</h2>
      {error ? <p className="notice error">{error}</p> : null}
      <form className="card form-grid" onSubmit={submit}>
        <select value={form.user_id} onChange={(e) => setForm({ ...form, user_id: e.target.value })} required>
          <option value="">Select Owner</option>
          {users.map((u) => <option key={u.user_id} value={u.user_id}>{u.full_name}</option>)}
        </select>
        <input placeholder="Project Title" value={form.project_title} onChange={(e) => setForm({ ...form, project_title: e.target.value })} required />
        <input placeholder="Domain" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} required />
        <input placeholder="Tech Stack (comma separated)" value={form.tech_stack} onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} required />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
        <input placeholder="GitHub Link (optional)" value={form.github_link} onChange={(e) => setForm({ ...form, github_link: e.target.value })} />
        <div className="button-row">
          <button type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Update Project" : "Add Project"}</button>
          {editingId ? <button type="button" onClick={() => { setEditingId(null); setForm(initialForm); }}>Cancel</button> : null}
        </div>
      </form>

      <div className="card">
        {loading ? <p className="muted">Loading projects...</p> : null}
        <table>
          <thead><tr><th>ID</th><th>Title</th><th>Owner</th><th>Domain</th><th>Tech Stack</th><th>Actions</th></tr></thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.project_id}>
                <td>{p.project_id}</td>
                <td>{p.project_title}</td>
                <td>{p.full_name}</td>
                <td>{p.domain}</td>
                <td>{p.tech_stack}</td>
                <td>
                  <button className="small" onClick={() => editRow(p)}>Edit</button>
                  <button className="small danger" onClick={() => deleteRow(p.project_id)}>Delete</button>
                </td>
              </tr>
            ))}
            {!loading && !projects.length ? <tr><td colSpan="6" className="muted">No projects found.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
