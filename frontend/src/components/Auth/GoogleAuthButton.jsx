import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "../../context/AuthContext";
import PropTypes from "prop-types";

export default function GoogleAuthButton({ onSuccess, mode = "signin" }) {
  const { googleLogin } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential);
      onSuccess(); // Close modal on success
    } catch (error) {
      console.error("Google auth error:", error);
    }
  };

  const handleGoogleError = () => {
    console.error("Google Sign-In failed");
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        size="large"
        width="100%"
        text={mode === "signup" ? "signup_with" : "signin_with"}
        shape="rectangular"
        logo_alignment="left"
        theme="outline"
      />
    </div>
  );
}

GoogleAuthButton.propTypes = {
  onSuccess: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(["signin", "signup"]),
};
