import apiClient from "./config";

/**
 * Property Service
 * API calls for property management
 */
export const propertyService = {
  /**
   * Get all properties with optional filters
   */
  async getProperties(filters = {}) {
    const queryString = new URLSearchParams(filters).toString();
    const endpoint = queryString ? `/properties?${queryString}` : "/properties";
    return await apiClient.get(endpoint);
  },

  /**
   * Get distinct cities that have listings
   */
  async getCities() {
    return await apiClient.get("/properties/cities");
  },

  /**
   * Get single property by ID
   */
  async getProperty(id) {
    const response = await apiClient.get(`/properties/${id}`);
    return response.data; // Extract data from {success, data} response
  },

  /**
   * Get current user's properties
   */
  async getMyProperties() {
    return await apiClient.get("/properties/my");
  },

  /**
   * Get properties by user ID
   */
  async getUserProperties(userId) {
    return await apiClient.get(`/properties/user/${userId}`);
  },

  /**
   * Create new property
   */
  async createProperty(propertyData) {
    return await apiClient.post("/properties", propertyData);
  },

  /**
   * Update existing property
   */
  async updateProperty(id, propertyData) {
    return await apiClient.put(`/properties/${id}`, propertyData);
  },

  /**
   * Delete property
   */
  async deleteProperty(id) {
    return await apiClient.delete(`/properties/${id}`);
  },

  /**
   * Upload property images
   */
  async uploadImages(formData) {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/upload/property-images`,
      {
        method: "POST",
        credentials: "include",
        body: formData, // Don't set Content-Type, let browser set it for FormData
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Image upload failed");
    }

    return data;
  },

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId) {
    return await apiClient.post("/upload/image", { publicId });
  },

  /**
   * Get owner contact details (checks account limits)
   */
  async getOwnerContact(propertyId) {
    return await apiClient.get(`/properties/${propertyId}/contact`);
  },

  /**
   * Update a property
   */
  async updateProperty(id, propertyData) {
    return await apiClient.put(`/properties/${id}`, propertyData);
  },

  /**
   * Get property analytics/stats (owner only)
   */
  async getPropertyStats(id) {
    return await apiClient.get(`/properties/${id}/stats`);
  },

  /**
   * Toggle like on a property (like/unlike)
   */
  async toggleLike(propertyId) {
    return await apiClient.post(`/properties/${propertyId}/like`);
  },

  /**
   * Get like status for current user on a property
   */
  async getLikeStatus(propertyId) {
    return await apiClient.get(`/properties/${propertyId}/like-status`);
  },
};

export default propertyService;
