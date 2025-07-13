import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(
      `🚀 Making ${config.method?.toUpperCase()} request to: ${config.baseURL}${
        config.url
      }`
    );
    console.log(`📡 Request headers:`, config.headers);
    console.log(`🍪 Cookies will be sent: ${config.withCredentials}`);
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response ${response.status} from: ${response.config.url}`);
    console.log(`📦 Response data:`, response.data);
    console.log(`🍪 Set-Cookie headers:`, response.headers["set-cookie"]);
    return response;
  },
  (error) => {
    console.error(`❌ Response error from: ${error.config?.url}`);
    console.error(`📊 Status: ${error.response?.status}`);
    console.error(`📦 Error data:`, error.response?.data);
    console.error(`🍪 Response headers:`, error.response?.headers);

    if (error.response?.status === 401) {
      console.log("🔐 401 Unauthorized - Session may be expired or invalid");
      // Log current cookies
      console.log("🍪 Current cookies:", document.cookie);
    }

    return Promise.reject(error);
  }
);

export default api;
