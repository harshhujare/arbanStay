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
   * Get single property by ID
   */
  async getProperty(id) {
    return await apiClient.get(`/properties/${id}`);
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
};

export default propertyService;
