import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import PropTypes from "prop-types";
import { X, Phone, ShieldCheck } from "lucide-react";
import "./PhoneVerifyModal.css";

/**
 * PhoneVerifyModal - Popup for phone verification
 * Shows when user tries to access phone-gated features:
 * - Contact Owner
 * - Get Directions
 * - List Property
 */
const PhoneVerifyModal = ({ isOpen, onClose, onVerified }) => {
  const [stage, setStage] = useState("phone"); // phone | otp
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const otpInputRef = useRef(null);
  const { sendOtp, linkPhone } = useAuth();

  // Auto-focus OTP input
  useEffect(() => {
    if (stage === "otp" && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [stage]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStage("phone");
      setPhoneNumber("");
      setOtp("");
      setError("");
      setLoading(false);
      setResendTimer(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setPhoneNumber(value);
      setError("");
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 4) {
      setOtp(value);
      setError("");
    }
  };

  const handleSendOtp = async () => {
    setError("");

    if (!phoneNumber || phoneNumber.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    try {
      await sendOtp(phoneNumber);
      setStage("otp");
      setResendTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");

    if (!otp || otp.length !== 4) {
      setError("Please enter the 4-digit OTP");
      return;
    }

    setLoading(true);
    try {
      await linkPhone(phoneNumber, otp);
      // Phone verified successfully
      if (onVerified) onVerified();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError("");
    setLoading(true);
    try {
      await sendOtp(phoneNumber);
      setOtp("");
      setResendTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="phone-verify-overlay" onClick={onClose}>
      <div className="phone-verify-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="phone-verify-header">
          <div className="phone-verify-icon-wrap">
            <ShieldCheck className="phone-verify-icon" />
          </div>
          <button className="phone-verify-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <h2 className="phone-verify-title">Verify Your Phone Number</h2>
        <p className="phone-verify-subtitle">
          Phone verification is required to access this feature. This helps keep our community safe.
        </p>

        {/* Error */}
        {error && (
          <div className="phone-verify-error">
            <p>{error}</p>
          </div>
        )}

        {stage === "phone" ? (
          /* Phone Input Stage */
          <div className="phone-verify-form">
            <label className="phone-verify-label">Phone Number</label>
            <div className="phone-verify-input-wrap">
              <span className="phone-verify-prefix">+91</span>
              <input
                type="tel"
                inputMode="numeric"
                className="phone-verify-input"
                placeholder="Enter 10-digit number"
                value={phoneNumber}
                onChange={handlePhoneChange}
                maxLength="10"
                autoFocus
              />
            </div>
            <p className="phone-verify-hint">
              We'll send you a 4-digit verification code via SMS
            </p>
            <button
              className="phone-verify-btn"
              onClick={handleSendOtp}
              disabled={loading || phoneNumber.length !== 10}
            >
              {loading ? (
                <>
                  <div className="phone-verify-spinner"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Phone size={18} />
                  Send OTP
                </>
              )}
            </button>
          </div>
        ) : (
          /* OTP Verification Stage */
          <div className="phone-verify-form">
            <div className="phone-verify-otp-header">
              <p className="phone-verify-sent-to">
                OTP sent to <strong>+91 {phoneNumber}</strong>
              </p>
              <button
                className="phone-verify-change"
                onClick={() => { setStage("phone"); setOtp(""); setError(""); }}
              >
                Change
              </button>
            </div>

            <label className="phone-verify-label">Enter 4-Digit OTP</label>
            <input
              ref={otpInputRef}
              type="text"
              inputMode="numeric"
              className="phone-verify-input phone-verify-otp-input"
              placeholder="• • • •"
              value={otp}
              onChange={handleOtpChange}
              maxLength="4"
            />

            <button
              className="phone-verify-btn"
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 4}
            >
              {loading ? (
                <>
                  <div className="phone-verify-spinner"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <ShieldCheck size={18} />
                  Verify & Continue
                </>
              )}
            </button>

            <button
              className="phone-verify-resend"
              onClick={handleResendOtp}
              disabled={resendTimer > 0}
            >
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

PhoneVerifyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onVerified: PropTypes.func,
};

export default PhoneVerifyModal;
