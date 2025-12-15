// File: authService.js

import api from "../config/api";

const authService = {
  // Login
  login: async (email, password) => {
    console.log("🌐 loginService called with:", { email, passwordLength: password?.length });

    const res = await api.post("/v1/auth/login", { email, password });

    console.log("📦 Raw response from API:", res);

    const accessToken = res?.accessToken;
    const refreshToken = res?.refreshToken;

    console.log("🎫 accessToken found:", !!accessToken);
    console.log("🔄 refreshToken found:", !!refreshToken);

    if (accessToken) {
      localStorage.setItem("authToken", accessToken);
      console.log("✅ authToken saved to localStorage");
    } else {
      console.warn("⚠️ No accessToken in response!");
    }

    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
      console.log("✅ refreshToken saved to localStorage");
    } else {
      console.warn("⚠️ No refreshToken in response!");
    }

    console.log("🎉 loginService returning:", res);
    return res;
  },

  // Register
  register: async (fullName, email, password, phoneNumber) => {
    try {
      const res = await api.post("/v1/auth/register", {
        fullName,
        email,
        password,
        phoneNumber
      });
      return res;
    } catch (error) {
      console.error('❌ Error registering:', error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      const res = await api.post("/v1/auth/logout");
      // Clear tokens from localStorage
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      console.log("✅ Logged out and cleared tokens");
      return res;
    } catch (error) {
      console.error('❌ Error logging out:', error);
      throw error;
    }
  },

  // Refresh Token
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const res = await api.post("/v1/auth/refresh-token", { refreshToken });

      const newAccessToken = res?.accessToken;
      const newRefreshToken = res?.refreshToken;

      if (newAccessToken) {
        localStorage.setItem("authToken", newAccessToken);
      }
      if (newRefreshToken) {
        localStorage.setItem("refreshToken", newRefreshToken);
      }

      return res;
    } catch (error) {
      console.error('❌ Error refreshing token:', error);
      // Clear tokens if refresh fails
      localStorage.removeItem("authToken");
      localStorage.removeItem("refreshToken");
      throw error;
    }
  }
};

// Export individual functions for backward compatibility
export const loginService = authService.login;
export const registerService = authService.register;
export const logoutService = authService.logout;

export default authService;