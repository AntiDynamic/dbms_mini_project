import { useEffect, useState } from "react";
import api from "../services/api";

const initialForm = {
  full_name: "",
  email: "",
  department: "",
  academic_year: "",
  short_bio: ""
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || "Could not load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, form);
      } else {
        await api.post("/users", form);
      }
      setForm(initialForm);
      setEditingId(null);
      loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not save user.");
    } finally {
      setSaving(false);
    }
  };

  const editRow = (user) => {
    setForm({
      full_name: user.full_name,
      email: user.email,
      department: user.department,
      academic_year: user.academic_year,
      short_bio: user.short_bio || ""
    });
    setEditingId(user.user_id);
  };

  const deleteRow = async (id) => {
    setError("");
    try {
      await api.delete(`/users/${id}`);
      if (editingId === id) {
        setEditingId(null);
        setForm(initialForm);
      }
      loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not delete user.");
    }
  };

  return (
    <div>
      <h2 className="page-title">Users</h2>
      {error ? <p className="notice error">{error}</p> : null}
      <form className="card form-grid" onSubmit={submit}>
        <input placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
        <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <input placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required />
        <input placeholder="Academic Year" value={form.academic_year} onChange={(e) => setForm({ ...form, academic_year: e.target.value })} required />
        <textarea placeholder="Short Bio" value={form.short_bio} onChange={(e) => setForm({ ...form, short_bio: e.target.value })} />
        <div className="button-row">
          <button type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Update User" : "Add User"}</button>
          {editingId ? <button type="button" onClick={() => { setEditingId(null); setForm(initialForm); }}>Cancel</button> : null}
        </div>
      </form>

      <div className="card">
        {loading ? <p className="muted">Loading users...</p> : null}
        <table>
          <thead>
            <tr><th>ID</th><th>Name</th><th>Email</th><th>Dept</th><th>Year</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.user_id}>
                <td>{u.user_id}</td><td>{u.full_name}</td><td>{u.email}</td><td>{u.department}</td><td>{u.academic_year}</td>
                <td>
                  <button className="small" onClick={() => editRow(u)}>Edit</button>
                  <button className="small danger" onClick={() => deleteRow(u.user_id)}>Delete</button>
                </td>
              </tr>
            ))}
            {!loading && !users.length ? <tr><td colSpan="6" className="muted">No users found.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
