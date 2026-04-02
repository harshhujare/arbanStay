import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import authService from "../../api/authService";
import ProfileImageUpload from "../../components/Account/ProfileImageUpload";
import {
  Save,
  Mail,
  Phone,
  User as UserIcon,
  Shield,
  Crown,
  Eye,
  Home,
  Sun,
  Moon,
} from "lucide-react";

export default function AccountPage() {
  const { user, isAuthenticated, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profilePhoto: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        profilePhoto: user.profilePhoto || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasChanges(true);
  };

  const handleImageUpdate = (newImageUrl) => {
    setFormData((prev) => ({ ...prev, profilePhoto: newImageUrl }));
    setHasChanges(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await authService.updateProfile(formData);
      updateUser(response.user);
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setHasChanges(false);
      setTimeout(() => {
        setMessage({ type: "", text: "" });
      }, 3000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Failed to update profile";
      setMessage({ type: "error", text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div
      className="min-h-screen py-12 px-4 sm:px-6 lg:px-8"
      style={{ background: "var(--bg-secondary)" }}
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Account
          </h1>
          <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
            {user.name}, {user.email}
          </p>
        </div>

        {/* Main Card */}
        <div
          className="rounded-xl shadow overflow-hidden"
          style={{ background: "var(--bg-card)" }}
        >
          <form onSubmit={handleSubmit}>
            {/* Profile Image Section */}
            <div
              className="px-6 py-8"
              style={{ borderBottom: "1px solid var(--border-color)" }}
            >
              <ProfileImageUpload
                currentImage={formData.profilePhoto}
                onImageUpdate={handleImageUpdate}
              />
            </div>

            {/* User Info Section */}
            <div
              className="px-6 py-6"
              style={{ borderBottom: "1px solid var(--border-color)" }}
            >
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <h2
                    className="text-xl font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {user.name}
                  </h2>
                  <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {user.email}
                  </p>
                </div>
                <div
                  className="flex items-center gap-2 px-3 py-1 rounded-lg"
                  style={{
                    background: "var(--badge-bg)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <Shield
                    className="w-4 h-4"
                    style={{ color: "var(--text-secondary)" }}
                  />
                  <span
                    className="text-sm font-medium capitalize"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Appearance Section */}
            <div
              className="px-6 py-6"
              style={{ borderBottom: "1px solid var(--border-color)" }}
            >
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Appearance
              </h3>
              <div
                className="flex items-center justify-between p-4 rounded-xl"
                style={{
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div className="flex items-center gap-3">
                  {theme === "dark" ? (
                    <Moon className="w-5 h-5 text-indigo-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-500" />
                  )}
                  <div>
                    <p
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {theme === "dark" ? "Dark Mode" : "Light Mode"}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Switch between light and dark appearance
                    </p>
                  </div>
                </div>
                {/* Toggle Switch */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                    theme === "dark" ? "bg-indigo-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                      theme === "dark" ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Account Type & Usage Section */}
            <div
              className="px-6 py-6"
              style={{ borderBottom: "1px solid var(--border-color)" }}
            >
              <h3
                className="text-lg font-semibold mb-4"
                style={{ color: "var(--text-primary)" }}
              >
                Account Plan
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold ${
                    (user.accountType || "free") === "premium"
                      ? "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200"
                      : ""
                  }`}
                  style={
                    (user.accountType || "free") !== "premium"
                      ? {
                          background: "var(--badge-bg)",
                          color: "var(--badge-text)",
                          border: "1px solid var(--border-color)",
                        }
                      : {}
                  }
                >
                  {(user.accountType || "free") === "premium" && (
                    <Crown className="w-4 h-4" />
                  )}
                  {(user.accountType || "free") === "premium"
                    ? "Premium"
                    : "Free"}{" "}
                  Plan
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ background: "var(--bg-secondary)" }}
                >
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Eye className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Contact Views
                    </p>
                    <p
                      className="font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {user.contactViewsUsed || 0} /{" "}
                      {(user.accountType || "free") === "premium" ? 10 : 1}
                      <span
                        className="text-xs font-normal"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {" "}
                        this month
                      </span>
                    </p>
                  </div>
                </div>
                <div
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ background: "var(--bg-secondary)" }}
                >
                  <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                    <Home className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p
                      className="text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Listings
                    </p>
                    <p
                      className="font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {user.propertiesListedThisMonth || 0} /{" "}
                      {(user.accountType || "free") === "premium" ? 20 : 2}
                      <span
                        className="text-xs font-normal"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {" "}
                        this month
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="px-6 py-6 space-y-6">
              {/* Name Field */}
              <div>
                <label
                  htmlFor="name"
                  className="flex items-center gap-2 text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  <UserIcon className="w-4 h-4" />
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  minLength={2}
                  maxLength={50}
                  className="w-full px-4 py-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  style={{
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="flex items-center gap-2 text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  <Mail className="w-4 h-4" />
                  Email Address
                  <span
                    className="text-xs font-normal"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    (Read-only)
                  </span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  readOnly
                  disabled
                  className="w-full px-4 py-3 rounded-lg cursor-not-allowed"
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-secondary)",
                  }}
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="flex items-center gap-2 text-sm font-medium mb-2"
                  style={{ color: "var(--text-primary)" }}
                >
                  <Phone className="w-4 h-4" />
                  Phone Number
                  <span
                    className="text-xs font-normal"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    (Verified)
                  </span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  readOnly
                  disabled
                  className="w-full px-4 py-3 rounded-lg cursor-not-allowed"
                  style={{
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-secondary)",
                  }}
                  placeholder="+91 XXXXXXXXXX"
                />
              </div>

              {/* Message Display */}
              {message.text && (
                <div
                  className={`p-4 rounded-lg ${
                    message.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {message.text}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div
              className="px-6 py-4 flex justify-end gap-3"
              style={{ background: "var(--bg-secondary)" }}
            >
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-6 py-2.5 rounded-lg transition-all font-medium"
                style={{
                  color: "var(--text-primary)",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !hasChanges}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>

        {/* Additional Info */}
        <div
          className="mt-6 text-center text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          <p>Member since {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
