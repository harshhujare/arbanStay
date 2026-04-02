import apiClient from "./config";

/**
 * Authentication service for user registration, login, logout
 */
export const authService = {
  /**
   * Register a new user
   * @param {Object} userData - { name, email, password }
   * @returns {Promise} Response with user data and token
   */
  // ==================== DEPRECATED - Old Email/Password Auth ====================
  // Removed: register() and login() methods

  // ==================== ACTIVE AUTH METHODS ====================

  // Logout user
  async logout() {
    return await apiClient.post("/auth/logout");
  },

  /**
   * Get current authenticated user
   * @returns {Promise} Response with user data
   */
  async getMe() {
    return await apiClient.get("/auth/me");
  },

  /**
   * Update user profile
   * @param {Object} userData - { name, email, phone, profilePhoto }
   * @returns {Promise} Response with updated user data
   */
  async updateProfile(userData) {
    return await apiClient.put("/auth/me", userData);
  },

  // ==================== PHONE/OTP AUTH ====================

  // Send OTP to phone number
  async sendOtp(phoneNumber) {
    return await apiClient.post("/auth/send-otp", { phoneNumber });
  },

  /**
   * Verify OTP and login/register
   * @param {string} phoneNumber - 10-digit phone number (without +91)
   * @param {string} otp - 4-digit OTP code
   * @returns {Promise} Response with user data and token
   */
  // Verify OTP (simplified - no longer creates user)
  async verifyOtp(phoneNumber, otp) {
    return await apiClient.post("/auth/verify-otp", {
      phoneNumber,
      otp,
    });
  },

  // ==================== GOOGLE AUTH ====================

  // Google login (may require phone verification)
  async googleLogin(credential) {
    return await apiClient.post("/auth/google-login", { credential });
  },

  // ==================== COMPLETE SIGNUP ====================

  // Complete signup with all user data (after phone verification)
  async completeSignup(signupData) {
    // signupData: { phone, name, city, googleId?, email?, profilePhoto?, role? }
    return await apiClient.post("/auth/complete-signup", signupData);
  },

  // ==================== LINK PHONE ====================

  // Link and verify phone number for logged-in user
  async linkPhone(phoneNumber, otp) {
    return await apiClient.post("/auth/link-phone", { phoneNumber, otp });
  },
};

export default authService;
