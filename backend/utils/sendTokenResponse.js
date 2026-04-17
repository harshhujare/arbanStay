/**
 * Send JWT token response with HTTP-only cookie
 * @param {Object} user - User object from database
 * @param {Number} statusCode - HTTP status code
 * @param {Object} res - Express response object
 * @param {Object} extraData - Optional extra fields to include in response
 */
const sendTokenResponse = (user, statusCode, res, extraData = {}) => {
  // Generate JWT token
  const token = user.generateJWT();

  // Treat as production if NODE_ENV says so, OR if the CLIENT_URL is an https:// origin
  // This guards against Render deployments where NODE_ENV may not be set correctly
  const isProduction =
    process.env.NODE_ENV === "production" ||
    (process.env.CLIENT_URL && process.env.CLIENT_URL.startsWith("https://"));

  // Cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    ),
    httpOnly: true, // Prevents client-side JS from reading the cookie (XSS protection)
    secure: isProduction, // Use HTTPS in production
    sameSite: isProduction ? "none" : "lax", // "none" for cross-origin in production (Vercel+Render)
  };

  // Send response with cookie and user data
  res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({
      success: true,
      token, // Also send in response body for mobile apps
      ...extraData,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto,
        phone: user.phone || null,
        phoneVerified: user.phoneVerified || false,
        authProvider: user.authProvider,
        accountType: user.accountType || "free",
      },
    });
};

export default sendTokenResponse;
