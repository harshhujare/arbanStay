import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import { getAdminTransactions, downloadCSV } from "../../api/adminApi";
import {
  CreditCard,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
  Search,
} from "lucide-react";

const STATUS_STYLES = {
  success: "bg-green-500/20 text-green-400",
  failed: "bg-red-500/20 text-red-400",
};

const AdminTransactionsPage = () => {
  const [data, setData] = useState({ data: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminTransactions({
        page, limit: 15,
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setData(res);
    } catch {
      showToast("Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, search]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const { pagination } = data;

  return (
    <AdminLayout>
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 text-sm px-4 py-3 rounded-xl shadow-lg" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
          <CheckCheck className="w-4 h-4 text-green-400" />
          {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <CreditCard className="w-6 h-6 text-emerald-400" />
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Transactions</h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{pagination?.total?.toLocaleString() || 0} total transactions</p>
            </div>
          </div>
          <button onClick={() => downloadCSV("transactions")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
            <option value="">All Statuses</option>
            <option value="success">Success</option>
            <option value="failed">Failed</option>
          </select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
            <input type="text" placeholder="Search by order/payment ID..." value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }} />
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide" style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
                  <th className="px-5 py-4 font-medium">User</th>
                  <th className="px-5 py-4 font-medium">Order ID</th>
                  <th className="px-5 py-4 font-medium">Payment ID</th>
                  <th className="px-5 py-4 font-medium">Amount</th>
                  <th className="px-5 py-4 font-medium">Purpose</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="py-16 text-center"><div className="w-6 h-6 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                ) : data.data.length === 0 ? (
                  <tr><td colSpan={7} className="py-16 text-center" style={{ color: "var(--text-muted)" }}>No transactions found.</td></tr>
                ) : (
                  data.data.map((t) => (
                    <tr key={t._id} className="transition-colors" style={{ borderBottom: "1px solid var(--border-color)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium" style={{ color: "var(--text-primary)" }}>{t.userId?.name || "—"}</p>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{t.userId?.email || t.userId?.phone || "—"}</p>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>{t.razorpay_order_id}</td>
                      <td className="px-5 py-4 font-mono text-xs" style={{ color: "var(--text-secondary)" }}>{t.razorpay_payment_id}</td>
                      <td className="px-5 py-4 font-medium" style={{ color: "var(--text-primary)" }}>₹{((t.amount || 0) / 100).toFixed(2)}</td>
                      <td className="px-5 py-4 capitalize" style={{ color: "var(--text-secondary)" }}>{t.purpose?.replace(/_/g, " ")}</td>
                      <td className="px-5 py-4"><span className={`text-xs font-medium px-2.5 py-1 rounded-lg ${STATUS_STYLES[t.status] || ""}`}>{t.status}</span></td>
                      <td className="px-5 py-4 text-xs whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>{new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
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

export default AdminTransactionsPage;
