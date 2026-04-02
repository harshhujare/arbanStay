import { useState, useEffect, useRef } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext";
import PropTypes from "prop-types";
import "./UnifiedAuthModal.css";

const UnifiedAuthModal = ({ onSuccess }) => {
  // ==================== STATE MANAGEMENT ====================
  const [stage, setStage] = useState("initial"); // initial | otp-login | phone-verify | otp-link
  const [formData, setFormData] = useState({
    phoneNumber: "",
    otp: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const otpInputRef = useRef(null);
  const { sendOtp, verifyOtp, linkPhone, googleLogin } = useAuth();

  // ==================== EFFECTS ====================

  // Auto-focus OTP input when stage changes to otp
  useEffect(() => {
    if (stage === "otp" && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [stage]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // ==================== VALIDATION ====================

  const validatePhone = (phone) => {
    if (!phone || phone.length !== 10) {
      return "Please enter a valid 10-digit phone number";
    }
    if (!/^\d{10}$/.test(phone)) {
      return "Phone number must contain only digits";
    }
    return null;
  };

  const validateOtp = (otp) => {
    if (!otp || otp.length !== 4) {
      return "Please enter the 4-digit OTP";
    }
    if (!/^\d{4}$/.test(otp)) {
      return "OTP must contain only digits";
    }
    return null;
  };

  // ==================== HANDLERS ====================

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only digits
    if (value.length <= 10) {
      setFormData({ ...formData, phoneNumber: value });
      setError("");
    }
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only digits
    if (value.length <= 4) {
      setFormData({ ...formData, otp: value });
      setError("");
    }
  };

  const startResendTimer = () => {
    setResendTimer(60);
  };

  // ==================== GOOGLE AUTH FLOW ====================

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError("");

    try {
      const result = await googleLogin(credentialResponse.credential);

      if (!result.user.phoneVerified) {
        // User doesn't have a verified phone — offer optional phone verification
        setStage("phone-verify");
      } else {
        // User already has verified phone — close modal
        onSuccess();
      }
    } catch (error) {
      setError(
        error.response?.data?.message || error.message || "Google login failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
  };

  // ==================== PHONE LOGIN FLOW (primary login) ====================

  const handleSendOtpLogin = async () => {
    setError("");

    const validationError = validatePhone(formData.phoneNumber);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await sendOtp(formData.phoneNumber);
      setStage("otp-login");
      startResendTimer();
    } catch (error) {
      setError(
        error.response?.data?.message || error.message || "Failed to send OTP",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpLogin = async () => {
    setError("");

    const validationError = validateOtp(formData.otp);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await verifyOtp(formData.phoneNumber, formData.otp);
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // ==================== PHONE VERIFY FLOW (after Google signup) ====================

  const handleSendOtpLink = async () => {
    setError("");

    const validationError = validatePhone(formData.phoneNumber);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await sendOtp(formData.phoneNumber);
      setStage("otp-link");
      startResendTimer();
    } catch (error) {
      setError(
        error.response?.data?.message || error.message || "Failed to send OTP",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpLink = async () => {
    setError("");

    const validationError = validateOtp(formData.otp);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await linkPhone(formData.phoneNumber, formData.otp);
      // Phone linked successfully — close modal
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setError("");
    setLoading(true);
    try {
      await sendOtp(formData.phoneNumber);
      setFormData({ ...formData, otp: "" });
      startResendTimer();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to resend OTP",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // User chose to skip phone verification — they're already logged in
    onSuccess();
  };

  // ==================== RENDER STAGES ====================

  const renderInitialStage = () => (
    <div className="auth-stage">
      <h2 className="auth-title">Welcome to UrbanStay</h2>

      <div className="form-group">
        <label className="form-label">PHONE NUMBER</label>
        <div className="phone-input-wrapper">
          <span className="phone-prefix">+91</span>
          <input
            type="tel"
            inputMode="numeric"
            className="form-input phone-input"
            placeholder="Enter 10-digit number"
            value={formData.phoneNumber}
            onChange={handlePhoneChange}
            maxLength="10"
          />
        </div>
      </div>

      <p className="auth-info">
        We'll text you to confirm your number. Standard message and data rates
        apply.
      </p>

      <button
        className="btn btn-primary btn-block"
        onClick={handleSendOtpLogin}
        disabled={loading || formData.phoneNumber.length !== 10}
      >
        {loading ? "Sending..." : "Continue"}
      </button>

      <div className="auth-divider">
        <span>or</span>
      </div>

      <div className="google-login-wrapper">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          text="continue_with"
          width="100%"
        />
      </div>

      {loading && (
        <p className="auth-info" style={{ textAlign: "center" }}>
          Signing you in...
        </p>
      )}
    </div>
  );

  const renderPhoneVerifyStage = () => (
    <div className="auth-stage">
      <h2 className="auth-title">Verify Your Phone Number</h2>
      <p className="auth-info">
        Add your phone number for a better experience. You'll need it to contact owners, get directions, and list properties.
      </p>

      <div className="form-group">
        <label className="form-label">Phone number</label>
        <div className="phone-input-wrapper">
          <span className="phone-prefix">+91</span>
          <input
            type="tel"
            inputMode="numeric"
            className="form-input phone-input"
            placeholder="Enter 10-digit number"
            value={formData.phoneNumber}
            onChange={handlePhoneChange}
            maxLength="10"
            autoFocus
          />
        </div>
      </div>

      <p className="auth-info">
        We'll text you to confirm your number. Standard message and data rates
        apply.
      </p>

      <button
        className="btn btn-primary btn-block"
        onClick={handleSendOtpLink}
        disabled={loading || formData.phoneNumber.length !== 10}
      >
        {loading ? "Sending..." : "Verify Now"}
      </button>

      <button
        className="btn btn-link btn-block"
        onClick={handleSkip}
        style={{ marginTop: "4px" }}
      >
        Skip for now →
      </button>
    </div>
  );

  const renderOtpLoginStage = () => (
    <div className="auth-stage">
      <div className="otp-header">
        <p className="otp-sent-to">OTP sent to +91 {formData.phoneNumber}</p>
        <button
          className="btn-link"
          onClick={() => {
            setStage("initial");
            setFormData({ ...formData, otp: "" });
            setError("");
          }}
        >
          Change
        </button>
      </div>

      <div className="form-group">
        <label className="form-label">Enter 4-Digit OTP</label>
        <input
          ref={otpInputRef}
          type="text"
          inputMode="numeric"
          className="form-input otp-input"
          placeholder="• • • •"
          value={formData.otp}
          onChange={handleOtpChange}
          maxLength="4"
        />
      </div>

      <button
        className="btn btn-primary btn-block"
        onClick={handleVerifyOtpLogin}
        disabled={loading || formData.otp.length !== 4}
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      <button
        className="btn btn-link"
        onClick={handleResendOtp}
        disabled={resendTimer > 0}
      >
        {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
      </button>
    </div>
  );

  const renderOtpLinkStage = () => (
    <div className="auth-stage">
      <div className="otp-header">
        <p className="otp-sent-to">OTP sent to +91 {formData.phoneNumber}</p>
        <button
          className="btn-link"
          onClick={() => {
            setStage("phone-verify");
            setFormData({ ...formData, otp: "" });
            setError("");
          }}
        >
          Change
        </button>
      </div>

      <div className="form-group">
        <label className="form-label">Enter 4-Digit OTP</label>
        <input
          ref={otpInputRef}
          type="text"
          inputMode="numeric"
          className="form-input otp-input"
          placeholder="• • • •"
          value={formData.otp}
          onChange={handleOtpChange}
          maxLength="4"
        />
      </div>

      <button
        className="btn btn-primary btn-block"
        onClick={handleVerifyOtpLink}
        disabled={loading || formData.otp.length !== 4}
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      <button
        className="btn btn-link"
        onClick={handleResendOtp}
        disabled={resendTimer > 0}
      >
        {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend OTP"}
      </button>

      <button
        className="btn btn-link btn-block"
        onClick={handleSkip}
        style={{ marginTop: "0" }}
      >
        Skip for now →
      </button>
    </div>
  );

  // ==================== MAIN RENDER ====================

  return (
    <div className="unified-auth-modal">
      {/* Error Display */}
      {error && (
        <div className="error-alert">
          <p>{error}</p>
        </div>
      )}

      {/* Stage Rendering */}
      {stage === "initial" && renderInitialStage()}
      {stage === "otp-login" && renderOtpLoginStage()}
      {stage === "phone-verify" && renderPhoneVerifyStage()}
      {stage === "otp-link" && renderOtpLinkStage()}
    </div>
  );
};

UnifiedAuthModal.propTypes = {
  onSuccess: PropTypes.func.isRequired,
};

export default UnifiedAuthModal;
