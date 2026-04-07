import { useEffect, useState } from "react";
import api from "../services/api";

export default function SkillsPage() {
  const [skills, setSkills] = useState([]);
  const [users, setUsers] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [skillForm, setSkillForm] = useState({ skill_name: "", category: "" });
  const [assignForm, setAssignForm] = useState({ user_id: "", skill_id: "", proficiency_score: 5 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [skillsRes, usersRes, mapRes] = await Promise.all([
        api.get("/skills"),
        api.get("/users"),
        api.get("/skills/user-mappings")
      ]);
      setSkills(skillsRes.data);
      setUsers(usersRes.data);
      setMappings(mapRes.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load skills data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const addSkill = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/skills", skillForm);
      setSkillForm({ skill_name: "", category: "" });
      loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not add skill.");
    } finally {
      setSaving(false);
    }
  };

  const assignSkill = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/skills/assign", {
        ...assignForm,
        user_id: Number(assignForm.user_id),
        skill_id: Number(assignForm.skill_id),
        proficiency_score: Number(assignForm.proficiency_score)
      });
      setAssignForm({ user_id: "", skill_id: "", proficiency_score: 5 });
      loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not assign skill.");
    } finally {
      setSaving(false);
    }
  };

  const removeMapping = async (id) => {
    setError("");
    try {
      await api.delete(`/skills/assign/${id}`);
      loadAll();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not remove mapping.");
    }
  };

  return (
    <div>
      <h2 className="page-title">Skills</h2>
      {error ? <p className="notice error">{error}</p> : null}
      <div className="grid two">
        <form className="card form-grid" onSubmit={addSkill}>
          <h3>Add Skill</h3>
          <input placeholder="Skill Name" value={skillForm.skill_name} onChange={(e) => setSkillForm({ ...skillForm, skill_name: e.target.value })} required />
          <input placeholder="Category" value={skillForm.category} onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })} required />
          <button type="submit" disabled={saving}>{saving ? "Saving..." : "Add Skill"}</button>
        </form>

        <form className="card form-grid" onSubmit={assignSkill}>
          <h3>Assign Skill to User</h3>
          <select value={assignForm.user_id} onChange={(e) => setAssignForm({ ...assignForm, user_id: e.target.value })} required>
            <option value="">Select User</option>
            {users.map((u) => <option key={u.user_id} value={u.user_id}>{u.full_name}</option>)}
          </select>
          <select value={assignForm.skill_id} onChange={(e) => setAssignForm({ ...assignForm, skill_id: e.target.value })} required>
            <option value="">Select Skill</option>
            {skills.map((s) => <option key={s.skill_id} value={s.skill_id}>{s.skill_name}</option>)}
          </select>
          <input type="number" min="1" max="10" value={assignForm.proficiency_score} onChange={(e) => setAssignForm({ ...assignForm, proficiency_score: e.target.value })} required />
          <button type="submit" disabled={saving}>{saving ? "Saving..." : "Assign / Update"}</button>
        </form>
      </div>

      <div className="card">
        <h3>Skill Catalog</h3>
        {loading ? <p className="muted">Loading skills...</p> : null}
        <table>
          <thead><tr><th>Skill</th><th>Category</th></tr></thead>
          <tbody>
            {skills.map((s) => (
              <tr key={s.skill_id}><td>{s.skill_name}</td><td>{s.category}</td></tr>
            ))}
            {!loading && !skills.length ? <tr><td colSpan="2" className="muted">No skills found.</td></tr> : null}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>User Skill Mapping</h3>
        {loading ? <p className="muted">Loading mappings...</p> : null}
        <table>
          <thead><tr><th>User</th><th>Skill</th><th>Score</th><th>Action</th></tr></thead>
          <tbody>
            {mappings.map((m) => (
              <tr key={m.user_skill_id}>
                <td>{m.full_name}</td><td>{m.skill_name}</td><td>{m.proficiency_score}</td>
                <td><button className="small danger" onClick={() => removeMapping(m.user_skill_id)}>Remove</button></td>
              </tr>
            ))}
            {!loading && !mappings.length ? <tr><td colSpan="4" className="muted">No mappings found.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
