// mobile/app/services/clientService.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = "https://quebe-v2.onrender.com/api";

// Get auth token
const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem("authToken");
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const token = await getAuthToken();

    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const response = await axios.get(`${API_BASE}/clients/me`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000,
    });

    return { success: true, ...response.data };
  } catch (error: any) {
    console.error("Get user error:", error);
    return {
      success: false,
      message: "Failed to fetch user data",
    };
  }
};

// Verify payment and add credit
export const verifyPaymentAndAddCredit = async (
  reference: string,
  amount: number
) => {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "Not authenticated",
      };
    }

    console.log("🔄 Verifying payment:", { reference, amount });

    const response = await axios.post(
      `${API_BASE}/clients/verify-payment`,
      { reference, amount },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    console.log("✅ Verification response:", response.data);
    return { success: true, ...response.data };
  } catch (error: any) {
    console.error("❌ Verification error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    return {
      success: false,
      message:
        error.response?.data?.message || error.message || "Verification failed",
      details: error.response?.data,
    };
  }
};

// Manual credit update (if needed)
export const updateClientCredit = async (clientId: string, credit: number) => {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "Not authenticated",
      };
    }

    const response = await axios.put(
      `${API_BASE}/clients/${clientId}/credit`,
      { credit },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    return { success: true, ...response.data };
  } catch (error: any) {
    console.error("Credit update error:", error.response?.data || error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to update credit",
    };
  }
};
export const initializePayment = async (amount: number) => {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "Not authenticated. Please login again.",
      };
    }

    console.log("Initializing payment with amount:", amount);

    const response = await axios.post(
      `${API_BASE}/clients/initialize-payment`,
      { amount },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    console.log("Initialize response:", response.data);
    return { success: true, ...response.data };
  } catch (error: any) {
    console.error("Initialize payment error:", error.response?.data || error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to initialize payment.",
    };
  }
};
