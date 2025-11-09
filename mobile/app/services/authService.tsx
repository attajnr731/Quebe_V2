// src/services/authService.ts
import axios from "axios";

const API_BASE = "https://quebe-v2.onrender.com/api";

export const loginClient = async (phone: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      phone,
      password,
    });
    return { success: true, ...response.data };
  } catch (error: any) {
    if (__DEV__) {
      console.warn("Login failed:", error.response?.data || error.message);
    }

    // Return clean error object
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Invalid phone number or password",
    };
  }
};
