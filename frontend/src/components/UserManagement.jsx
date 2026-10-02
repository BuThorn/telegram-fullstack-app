import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, ShieldAlert, RefreshCw } from "lucide-react";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // ១. មុខងារទាញយកទិន្នន័យអ្នកប្រើប្រាស់ទាំងអស់ពី Backend
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("http://localhost:8000/api/admin/users");
      setUsers(response.data);
    } catch (error) {
      alert("មិនអាចទាញយកបញ្ជីអ្នកប្រើប្រាស់បានទេ!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ២. មុខងារលុបគណនីអ្នកប្រើប្រាស់
  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`តើអ្នកពិតជាចង់លុបគណនីរបស់ ${userName} មែនទេ?`)) {
      try {
        await axios.delete(`http://localhost:8000/api/admin/users/${userId}`);
        alert("លុបបានជោគជ័យ!");
        fetchUsers(); // ទាញយកទិន្នន័យថ្មីឡើងវិញក្រោយលុប
      } catch (error) {
        alert("មានបញ្ហាក្នុងការលុបអ្នកប្រើប្រាស់!");
      }
    }
  };

  return (
    <div style={{ background: "#172737", border: "1px solid #2a4057", borderRadius: "9px", padding: "20px", marginTop: "30px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2 style={{ color: "#e8e8e8", margin: 0, fontSize: "18px" }}>👥 គ្រប់គ្រងអ្នកប្រើប្រាស់ក្នុងប្រព័ន្ធ</h2>
        <button onClick={fetchUsers} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "6px 12px", background: "#347ce5", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {loading ? (
        <p style={{ color: "#aaa" }}>កំពុងទាញយកទិន្នន័យ...</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
          <thead>
            <tr style={{ background: "#202d3c", color: "#347ce5", borderBottom: "2px solid #2a4057" }}>
              <th style={{ padding: "12px" }}>ល.រ</th>
              <th style={{ padding: "12px" }}>ឈ្មោះពេញ</th>
              <th style={{ padding: "12px" }}>អ៊ីមែល</th>
              <th style={{ padding: "12px" }}>កម្រិតសិទ្ធិ</th>
              <th style={{ padding: "12px" }}>សកម្មភាព</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, index) => (
              <tr key={u.id} style={{ borderBottom: "1px solid #2a4057", color: "#e8e8e8" }}>
                <td style={{ padding: "12px" }}>{index + 1}</td>
                <td style={{ padding: "12px" }}>{u.full_name}</td>
                <td style={{ padding: "12px" }}>{u.email}</td>
                <td style={{ padding: "12px" }}>
                  <span style={{ background: u.role === "admin" ? "#3c1e1e" : "#101c2a", color: u.role === "admin" ? "#f87171" : "#4ade80", padding: "3px 8px", borderRadius: "4px", fontSize: "12px", fontWeight: "bold" }}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: "12px" }}>
                  <button 
                    onClick={() => handleDeleteUser(u.id, u.full_name)}
                    style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "5px" }}
                    title="លុបគណនី"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UserManagement;
