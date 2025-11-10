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
  photoUri: string | null
) => {
  try {
    const formData = new FormData();

    formData.append("name", name);
    formData.append("phone", phone);
    formData.append("password", password);
    formData.append("email", email);

    if (photoUri) {
      // Convert file URI → Blob (React Native)
      const filename = photoUri.split("/").pop() || "photo.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const ext = match ? match[1] : "jpg";
      const type = `image/${ext}`;

      // @ts-ignore – React Native FormData typing
      formData.append("photo", {
        uri: photoUri,
        name: filename,
        type,
      } as any);
    }

    const response = await axios.post(`${API_BASE}/auth/signup`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return { success: true, ...response.data };
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
