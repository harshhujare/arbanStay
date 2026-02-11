import { useState, useEffect, useRef } from "react";
import { Menu } from "lucide-react";
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
  const [authView, setAuthView] = useState("login"); // "login" or "register"
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

  const openAuthModal = (view) => {
    setAuthView(view);
    setIsAuthModalOpen(true);
    setIsOpen(false); // Close dropdown when opening modal
  };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  const handleBecomeHost = () => {
    if (!isAuthenticated) {
      // Open login modal first
      openAuthModal("login");
    } else {
      // Navigate to host dashboard
      navigate("/host/dashboard");
    }
  };

  return (
    <>
      <nav
        className="w-full  sticky top-0 z-50 transition-all duration-500 ease-in-out"
        style={{
          background: "linear-gradient(180deg, #ffffff 39.9%, #f8f8f8 100%)",
          height: isAtTop ? "auto" : "auto",
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
              className="hidden md:block font-medium text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-full transition"
            >
              {isAuthenticated &&
              (user?.role === "host" || user?.role === "admin")
                ? "Host Dashboard"
                : "Become a Host"}
            </button>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full cursor-pointer hover:shadow-md transition border border-gray-300 bg-white"
              >
                <Menu size={18} className="sm:h-5 sm:w-5 text-gray-700" />
              </button>

              {/* Dropdown Menu */}
              {isOpen && (
                <div className="absolute right-0 top-12 sm:top-14 w-52 sm:w-60 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-2 z-50">
                  <div className="flex flex-col">
                    {isAuthenticated ? (
                      <>
                        {/* Logged In Menu */}
                        <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-200">
                          <p className="font-semibold text-sm">
                            Hello, {user?.name}!
                          </p>
                          <p className="text-xs text-gray-500">{user?.email}</p>
                        </div>

                        <button className="text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 text-sm transition">
                          My Bookings
                        </button>
                        {user?.role === "host" && (
                          <button className="text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 text-sm transition">
                            My Listings
                          </button>
                        )}

                        <div className="h-[1px] bg-gray-200 my-1"></div>

                        <button className="text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 text-sm transition">
                          Account Settings
                        </button>
                        <button className="text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 text-sm transition">
                          Help Center
                        </button>

                        <div className="h-[1px] bg-gray-200 my-1"></div>

                        <button
                          onClick={handleLogout}
                          className="text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 text-sm transition"
                        >
                          Log out
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Logged Out Menu */}
                        <button
                          onClick={() => openAuthModal("register")}
                          className="text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 font-semibold text-sm transition"
                        >
                          Sign up
                        </button>
                        <button
                          onClick={() => openAuthModal("login")}
                          className="text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 text-sm transition"
                        >
                          Log in
                        </button>

                        <div className="h-[1px] bg-gray-200 my-1"></div>

                        <button className="text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 text-sm transition">
                          List your room
                        </button>
                        <button className="text-left px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-gray-50 text-sm transition">
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
        initialView={authView}
      />
    </>
  );
}
