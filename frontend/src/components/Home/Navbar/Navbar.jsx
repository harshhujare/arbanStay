import { useState, useEffect, useRef } from "react";
import { Menu, Crown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import AuthModal from "../../Auth/AuthModal";
import { useAuth } from "../../../context/AuthContext";
import reactLogo from "../../../assets/ueban-stayLogo.png";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState("login");
  const menuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsAtTop(scrollPosition === 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const openAuthModal = () => {
    setIsAuthModalOpen(true);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const handleBecomeHost = () => {
    if (!isAuthenticated) {
      openAuthModal();
    } else {
      navigate("/host/dashboard");
    }
  };

  return (
    <>
      <nav
        className="w-full sticky top-0 z-50 transition-all duration-500 ease-in-out"
        style={{
          background: "var(--nav-bg)",
          borderBottom: "1px solid var(--nav-border)",
          paddingTop: isAtTop ? "1.5rem" : "0.75rem",
          paddingBottom: isAtTop ? "1.5rem" : "0.75rem",
        }}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 flex items-center justify-between gap-2 md:gap-4 transition-all duration-500">
          {/* Left: Logo */}
          <Link to="/" className="hidden md:flex items-center flex-shrink-0">
            <img
              src={reactLogo}
              alt="UrbanStay Logo"
              className="h-9 sm:h-10 md:h-12 cursor-pointer"
            />
          </Link>

          {/* Middle: Search bar */}
          <div className="flex-1 md:flex-initial mx-2 sm:mx-4">
            <SearchBar isAtTop={isAtTop} />
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Become a Host Button */}
            <button
              onClick={handleBecomeHost}
              className="hidden md:block font-medium px-3 py-2 rounded-full transition"
              style={{ color: "var(--text-primary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {isAuthenticated &&
              (user?.role === "host" || user?.role === "admin")
                ? "Host Dashboard"
                : "Become a Host"}
            </button>

            {/* Upgrade / Premium Badge */}
            {isAuthenticated &&
              ((user?.accountType || "free") === "free" ? (
                <button
                  onClick={() => {
                    navigate("/pricing");
                  }}
                  className="hidden md:flex items-center gap-1.5 font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded-full transition border border-amber-200"
                >
                  <Crown size={14} />
                  Upgrade
                </button>
              ) : (
                <span className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                  <Crown size={12} />
                  Premium
                </span>
              ))}

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full cursor-pointer hover:shadow-md transition"
                style={{
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-card)",
                }}
              >
                <Menu size={18} className="sm:h-5 sm:w-5" style={{ color: "var(--text-primary)" }} />
              </button>

              {/* Dropdown Menu */}
              {isOpen && (
                <div
                  className="absolute right-0 top-12 sm:top-14 w-52 sm:w-60 rounded-xl shadow-xl overflow-hidden py-2 z-50"
                  style={{
                    background: "var(--dropdown-bg)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <div className="flex flex-col">
                    {isAuthenticated ? (
                      <>
                        {/* Logged In Menu */}
                        <div
                          className="px-3 sm:px-4 py-2.5 sm:py-3"
                          style={{ borderBottom: "1px solid var(--border-color)" }}
                        >
                          <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                            Hello, {user?.name}!
                          </p>
                          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{user?.email}</p>
                        </div>

                        <button
                          className="text-left px-3 sm:px-4 py-2.5 sm:py-3 text-sm transition"
                          style={{ color: "var(--text-primary)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          My Bookings
                        </button>
                        {user?.role === "host" && (
                          <>
                            <button
                              onClick={() => {
                                navigate("/host/dashboard");
                                setIsOpen(false);
                              }}
                              className="text-left px-3 sm:px-4 py-2.5 sm:py-3 text-sm transition"
                              style={{ color: "var(--text-primary)" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              Host Dashboard
                            </button>
                            <button
                              className="text-left px-3 sm:px-4 py-2.5 sm:py-3 text-sm transition"
                              style={{ color: "var(--text-primary)" }}
                              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                            >
                              My Listings
                            </button>
                          </>
                        )}

                        <div className="h-[1px] my-1" style={{ background: "var(--border-color)" }}></div>

                        <button
                          onClick={() => {
                            navigate("/account");
                            setIsOpen(false);
                          }}
                          className="text-left px-3 sm:px-4 py-2.5 sm:py-3 text-sm transition"
                          style={{ color: "var(--text-primary)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          Account Settings
                        </button>

                        {/* Upgrade to Premium - only for free users */}
                        {(user?.accountType || "free") === "free" && (
                          <button
                            onClick={() => {
                              navigate("/pricing");
                              setIsOpen(false);
                            }}
                            className="text-left px-3 sm:px-4 py-2.5 sm:py-3 text-sm transition flex items-center gap-2 text-amber-700 font-medium hover:bg-amber-50"
                          >
                            <Crown size={14} />
                            Upgrade to Premium
                          </button>
                        )}
                        <button
                          className="text-left px-3 sm:px-4 py-2.5 sm:py-3 text-sm transition"
                          style={{ color: "var(--text-primary)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          Help Center
                        </button>

                        <div className="h-[1px] my-1" style={{ background: "var(--border-color)" }}></div>

                        <button
                          onClick={handleLogout}
                          className="text-left px-3 sm:px-4 py-2.5 sm:py-3 text-sm transition"
                          style={{ color: "var(--text-primary)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          Log out
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Logged Out Menu */}
                        <button
                          onClick={openAuthModal}
                          className="text-left px-3 sm:px-4 py-2.5 sm:py-3 font-semibold text-sm transition"
                          style={{ color: "var(--text-primary)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          Log in or sign up
                        </button>

                        <div className="h-[1px] my-1" style={{ background: "var(--border-color)" }}></div>

                        <button
                          className="text-left px-3 sm:px-4 py-2.5 sm:py-3 text-sm transition"
                          style={{ color: "var(--text-primary)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          List your room
                        </button>
                        <button
                          className="text-left px-3 sm:px-4 py-2.5 sm:py-3 text-sm transition"
                          style={{ color: "var(--text-primary)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          Help Center
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
