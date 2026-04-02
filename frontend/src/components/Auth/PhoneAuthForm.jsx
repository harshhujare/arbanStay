import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import PropTypes from "prop-types";

export default function PhoneAuthForm({ onSuccess }) {
  const { sendOtp, verifyOtp } = useAuth();
  const [stage, setStage] = useState("phone"); // "phone" or "otp"
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Start resend countdown timer
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate phone number (10 digits)
    if (!phoneNumber || phoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      setLoading(false);
      return;
    }

    try {
      // Send OTP
      const result = await sendOtp(phoneNumber);

      // Check if this is a new user based on backend response
      setIsNewUser(result.isNewUser || false);

      // Move to OTP stage
      setStage("otp");
      startResendTimer();
    } catch (error) {
      setError(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!otp || otp.length !== 4) {
      setError("Please enter the 4-digit OTP");
      setLoading(false);
      return;
    }

    // If new user, require name
    if (isNewUser && !name.trim()) {
      setError("Please enter your name");
      setLoading(false);
      return;
    }

    try {
      await verifyOtp(phoneNumber, otp, isNewUser ? name : null);
      onSuccess(); // Close modal on success
    } catch (error) {
      setError(error.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    setError("");
    setOtp(""); // Clear previous OTP

    try {
      await sendOtp(phoneNumber);
      startResendTimer();
    } catch (error) {
      setError(error.message || "Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStage("phone");
    setOtp("");
    setName("");
    setError("");
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {stage === "phone" ? (
        // Stage 1: Phone Number Entry
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Phone Number
            </label>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-600 text-sm">
                +91
              </span>
              <input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ""); // Only digits
                  if (value.length <= 10) {
                    setPhoneNumber(value);
                  }
                }}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition"
                placeholder="Enter 10-digit number"
                maxLength="10"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              We'll send you a 4-digit verification code
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || phoneNumber.length !== 10}
            className="w-full py-3 rounded-lg font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
            style={{
              background:
                loading || phoneNumber.length !== 10
                  ? "#cccccc"
                  : "linear-gradient(to right, #FF385C, #E31C5F)",
            }}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      ) : (
        // Stage 2: OTP Verification
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              OTP sent to{" "}
              <span className="font-semibold">+91 {phoneNumber}</span>
              <button
                type="button"
                onClick={handleBackToPhone}
                className="ml-2 text-[#FF385C] hover:underline text-xs"
              >
                Change
              </button>
            </p>

            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Enter 4-Digit OTP
            </label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, ""); // Only digits
                if (value.length <= 4) {
                  setOtp(value);
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition text-center text-2xl tracking-widest"
              placeholder="• • • •"
              maxLength="4"
              autoFocus
            />
          </div>

          {isNewUser && (
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent transition"
                placeholder="Enter your full name"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 4}
            className="w-full py-3 rounded-lg font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
            style={{
              background:
                loading || otp.length !== 4
                  ? "#cccccc"
                  : "linear-gradient(to right, #FF385C, #E31C5F)",
            }}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendTimer > 0 || loading}
              className="text-sm text-[#FF385C] hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
            >
              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

PhoneAuthForm.propTypes = {
  onSuccess: PropTypes.func.isRequired,
};
