import axios from "../utils/api";

export const loginWithGithub = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const cleanApiUrl = API_URL.replace(/\/$/, "");

  console.log(
    "🔐 Redirecting to GitHub OAuth:",
    `${cleanApiUrl}/api/auth/github`
  );
  window.location.href = `${cleanApiUrl}/api/auth/github`;
};

export const logoutUser = async () => {
  try {
    console.log("🚪 Logging out user...");
    await axios.post("/api/auth/logout");
    console.log("✅ Logout successful");
  } catch (error) {
    console.error("❌ Logout error:", error);
    throw error;
  }
};

export const getProfile = async () => {
  try {
    console.log("👤 Fetching user profile...");
    const response = await axios.get("/api/auth/profile");
    console.log("✅ Profile fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Profile fetch error:",
      error.response?.status,
      error.response?.data
    );
    throw error;
  }
};
