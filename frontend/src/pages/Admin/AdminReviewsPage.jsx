import { useState, useEffect, useCallback } from "react";
import AdminLayout from "../../components/Admin/AdminLayout";
import { getAdminReviews, deleteAdminReview, downloadCSV } from "../../api/adminApi";
import { Star, Download, ChevronLeft, ChevronRight, CheckCheck, Trash2 } from "lucide-react";

const AdminReviewsPage = () => {
  const [data, setData] = useState({ data: [], pagination: {} });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState("");

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 3000); };

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminReviews({ page, limit: 15 });
      setData(res);
    } catch { showToast("Failed to load reviews."); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await deleteAdminReview(id);
      showToast("Review deleted.");
      fetchReviews();
    } catch { showToast("Failed to delete review."); }
  };

  const renderStars = (rating) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} className={`w-3.5 h-3.5 ${s <= rating ? "fill-amber-400 text-amber-400" : "fill-none"}`}
          style={s > rating ? { color: "var(--border-color)" } : {}} />
      ))}
    </div>
  );

  const { pagination } = data;

  return (
    <AdminLayout>
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 text-sm px-4 py-3 rounded-xl shadow-lg" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}>
          <CheckCheck className="w-4 h-4 text-green-400" /> {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
            <div>
              <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Reviews</h1>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{pagination?.total?.toLocaleString() || 0} total reviews</p>
            </div>
          </div>
          <button onClick={() => downloadCSV("reviews")} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide" style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
                  <th className="px-5 py-4 font-medium">Reviewer</th>
                  <th className="px-5 py-4 font-medium">Property</th>
                  <th className="px-5 py-4 font-medium">Rating</th>
                  <th className="px-5 py-4 font-medium">Comment</th>
                  <th className="px-5 py-4 font-medium">Date</th>
                  <th className="px-5 py-4 font-medium w-16"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="py-16 text-center"><div className="w-6 h-6 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                ) : data.data.length === 0 ? (
                  <tr><td colSpan={6} className="py-16 text-center" style={{ color: "var(--text-muted)" }}>No reviews found.</td></tr>
                ) : (
                  data.data.map((r) => (
                    <tr key={r._id} className="transition-colors" style={{ borderBottom: "1px solid var(--border-color)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
                            {r.userId?.profilePhoto ? (<img src={r.userId.profilePhoto} alt={r.userId.name} className="w-full h-full object-cover" />) : (r.userId?.name?.charAt(0)?.toUpperCase() || "?")}
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: "var(--text-primary)" }}>{r.userId?.name || "—"}</p>
                            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{r.userId?.email || r.userId?.phone || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium line-clamp-1 max-w-[200px]" style={{ color: "var(--text-primary)" }}>{r.propertyId?.title || "Deleted"}</p>
                        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{r.propertyId?.location?.city || "—"}</p>
                      </td>
                      <td className="px-5 py-4">{renderStars(r.rating)}</td>
                      <td className="px-5 py-4">
                        <p className="line-clamp-2 max-w-[260px]" style={{ color: "var(--text-secondary)" }}>{r.comment}</p>
                      </td>
                      <td className="px-5 py-4 text-xs whitespace-nowrap" style={{ color: "var(--text-secondary)" }}>
                        {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => handleDelete(r._id)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors" title="Delete review">
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

export default AdminReviewsPage;
