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
      const data = await authService.getCurrentUser();
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
      const data = await authService.getCurrentUser();
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

  /**
   * Login user
   * @param {Object} credentials - { email, password }
   */
  const login = async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data.user);
    setIsAuthenticated(true);
    updateAuthCache(data.user); // Cache user data
    return data;
  };

  /**
   * Register new user
   * @param {Object} userData - { name, email, password }
   */
  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.user);
    setIsAuthenticated(true);
    updateAuthCache(data.user); // Cache user data
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
