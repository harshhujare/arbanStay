import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import PhoneAuthForm from "./PhoneAuthForm";
import GoogleAuthButton from "./GoogleAuthButton";
import PropTypes from "prop-types";

export default function LoginForm({ onSuccess }) {
  const { login } = useAuth();
  const [authMode, setAuthMode] = useState("email"); // "email" or "phone"
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error on input
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await login(formData);
      onSuccess(); // Close modal on success
    } catch (error) {
      setError(error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab Selector */}
      <div className="flex border-b border-gray-200">
        <button
          type="button"
          onClick={() => {
            setAuthMode("email");
            setError("");
          }}
          className={`flex-1 py-2 text-sm font-medium transition ${
            authMode === "email"
              ? "text-[#FF385C] border-b-2 border-[#FF385C]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => {
            setAuthMode("phone");
            setError("");
          }}
          className={`flex-1 py-2 text-sm font-medium transition ${
            authMode === "phone"
              ? "text-[#FF385C] border-b-2 border-[#FF385C]"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Phone
        </button>
      </div>

      {/* Email Login Form */}
      {authMode === "email" ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
            style={{
              background: loading
                ? "#cccccc"
                : "linear-gradient(to right, #FF385C, #E31C5F)",
            }}
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Sign-In */}
          <GoogleAuthButton onSuccess={onSuccess} mode="signin" />
        </form>
      ) : (
        // Phone Login Form
        <PhoneAuthForm onSuccess={onSuccess} />
      )}
    </div>
  );
}

LoginForm.propTypes = {
  onSuccess: PropTypes.func.isRequired,
};
