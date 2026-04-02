import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import {
  getAdminUsers, updateAdminUser, deleteAdminUser, downloadCSV,
} from "../../api/adminApi";
import {
  Search, Download, Trash2, ChevronLeft, ChevronRight,
  UserCog, X, CheckCheck,
} from "lucide-react";

const ROLE_BADGE = {
  guest: "bg-indigo-500/20 text-indigo-400",
  host: "bg-purple-500/20 text-purple-400",
  admin: "bg-red-500/20 text-red-400",
};

const ACCOUNT_BADGE = {
  free: "text-gray-400",
  premium: "bg-amber-500/20 text-amber-400",
};

const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <div className="rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
      <p className="text-center mb-6 leading-relaxed" style={{ color: "var(--text-primary)" }}>{message}</p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 py-2 rounded-lg text-sm transition-colors" style={{ border: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>Cancel</button>
        <button onClick={onConfirm} className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition-colors text-sm font-medium">Confirm</button>
      </div>
    </div>
  </div>
);

const AdminUsersPage = () => {
  const [data, setData] = useState({ data: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState("");
  const [confirm, setConfirm] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminUsers({ page, limit: 15, search: search || undefined, role: roleFilter || undefined, accountType: accountFilter || undefined });
      setData(res);
    } catch { showToast("Failed to load users."); }
    finally { setLoading(false); }
  }, [page, search, roleFilter, accountFilter]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRole) => {
    try { await updateAdminUser(userId, { role: newRole }); showToast("Role updated successfully."); fetchUsers(); }
    catch { showToast("Failed to update role."); }
  };

  const handleAccountChange = async (userId, newAccount) => {
    try { await updateAdminUser(userId, { accountType: newAccount }); showToast("Account type updated."); fetchUsers(); }
    catch { showToast("Failed to update account type."); }
  };

  const handleDelete = (userId, userName) => {
    setConfirm({
      message: `Delete "${userName}"? This will also remove their properties and bookings.`,
      action: async () => {
        try { await deleteAdminUser(userId); showToast("User deleted."); fetchUsers(); }
        catch { showToast("Failed to delete user."); }
        setConfirm(null);
      },
    });
  };

  const { pagination } = data;

  return (
    <AdminLayout>
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 text-sm px-4 py-3 rounded-xl shadow-lg" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
          <CheckCheck className="w-4 h-4 text-green-400" /> {toast}
        </div>
      )}
      {confirm && <ConfirmModal message={confirm.message} onConfirm={confirm.action} onCancel={() => setConfirm(null)} />}

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <UserCog className="w-6 h-6 text-indigo-400" />
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Users</h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{pagination?.total?.toLocaleString() || 0} total users</p>
            </div>
          </div>
          <button onClick={() => downloadCSV("users")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
            <input type="text" placeholder="Search by name, phone, or email…" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              </button>
            )}
          </div>
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
            <option value="">All Roles</option>
            <option value="guest">Guest</option>
            <option value="host">Host</option>
          </select>
          <select value={accountFilter} onChange={(e) => { setAccountFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
            <option value="">All Accounts</option>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
          </select>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide" style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
                  <th className="px-5 py-4 font-medium">User</th>
                  <th className="px-5 py-4 font-medium">Phone</th>
                  <th className="px-5 py-4 font-medium">City</th>
                  <th className="px-5 py-4 font-medium">Role</th>
                  <th className="px-5 py-4 font-medium">Account</th>
                  <th className="px-5 py-4 font-medium">Joined</th>
                  <th className="px-5 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="py-16 text-center"><div className="w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                ) : data.data.length === 0 ? (
                  <tr><td colSpan={7} className="py-16 text-center" style={{ color: "var(--text-muted)" }}>No users found.</td></tr>
                ) : (
                  data.data.map((u) => (
                    <tr key={u._id} className="transition-colors" style={{ borderBottom: "1px solid var(--border-color)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300 uppercase">
                            {u.name?.[0] || "?"}
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: "var(--text-primary)" }}>{u.name}</p>
                            {u.email && <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{u.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4" style={{ color: "var(--text-secondary)" }}>{u.phone}</td>
                      <td className="px-5 py-4" style={{ color: "var(--text-secondary)" }}>{u.city}</td>
                      <td className="px-5 py-4">
                        <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          className={`text-xs font-medium px-2 py-1 rounded-lg border-0 focus:ring-1 focus:ring-indigo-500 cursor-pointer ${ROLE_BADGE[u.role] || ""} bg-transparent`}>
                          <option value="guest">guest</option>
                          <option value="host">host</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="px-5 py-4">
                        <select value={u.accountType} onChange={(e) => handleAccountChange(u._id, e.target.value)}
                          className={`text-xs font-medium px-2 py-1 rounded-lg border-0 focus:ring-1 focus:ring-indigo-500 cursor-pointer ${ACCOUNT_BADGE[u.accountType] || ""} bg-transparent`}>
                          <option value="free">free</option>
                          <option value="premium">premium</option>
                        </select>
                      </td>
                      <td className="px-5 py-4 text-xs" style={{ color: "var(--text-secondary)" }}>
                        {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button onClick={() => handleDelete(u._id, u.name)}
                          className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-muted)" }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
                          title="Delete user">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {pagination?.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-4" style={{ borderTop: "1px solid var(--border-color)" }}>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Page {pagination.page} of {pagination.pages}</p>
              <div className="flex gap-2">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="p-2 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors" style={{ border: "1px solid var(--border-color)" }}><ChevronLeft className="w-4 h-4" /></button>
                <button disabled={page === pagination.pages} onClick={() => setPage((p) => p + 1)} className="p-2 rounded-lg text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors" style={{ border: "1px solid var(--border-color)" }}><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;
