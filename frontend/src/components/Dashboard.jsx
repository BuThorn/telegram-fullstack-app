import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Trash2,
  RefreshCw,
  UserPlus,
  MessageSquare,
  Image,
  Video,
  Edit3,
  MessageCircle,
} from "lucide-react";

import "./Dashboard.css";

const postTypes = [
  { title: "Add Contact", subtitle: "(Telegram)", icon: UserPlus },
  { title: "Text Message", subtitle: "(Telegram)", icon: MessageSquare },
  { title: "Photo", subtitle: "(Telegram)", icon: Image },
  { title: "Video", subtitle: "(Telegram)", icon: Video },
  { title: "Channel Post", subtitle: "(Telegram)", icon: Video },
];

function Dashboard() {
  const [currentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const isAdmin = currentUser?.role === "admin";
  const token = currentUser?.token;

  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const API_BASE_URL = "http://localhost:8000/api";

  const getAuthConfig = () => {
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  const fetchUsers = async () => {
    if (!token) return;
    setUsersLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users`, getAuthConfig());
      setUsers(response.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("សៀសសិនរបស់អ្នកអស់សុពលភាព ឬអ្នកមិនមានសិទ្ធិមើលទំព័រនេះទេ!");
      }
    } finally {
      setUsersLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/admin/users/${userId}/role`,
        { role: newRole },
        getAuthConfig()
      );
      if (response.data.status === "success") {
        alert("បានផ្លាស់ប្តូរកម្រិតសិទ្ធិជោគជ័យ!");
        fetchUsers();
      }
    } catch (error) {
      alert(error.response?.data?.detail || "មានបញ្ហាក្នុងការផ្លាស់ប្តូរសិទ្ធិ!");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`តើអ្នកពិតជាចង់លុបគណនីរបស់ ${userName} មែនទេ?`)) {
      try {
        const response = await axios.delete(`${API_BASE_URL}/admin/users/${userId}`, getAuthConfig());
        alert(response.data.message || "លុបអ្នកប្រើប្រាស់បានជោគជ័យ!");
        fetchUsers();
      } catch (error) {
        alert(error.response?.data?.detail || "មានបញ្ហាក្នុងការលុបអ្នកប្រើប្រាស់!");
      }
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  return (
    <div className="dashboard-shell py-6">

      <main className="content-panel mx-auto mt-8 max-w-5xl p-5 md:p-8">
        <div className="mb-8 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#f0c94b]">Overview</p>
            <h1 className="text-3xl font-bold tracking-tight text-[#f8f4ed]">Dashboard</h1>
          </div>
          <h2 className="text-lg text-[#e9e1d2]">Telegram Automated Control Center</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {postTypes.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                className="dashboard-card group cursor-pointer p-5 text-center"
                key={index}
              >
                <div className="dashboard-icon mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl">
                  <Icon size={38} strokeWidth={2.4} />
                </div>
                <div className="text-base font-semibold text-[#f8f4ed]">{item.title}</div>
                {item.subtitle && <div className="mt-1 text-xs text-[#d8d0bf]">{item.subtitle}</div>}
              </div>
            );
          })}
        </div>

        {isAdmin && (
          <div className="mt-10 border-t border-[#f0c94b]/20 pt-8">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-2xl font-bold text-[#f8f4ed]">👥 User Management</h2>
              <button
                onClick={fetchUsers}
                className="refresh-btn inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold"
              >
                <RefreshCw size={14} /> Refresh List
              </button>
            </div>

            {usersLoading ? (
              <p className="text-sm text-[#d8d0bf]">កំពុងទាញយកទិន្នន័យអ្នកប្រើប្រាស់...</p>
            ) : users.length === 0 ? (
              <p className="text-sm text-[#d8d0bf]">មិនទាន់មានអ្នកប្រើប្រាស់ផ្សេងទៀតនៅក្នុងប្រព័ន្ធនៅឡើយទេ។</p>
            ) : (
              <div className="table-shell">
                <div className="overflow-x-auto">
                  <table className="admin-table min-w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="text-[#f0c94b]">
                        <th className="px-4 py-3 font-semibold">ល.រ</th>
                        <th className="px-4 py-3 font-semibold">ឈ្មោះពេញ</th>
                        <th className="px-4 py-3 font-semibold">អ៊ីមែល</th>
                        <th className="px-4 py-3 font-semibold">កម្រិតសិទ្ធិ (Role)</th>
                        <th className="px-4 py-3 font-semibold">សកម្មភាព</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u, index) => (
                        <tr key={u.id} className="border-t border-[#f0c94b]/10 text-[#f2ece1]">
                          <td className="px-4 py-3">{index + 1}</td>
                          <td className="px-4 py-3 font-semibold text-[#fffaf0]">{u.full_name}</td>
                          <td className="px-4 py-3 text-[#d8d0bf]">{u.email}</td>
                          <td className="px-4 py-3">
                            <select
                              value={u.role || 'user'}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className="rounded-lg border px-2.5 py-1.5 text-xs font-bold outline-none"
                              style={{
                                background: u.role === 'admin' ? '#3d2319' : '#101317',
                                color: u.role === 'admin' ? '#f9c7ad' : '#b7f0c4',
                                borderColor: u.role === 'admin' ? '#f0c94b' : '#3a3d41',
                              }}
                            >
                              <option value="user">USER</option>
                              <option value="admin">ADMIN</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleDeleteUser(u.id, u.full_name)}
                              className="admin-action-btn inline-flex items-center rounded-lg p-2 text-red-400"
                              title="លុបគណនី"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;
