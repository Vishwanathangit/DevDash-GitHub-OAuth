import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true, // ✅ This sends cookies with every request
});

// ✅ No need to manually attach Authorization header anymore

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect automatically, let components handle it
      console.log("401 Unauthorized - Token may be expired or invalid");
    }
    return Promise.reject(error);
  }
);

export default api;
