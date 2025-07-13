import axios from "../utils/api";

export const loginWithGithub = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const cleanApiUrl = API_URL.replace(/\/$/, "");
  window.location.href = `${cleanApiUrl}/api/auth/github`;
};

export const logoutUser = async () => {
  try {
    await axios.post("/api/auth/logout");
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export const getProfile = async () => {
  try {
    const response = await axios.get("/api/auth/profile");
    return response.data;
  } catch (error) {
    console.error("Profile fetch error:", error);
    throw error;
  }
};