import apiClient from "./config";

const paymentService = {
  /**
   * Create a Razorpay order for premium upgrade
   */
  async createOrder() {
    return await apiClient.post("/payment/create-order");
  },

  /**
   * Verify payment and upgrade account
   */
  async verifyPayment(paymentData) {
    return await apiClient.post("/payment/verify", paymentData);
  },
};

export default paymentService;
