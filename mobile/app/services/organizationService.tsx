// src/services/organizationService.ts
import axios from "axios";

const API_BASE = "https://quebe-v2.onrender.com/api";

export const fetchOrganizations = async () => {
  try {
    const response = await axios.get(`${API_BASE}/organizations`);
    return response.data.organizations || [];
  } catch (error: any) {
    console.error("Error fetching organizations:", error.message);
    return [];
  }
};
