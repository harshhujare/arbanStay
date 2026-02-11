import { X } from "lucide-react";
import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthModal({ isOpen, onClose, initialView = "login" }) {
  const [view, setView] = useState(initialView); // "login" or "register"

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {view === "login" ? "Log in" : "Sign up"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Forms */}
        <div className="p-6">
          {view === "login" ? (
            <LoginForm onSuccess={onClose} />
          ) : (
            <RegisterForm onSuccess={onClose} />
          )}
        </div>

        {/* Toggle */}
        <div className="p-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            {view === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              onClick={() => setView(view === "login" ? "register" : "login")}
              className="font-semibold hover:underline"
              style={{ color: "#FF385C" }}
            >
              {view === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
