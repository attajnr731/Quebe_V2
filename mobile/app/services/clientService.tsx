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

// Verify payment and update credit
export const verifyPaymentAndAddCredit = async (
  reference: string,
  amount: number
) => {
  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: false,
        message: "Not authenticated. Please login again.",
      };
    }

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
      }
    );

    return { success: true, ...response.data };
  } catch (error: any) {
    console.error("Payment verification error:", error.response?.data || error);
    return {
      success: false,
      message:
        error.response?.data?.message ||
        "Failed to verify payment. Please contact support.",
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
