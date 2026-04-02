import { Home, LayoutDashboard, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import AuthModal from "../Auth/AuthModal";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState("login");

  const handleProtectedNavigation = (path) => {
    if (!isAuthenticated) {
      setAuthView("login");
      setIsAuthModalOpen(true);
    } else {
      navigate(path);
    }
  };

  const navItems = [
    {
      name: "Explore",
      path: "/",
      icon: Home,
      isProtected: false,
    },
    {
      name: "Dashboard",
      path: "/host/dashboard",
      icon: LayoutDashboard,
      isProtected: true,
    },
    {
      name: "Account",
      path: "/account",
      icon: User,
      isProtected: true,
    },
  ];

  return (
    <>
      {/* Bottom Navigation Bar - Mobile Only */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-md shadow-lg"
        style={{
          background: "var(--nav-bg)",
          borderTop: "1px solid var(--nav-border)",
        }}
      >
        <div className="flex items-center justify-around h-16 px-2 safe-bottom">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => {
                  if (item.isProtected) {
                    handleProtectedNavigation(item.path);
                  } else {
                    navigate(item.path);
                  }
                }}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-200 ${
                  isActive ? "text-[#FF5A5F]" : ""
                }`}
                style={!isActive ? { color: "var(--text-secondary)" } : {}}
              >
                {/* Icon */}
                <div className="relative">
                  <Icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 2}
                    className="transition-all duration-200"
                  />
                  {/* Active indicator line */}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#FF5A5F] rounded-full" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-xs font-medium transition-all duration-200 ${
                    isActive ? "font-semibold" : ""
                  }`}
                >
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialView={authView}
      />
    </>
  );
}
