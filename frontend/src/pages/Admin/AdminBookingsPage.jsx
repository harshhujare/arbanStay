import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import {
  getAdminBookings,
  updateAdminBookingStatus,
  downloadCSV,
} from "../../api/adminApi";
import {
  CalendarCheck,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
} from "lucide-react";

const STATUS_STYLES = {
  pending:   "bg-amber-500/20 text-amber-400",
  confirmed: "bg-green-500/20 text-green-400",
  rejected:  "bg-red-500/20 text-red-400",
  cancelled: "bg-gray-500/20 text-gray-400",
};

const AdminBookingsPage = () => {
  const [data, setData] = useState({ data: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminBookings({
        page,
        limit: 15,
        status: statusFilter || undefined,
        from: fromDate || undefined,
        to: toDate || undefined,
      });
      setData(res);
    } catch {
      showToast("Failed to load bookings.");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, fromDate, toDate]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await updateAdminBookingStatus(bookingId, newStatus);
      showToast(`Booking status set to "${newStatus}".`);
      fetchBookings();
    } catch {
      showToast("Failed to update booking status.");
    }
  };

  const { pagination } = data;

  return (
    <AdminLayout>
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 text-white text-sm px-4 py-3 rounded-xl shadow-lg" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
          <CheckCheck className="w-4 h-4 text-green-400" />
          <span style={{ color: "var(--text-primary)" }}>{toast}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <CalendarCheck className="w-6 h-6 text-amber-400" />
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Bookings</h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{pagination?.total?.toLocaleString() || 0} total bookings</p>
            </div>
          </div>
          <button
            onClick={() => downloadCSV("bookings")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="flex items-center gap-2 flex-1">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
              className="flex-1 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
            />
            <span className="text-sm shrink-0" style={{ color: "var(--text-secondary)" }}>to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setPage(1); }}
              className="flex-1 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:border-amber-500"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide" style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
                  <th className="px-5 py-4 font-medium">Property</th>
                  <th className="px-5 py-4 font-medium">Guest</th>
                  <th className="px-5 py-4 font-medium">Host</th>
                  <th className="px-5 py-4 font-medium">Dates</th>
                  <th className="px-5 py-4 font-medium">Guests</th>
                  <th className="px-5 py-4 font-medium">Total</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} className="py-16 text-center"><div className="w-6 h-6 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                ) : data.data.length === 0 ? (
                  <tr><td colSpan={7} className="py-16 text-center" style={{ color: "var(--text-muted)" }}>No bookings found.</td></tr>
                ) : (
                  data.data.map((b) => (
                    <tr
                      key={b._id}
                      className="transition-colors"
                      style={{ borderBottom: "1px solid var(--border-color)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-5 py-4">
                        <p className="font-medium line-clamp-1 max-w-[160px]" style={{ color: "var(--text-primary)" }}>{b.propertyId?.title || "Deleted"}</p>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{b.propertyId?.location?.city}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p style={{ color: "var(--text-primary)" }}>{b.guestId?.name || "—"}</p>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{b.guestId?.phone}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p style={{ color: "var(--text-primary)" }}>{b.hostId?.name || "—"}</p>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{b.hostId?.phone}</p>
                      </td>
                      <td className="px-5 py-4 text-xs whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                        {new Date(b.checkIn).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        {" – "}
                        {new Date(b.checkOut).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-4" style={{ color: "var(--text-secondary)" }}>{b.guests}</td>
                      <td className="px-5 py-4 font-medium" style={{ color: "var(--text-primary)" }}>₹{(b.totalPrice || 0).toLocaleString()}</td>
                      <td className="px-5 py-4">
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b._id, e.target.value)}
                          className={`text-xs font-medium px-2 py-1 rounded-lg border-0 focus:ring-1 focus:ring-amber-500 cursor-pointer ${STATUS_STYLES[b.status] || ""} bg-transparent`}
                        >
                          <option value="pending">pending</option>
                          <option value="confirmed">confirmed</option>
                          <option value="rejected">rejected</option>
                          <option value="cancelled">cancelled</option>
                        </select>
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

export default AdminBookingsPage;
