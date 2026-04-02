const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * API client for making requests to backend
 * Handles authentication via cookies (credentials: "include")
 */
export const apiClient = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    // Check if body is FormData (for file uploads)
    const isFormData = options.body instanceof FormData;

    const config = {
      ...options,
      headers: {
        // Don't set Content-Type for FormData - browser will set it with boundary
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
      },
      credentials: "include", // Send cookies with requests
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      return data;
    } catch (error) {
      throw error;
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  },

  post(endpoint, body) {
    return this.request(endpoint, {
      method: "POST",
      // Don't stringify FormData
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  put(endpoint, body) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  delete(endpoint) {
    return this.request(endpoint, {
      method: "DELETE",
    });
  },
};

export default apiClient;
