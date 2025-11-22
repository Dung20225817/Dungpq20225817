import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 5;
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "" });

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await fetch("https://jsonplaceholder.typicode.com/users");
      const data: User[] = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Create or Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const res = await fetch(`https://jsonplaceholder.typicode.com/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const updatedUser = await res.json();
        setUsers(users.map(u => (u.id === editingUser.id ? { ...u, ...updatedUser } : u)));
        setEditingUser(null);
      } else {
        const res = await fetch("https://jsonplaceholder.typicode.com/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const newUser = await res.json();
        newUser.id = users.length + 1; // fake id
        setUsers([...users, newUser]);
      }
      setFormData({ name: "", email: "", phone: "" });
    } catch (err) {
      console.error("Failed to submit", err);
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    try {
      await fetch(`https://jsonplaceholder.typicode.com/users/${id}`, { method: "DELETE" });
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  // Edit
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, phone: user.phone });
  };

  // Pagination
  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredUsers.length / perPage);
  const displayedUsers = filteredUsers.slice((page - 1) * perPage, page * perPage);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>User</h1>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name"
        value={search}
        onChange={e => { setSearch(e.target.value); setPage(1); }}
        style={{ padding: "5px", marginBottom: "10px", width: "100%" }}
      />

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          style={{ padding: "5px", marginRight: "5px" }}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          style={{ padding: "5px", marginRight: "5px" }}
          required
        />
        <input
          type="text"
          placeholder="Phone"
          value={formData.phone}
          onChange={e => setFormData({ ...formData, phone: e.target.value })}
          style={{ padding: "5px", marginRight: "5px" }}
          required
        />
        <button type="submit" style={{ padding: "5px 10px" }}>
          {editingUser ? "Update" : "Add"}
        </button>
        {editingUser && (
          <button
            type="button"
            onClick={() => { setEditingUser(null); setFormData({ name: "", email: "", phone: "" }); }}
            style={{ padding: "5px 10px", marginLeft: "5px" }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid black", padding: "5px" }}>ID</th>
            <th style={{ border: "1px solid black", padding: "5px" }}>Name</th>
            <th style={{ border: "1px solid black", padding: "5px" }}>Email</th>
            <th style={{ border: "1px solid black", padding: "5px" }}>Phone</th>
            <th style={{ border: "1px solid black", padding: "5px" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedUsers.map(u => (
            <tr key={u.id}>
              <td style={{ border: "1px solid black", padding: "5px" }}>{u.id}</td>
              <td style={{ border: "1px solid black", padding: "5px" }}>{u.name}</td>
              <td style={{ border: "1px solid black", padding: "5px" }}>{u.email}</td>
              <td style={{ border: "1px solid black", padding: "5px" }}>{u.phone}</td>
              <td style={{ border: "1px solid black", padding: "5px" }}>
                <button onClick={() => handleEdit(u)} style={{ marginRight: "5px" }}>Edit</button>
                <button onClick={() => handleDelete(u.id)}>Delete</button>
              </td>
            </tr>
          ))}
          {displayedUsers.length === 0 && (
            <tr>
              <td colSpan={5} style={{ border: "1px solid black", padding: "5px", textAlign: "center" }}>No users found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ marginTop: "10px" }}>
        <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>
          Prev
        </button>
        <span style={{ margin: "0 10px" }}>{page} / {totalPages}</span>
        <button onClick={() => setPage(p => Math.min(p + 1, totalPages))} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}

export default App;
