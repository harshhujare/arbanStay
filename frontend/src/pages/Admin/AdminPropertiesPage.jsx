import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import {
  getAdminProperties,
  updateAdminPropertyStatus,
  deleteAdminProperty,
  downloadCSV,
} from "../../api/adminApi";
import {
  Search, Download, Trash2, ChevronLeft, ChevronRight,
  Building2, X, CheckCheck, ShieldAlert, ShieldCheck as ShieldCheckIcon,
} from "lucide-react";

const STATUS_STYLES = {
  active: "bg-green-500/20 text-green-400",
  suspended: "bg-red-500/20 text-red-400",
  pending_review: "bg-amber-500/20 text-amber-400",
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

const AdminPropertiesPage = () => {
  const [data, setData] = useState({ data: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState("");
  const [confirm, setConfirm] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminProperties({ page, limit: 15, search: search || undefined, adminStatus: statusFilter || undefined });
      setData(res);
    } catch { showToast("Failed to load properties."); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchProperties, 300);
    return () => clearTimeout(t);
  }, [fetchProperties]);

  const handleStatusToggle = async (property) => {
    const newStatus = property.adminStatus === "active" || !property.adminStatus ? "suspended" : "active";
    try {
      await updateAdminPropertyStatus(property._id, newStatus);
      showToast(`Property ${newStatus === "suspended" ? "suspended" : "restored"}.`);
      fetchProperties();
    } catch { showToast("Failed to update status."); }
  };

  const handleDelete = (propertyId, title) => {
    setConfirm({
      message: `Delete "${title}"? Pending/confirmed bookings will be cancelled.`,
      action: async () => {
        try {
          await deleteAdminProperty(propertyId);
          showToast("Property deleted.");
          fetchProperties();
        } catch { showToast("Failed to delete property."); }
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
            <Building2 className="w-6 h-6 text-purple-400" />
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Properties</h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{pagination?.total?.toLocaleString() || 0} total listings</p>
            </div>
          </div>
          <button onClick={() => downloadCSV("properties")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
            <input type="text" placeholder="Search by title…" value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-purple-500"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              </button>
            )}
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-purple-500"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending_review">Pending Review</option>
          </select>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide" style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
                  <th className="px-5 py-4 font-medium">Property</th>
                  <th className="px-5 py-4 font-medium">Host</th>
                  <th className="px-5 py-4 font-medium">City</th>
                  <th className="px-5 py-4 font-medium">Rent</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Views</th>
                  <th className="px-5 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="py-16 text-center"><div className="w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                ) : data.data.length === 0 ? (
                  <tr><td colSpan={7} className="py-16 text-center" style={{ color: "var(--text-muted)" }}>No properties found.</td></tr>
                ) : (
                  data.data.map((p) => {
                    const currentStatus = p.adminStatus || "active";
                    const isSuspended = currentStatus === "suspended";
                    return (
                      <tr key={p._id} className="transition-colors" style={{ borderBottom: "1px solid var(--border-color)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {p.images?.[0] ? (
                              <img src={p.images[0]} alt={p.title} className="w-10 h-10 rounded-lg object-cover shrink-0" style={{ border: "1px solid var(--border-color)" }} />
                            ) : (
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--bg-secondary)" }}>
                                <Building2 className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                              </div>
                            )}
                            <p className="font-medium line-clamp-1 max-w-[180px]" style={{ color: "var(--text-primary)" }}>{p.title}</p>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p style={{ color: "var(--text-primary)" }}>{p.hostId?.name || "—"}</p>
                          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{p.hostId?.phone}</p>
                        </td>
                        <td className="px-5 py-4" style={{ color: "var(--text-secondary)" }}>{p.location?.city}</td>
                        <td className="px-5 py-4" style={{ color: "var(--text-primary)" }}>
                          ₹{(p.rentAmount || 0).toLocaleString()}
                          <span className="text-xs ml-1" style={{ color: "var(--text-secondary)" }}>/mo</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[currentStatus] || STATUS_STYLES.active}`}>
                            {currentStatus}
                          </span>
                        </td>
                        <td className="px-5 py-4" style={{ color: "var(--text-secondary)" }}>{p.views || 0}</td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleStatusToggle(p)} title={isSuspended ? "Restore" : "Suspend"}
                              className={`p-2 rounded-lg transition-colors ${isSuspended ? "text-green-400 hover:bg-green-500/10" : "text-amber-400 hover:bg-amber-500/10"}`}>
                              {isSuspended ? <ShieldCheckIcon className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                            </button>
                            <button onClick={() => handleDelete(p._id, p.title)} className="p-2 rounded-lg transition-colors" style={{ color: "var(--text-muted)" }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
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

export default AdminPropertiesPage;
