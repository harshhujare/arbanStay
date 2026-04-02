import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck,
  CreditCard,
  Star,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/properties", label: "Properties", icon: Building2 },
  { to: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
  { to: "/admin/transactions", label: "Transactions", icon: CreditCard },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* ── Sidebar ── */}
      <aside
        className="w-64 shrink-0 flex-col hidden md:flex"
        style={{ background: "var(--bg-card)", borderRight: "1px solid var(--border-color)" }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2 px-6 py-5"
          style={{ borderBottom: "1px solid var(--border-color)" }}
        >
          <ShieldCheck className="w-6 h-6 text-indigo-400" />
          <span className="text-lg font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            UrbanStay <span className="text-indigo-400">Admin</span>
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/30"
                    : ""
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? {}
                  : { color: "var(--text-secondary)" }
              }
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains("bg-indigo-600")) {
                  e.currentTarget.style.background = "var(--bg-hover)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.classList.contains("bg-indigo-600")) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div
          className="px-4 py-4"
          style={{ borderTop: "1px solid var(--border-color)" }}
        >
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white uppercase">
              {user?.name?.[0] || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                {user?.name}
              </p>
              <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-30 px-4 py-3 flex items-center justify-between"
        style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-color)" }}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>UrbanStay Admin</span>
        </div>
        <div className="flex items-center gap-2">
          {navItems.map(({ to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `p-2 rounded-lg transition-colors ${isActive ? "bg-indigo-600 text-white" : ""}`
              }
              style={({ isActive }) =>
                isActive ? {} : { color: "var(--text-secondary)" }
              }
            >
              <Icon className="w-4 h-4" />
            </NavLink>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto md:p-8 p-4 pt-16 md:pt-8">{children}</main>
    </div>
  );
};

export default AdminLayout;
