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

export const signupClient = async (
  name: string,
  phone: string,
  password: string,
  email: string,
  photoURL: string | null
) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/signup`, {
      name,
      phone,
      password,
      email,
      photoURL,
    });

    return { success: true, ...response.data }; // Now includes token
  } catch (error: any) {
    if (__DEV__) {
      console.warn("Signup failed:", error.response?.data || error.message);
    }
    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.message ||
        "Failed to create account",
    };
  }
};
