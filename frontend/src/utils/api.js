import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
});

// 🔐 Helper: Get token from cookies, localStorage, or URL
function getTokenFromMultipleSources() {
  try {
    const cookieNames = ["token", "token_alt", "token_cross", "token_debug"];
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (cookieNames.includes(name)) {
        console.log(`🍪 Found token in cookie: ${name}`);
        return value;
      }
    }

    const localStorageToken = localStorage.getItem("auth_token");
    if (localStorageToken) {
      console.log("💾 Found token in localStorage");
      return localStorageToken;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get("token");
    if (urlToken) {
      console.log("🔗 Found token in URL parameters");
      return urlToken;
    }

    console.warn("❌ No token found in any source");
    return null;
  } catch (err) {
    console.error("❌ Error extracting token:", err);
    return null;
  }
}

// 🚀 Request Interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 ${config.method?.toUpperCase()} → ${config.baseURL}${config.url}`);
    console.log("📡 Headers:", config.headers);

    config.retryCount = config.retryCount || 0;
    config.maxRetries = 3;

    const token = getTokenFromMultipleSources();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Added Authorization header");
    }

    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// 📦 Response Interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response ${response.status} ← ${response.config.url}`);
    console.log("📦 Data:", response.data);
    return response;
  },
  async (error) => {
    const config = error.config;
    const status = error.response?.status;

    console.error(`❌ Response error from: ${config?.url}`);
    console.error(`📊 Status: ${status}`);
    console.error("📦 Error data:", error.response?.data);

    // 🔁 Retry on network or 5xx server errors
    if (!error.response || status >= 500) {
      if (config && config.retryCount < config.maxRetries) {
        config.retryCount += 1;
        console.warn(`🔁 Retry ${config.retryCount}/${config.maxRetries}: ${config.url}`);
        await new Promise(res => setTimeout(res, 1000 * config.retryCount));
        return api(config);
      }
    }

    // 🔐 Clear invalid auth tokens on 401
    if (status === 401) {
      console.warn("🔐 Unauthorized - clearing stored tokens");
      ["auth_token", "token", "access_token"].forEach((key) => {
        localStorage.removeItem(key);
      });
    }

    // 🌐 Handle network errors
    if (!error.response) {
      console.error("🌐 Network Error:", {
        message: error.message,
        code: error.code,
        url: config?.url,
      });
    }

    return Promise.reject(error);
  }
);

export default api;
