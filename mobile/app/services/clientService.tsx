// mobile/app/services/clientService.ts
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = "https://quebe-v2.onrender.com/api";

// Get auth token from AsyncStorage
const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    return token;
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

// Get current user data
export const getCurrentUser = async () => {
  try {
    const token = await getAuthToken();

    if (!token) {
      return { success: false, message: "Not authenticated" };
    }

    const response = await axios.get(`${API_BASE}/clients/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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

// Verify payment and update credit with retry logic
export const verifyPaymentAndAddCredit = async (
  reference: string,
  amount: number,
  retryCount = 0
) => {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "Not authenticated. Please login again.",
      };
    }

    console.log(`Verifying payment (attempt ${retryCount + 1}):`, {
      reference,
      amount,
    });

    const response = await axios.post(
      `${API_BASE}/clients/verify-payment`,
      {
        reference,
        amount,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        timeout: 60000, // 60 seconds
      }
    );

    console.log("Verification response:", response.data);
    return { success: true, ...response.data };
  } catch (error: any) {
    console.error("Payment verification error:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      attempt: retryCount + 1,
    });

    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.details ||
        error.message ||
        "Failed to verify payment. Please contact support.",
      details: error.response?.data,
    };
  }
};

// Update client credit manually (if needed)
export const updateClientCredit = async (clientId: string, credit: number) => {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "Not authenticated. Please login again.",
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
      message: error.response?.data?.message || "Failed to update credit.",
    };
  }
};
