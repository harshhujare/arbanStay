import { createContext, useState, useContext, useEffect } from "react";
import authService from "../api/authService";

const AuthContext = createContext();

// LocalStorage keys
const USER_STORAGE_KEY = "urbanstay_user";

/**
 * Hook to use auth context
 * @returns {Object} Auth context with user, loading, and auth functions
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

/**
 * Auth provider component
 * Manages authentication state and provides auth functions
 * Uses hybrid approach: JWT in HTTP-only cookie + user info in localStorage
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load user on mount - HYBRID APPROACH
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Initialize authentication state
   * 1. Try to load from localStorage (instant)
   * 2. If found, use cached data
   * 3. If not found or cache is old, validate with backend
   */
  const initializeAuth = async () => {
    try {
      // Step 1: Check localStorage first (FAST)
      const cachedUser = localStorage.getItem(USER_STORAGE_KEY);

      if (cachedUser) {
        const userData = JSON.parse(cachedUser);
        // Load from cache immediately (instant UI update)
        setUser(userData);
        setIsAuthenticated(true);
        setLoading(false);

        // Optional: Validate in background (silent refresh)
        validateTokenInBackground();
      } else {
        // No cache, load from backend
        await loadUser();
      }
    } catch (error) {
      // Clear invalid cache
      clearAuthCache();
      setLoading(false);
    }
  };

  /**
   * Validate token in background without showing loading state
   */
  const validateTokenInBackground = async () => {
    try {
      const data = await authService.getMe();
      // Update cache with fresh data
      updateAuthCache(data.user);
      setUser(data.user);
    } catch (error) {
      // Token expired or invalid, clear everything
      clearAuthCache();
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  /**
   * Load current user from backend
   */
  const loadUser = async () => {
    try {
      const data = await authService.getMe();
      setUser(data.user);
      setIsAuthenticated(true);
      updateAuthCache(data.user); // Cache the user data
    } catch (error) {
      // Not logged in or token expired
      clearAuthCache();
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // ==================== PHONE/OTP AUTH ====================

  /**
   * Send OTP to phone number
   * @param {string} phoneNumber - 10-digit phone number
   */
  const sendOtp = async (phoneNumber) => {
    const data = await authService.sendOtp(phoneNumber);
    return data;
  };

  /**
   * Verify OTP (may require signup completion)
   * @param {string} phoneNumber - 10-digit phone number
   * @param {string} otp - 4-digit OTP code
   * @returns {Object} Response - may contain {needsSignup: true} or {token, user}
   */
  const verifyOtp = async (phoneNumber, otp) => {
    const data = await authService.verifyOtp(phoneNumber, otp);

    // Check if signup completion is needed
    if (data.needsSignup) {
      // Return data with needsSignup flag - don't login yet
      return data;
    }

    // Existing user - login
    setUser(data.user);
    setIsAuthenticated(true);
    updateAuthCache(data.user);
    return data;
  };

  // ==================== GOOGLE AUTH ====================

  /**
   * Google login - creates account immediately for new users
   * @param {string} credential - Google ID token
   * @returns {Object} Response with { user, isNewUser }
   */
  const googleLogin = async (credential) => {
    const data = await authService.googleLogin(credential);

    // Account is created/logged in immediately
    setUser(data.user);
    setIsAuthenticated(true);
    updateAuthCache(data.user);
    return data; // data.isNewUser tells frontend if this is a new signup
  };

  // ==================== LINK PHONE ====================

  /**
   * Link and verify phone number for logged-in user
   * @param {string} phoneNumber - 10-digit phone number
   * @param {string} otp - 4-digit OTP code
   */
  const linkPhone = async (phoneNumber, otp) => {
    const data = await authService.linkPhone(phoneNumber, otp);
    setUser(data.user);
    updateAuthCache(data.user);
    return data;
  };

  // ==================== COMPLETE SIGNUP ====================

  /**
   * Complete signup with all required data
   * @param {Object} signupData - { phone, name, city, googleId?, email?, profilePhoto? }
   */
  const completeSignup = async (signupData) => {
    const data = await authService.completeSignup(signupData);
    setUser(data.user);
    setIsAuthenticated(true);
    updateAuthCache(data.user);
    return data;
  };

  /**
   * Logout user
   */
  const logout = async () => {
    await authService.logout();
    clearAuthCache(); // Clear localStorage
    setUser(null);
    setIsAuthenticated(false);
  };

  /**
   * Update localStorage cache
   */
  const updateAuthCache = (userData) => {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error("Failed to cache user data:", error);
    }
  };

  /**
   * Clear localStorage cache
   */
  const clearAuthCache = () => {
    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear cache:", error);
    }
  };

  /**
   * Update user in context and cache
   * @param {Object} userData - Updated user data
   */
  const updateUser = (userData) => {
    setUser(userData);
    updateAuthCache(userData);
  };

  const isAdmin = user?.role === "admin";
  const isPhoneVerified = user?.phoneVerified === true;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        isAdmin,
        isPhoneVerified,
        sendOtp,
        verifyOtp,
        googleLogin,
        linkPhone,
        completeSignup,
        logout,
        loadUser,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
