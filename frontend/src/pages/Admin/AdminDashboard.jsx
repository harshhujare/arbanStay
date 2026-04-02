import { useEffect, useState } from "react";
import { getAdminStats } from "../../api/adminApi";
import AdminLayout from "../../components/Admin/AdminLayout";
import {
  Users,
  Building2,
  CalendarCheck,
  IndianRupee,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const STATUS_COLORS = {
  pending: "#f59e0b",
  confirmed: "#22c55e",
  rejected: "#ef4444",
  cancelled: "#6b7280",
};

const StatCard = ({ icon: Icon, label, value, sub, color = "indigo" }) => {
  const colors = {
    indigo: "from-indigo-500/20 to-indigo-600/10 border-indigo-500/30 text-indigo-400",
    green:  "from-green-500/20 to-green-600/10 border-green-500/30 text-green-400",
    amber:  "from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-400",
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400",
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-2xl p-5 flex items-center gap-4`}>
      <div className="p-3 rounded-xl" style={{ background: "var(--bg-hover)" }}>
        <Icon className={`w-6 h-6 text-${color}-400`} />
      </div>
      <div>
        <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>{label}</p>
        <p className="text-2xl font-bold mt-0.5" style={{ color: "var(--text-primary)" }}>{value}</p>
        {sub && <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{sub}</p>}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch(() => setError("Failed to load stats."))
      .finally(() => setLoading(false));
  }, []);

  const monthlyData = stats?.monthlyBookings?.map((m) => ({
    name: MONTH_NAMES[(m._id.month || 1) - 1],
    Bookings: m.count,
    Revenue: Math.round((m.revenue || 0) / 1000),
  })) || [];

  const pieData = stats
    ? Object.entries(stats.bookingStatusBreakdown || {}).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }))
    : [];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64 text-red-400">{error}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-indigo-400" />
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>Dashboard</h1>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>UrbanStay platform overview</p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total Users"
            value={stats.totalUsers?.toLocaleString()}
            sub={`${stats.totalHosts} hosts · ${stats.totalGuests} guests`}
            color="indigo"
          />
          <StatCard icon={Building2} label="Total Properties" value={stats.totalProperties?.toLocaleString()} color="purple" />
          <StatCard icon={CalendarCheck} label="Total Bookings" value={stats.totalBookings?.toLocaleString()} color="amber" />
          <StatCard
            icon={IndianRupee}
            label="Confirmed Revenue"
            value={`₹${(stats.totalRevenue || 0).toLocaleString()}`}
            sub="from confirmed bookings"
            color="green"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Bar chart */}
          <div className="xl:col-span-2 rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>Bookings & Revenue (last 6 months)</h2>
            </div>
            {monthlyData.length === 0 ? (
              <p className="text-sm text-center py-10" style={{ color: "var(--text-muted)" }}>No booking data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis dataKey="name" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 8 }}
                    labelStyle={{ color: "var(--text-primary)" }}
                  />
                  <Bar dataKey="Bookings" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie chart */}
          <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
            <h2 className="font-semibold mb-6" style={{ color: "var(--text-primary)" }}>Booking Status</h2>
            {pieData.length === 0 ? (
              <p className="text-sm text-center py-10" style={{ color: "var(--text-muted)" }}>No data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="45%" innerRadius={60} outerRadius={90} dataKey="value" paddingAngle={3}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={STATUS_COLORS[entry.name.toLowerCase()] || "#6366f1"} />
                    ))}
                  </Pie>
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(v) => <span style={{ color: "var(--text-secondary)", fontSize: 12 }}>{v}</span>}
                  />
                  <Tooltip
                    contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: 8 }}
                    labelStyle={{ color: "var(--text-primary)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent signups */}
        <div className="rounded-2xl p-6" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
          <h2 className="font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Recent Signups</h2>
          {!stats.recentUsers?.length ? (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>No users yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide" style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)" }}>
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Phone</th>
                    <th className="pb-3 font-medium">Role</th>
                    <th className="pb-3 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentUsers.map((u) => (
                    <tr
                      key={u._id}
                      className="transition-colors"
                      style={{ borderBottom: "1px solid var(--border-color)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td className="py-3 font-medium" style={{ color: "var(--text-primary)" }}>{u.name}</td>
                      <td className="py-3" style={{ color: "var(--text-secondary)" }}>{u.phone}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.role === "host"
                              ? "bg-purple-500/20 text-purple-400"
                              : "bg-indigo-500/20 text-indigo-400"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3" style={{ color: "var(--text-secondary)" }}>
                        {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
