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
    
    // ✅ Add retry logic for network errors
    config.retryCount = config.retryCount || 0;
    config.maxRetries = 3;
    
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
  async (error) => {
    console.error(`❌ Response error from: ${error.config?.url}`);
    console.error(`📊 Status: ${error.response?.status}`);
    console.error(`📦 Error data:`, error.response?.data);
    console.error(`🍪 Response headers:`, error.response?.headers);

    // ✅ Retry logic for network errors
    const config = error.config;
    if (config && config.retryCount < config.maxRetries) {
      config.retryCount += 1;
      console.log(`🔄 Retrying request (${config.retryCount}/${config.maxRetries}): ${config.url}`);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * config.retryCount));
      
      return api(config);
    }

    if (error.response?.status === 401) {
      console.log("🔐 401 Unauthorized - Session may be expired or invalid");
      // Log current cookies
      console.log("🍪 Current cookies:", document.cookie);
      
      // ✅ Clear any invalid tokens from localStorage if they exist
      if (typeof window !== 'undefined') {
        const invalidTokens = ['token', 'auth_token', 'access_token'];
        invalidTokens.forEach(tokenName => {
          if (localStorage.getItem(tokenName)) {
            console.log(`🧹 Clearing invalid token from localStorage: ${tokenName}`);
            localStorage.removeItem(tokenName);
          }
        });
      }
    }

    // ✅ Handle network errors specifically
    if (!error.response) {
      console.error("🌐 Network error - no response received");
      console.error("🔍 Error details:", {
        message: error.message,
        code: error.code,
        config: {
          baseURL: error.config?.baseURL,
          url: error.config?.url,
          method: error.config?.method
        }
      });
    }

    return Promise.reject(error);
  }
);

export default api;
