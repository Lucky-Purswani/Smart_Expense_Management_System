const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ─── TOKEN MANAGEMENT ─────────────────────────────

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}

export function setTokens(accessToken, refreshToken) {
  localStorage.setItem("accessToken", accessToken);
  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
}

export function clearTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

export function hasTokens() {
  return !!getAccessToken();
}

// ─── TOKEN REFRESH ─────────────────────────────────

let isRefreshing = false;
let refreshSubscribers = [];

function onTokenRefreshed(newToken) {
  refreshSubscribers.forEach((cb) => cb(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb);
}

async function refreshAccessToken() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  const response = await fetch(`${API_BASE}/auth/refresh-token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Token refresh failed");
  }

  setTokens(data.data.accessToken, null);
  return data.data.accessToken;
}

// ─── CORE FETCH WRAPPER ────────────────────────────

async function apiFetch(endpoint, options = {}) {
  const token = getAccessToken();

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  let response = await fetch(`${API_BASE}${endpoint}`, config);

  // Handle 401 — try token refresh
  if (response.status === 401 && getRefreshToken()) {
    if (!isRefreshing) {
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        onTokenRefreshed(newToken);

        // Retry original request with new token
        config.headers.Authorization = `Bearer ${newToken}`;
        response = await fetch(`${API_BASE}${endpoint}`, config);
      } catch (err) {
        isRefreshing = false;
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        throw err;
      }
    } else {
      // Another refresh in progress — queue this request
      const newToken = await new Promise((resolve) => {
        addRefreshSubscriber(resolve);
      });
      config.headers.Authorization = `Bearer ${newToken}`;
      response = await fetch(`${API_BASE}${endpoint}`, config);
    }
  }

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Something went wrong");
    error.status = response.status;
    throw error;
  }

  return data;
}

// ─── AUTH ──────────────────────────────────────────

export const authApi = {
  login: (body) =>
    apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  refreshToken: (body) =>
    apiFetch("/auth/refresh-token", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  logout: (body) =>
    apiFetch("/auth/logout", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  changePassword: (body) =>
    apiFetch("/auth/change-password", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  forgotPassword: (body) =>
    apiFetch("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  resetPassword: (body) =>
    apiFetch("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ─── USER ─────────────────────────────────────────

export const userApi = {
  getMe: () => apiFetch("/users/me"),
  getAccount: () => apiFetch("/users/account"),
  updateProfile: (body) =>
    apiFetch("/users/profile", {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteAccount: (body) =>
    apiFetch("/users", {
      method: "DELETE",
      body: JSON.stringify(body),
    }),
};

// ─── WALLET ───────────────────────────────────────

export const walletApi = {
  getWallet: () => apiFetch("/wallet"),
  getBalance: () => apiFetch("/wallet/balance"),
  getAccount: () => apiFetch("/wallet/account"),
};

// ─── TRANSACTIONS ─────────────────────────────────

export const transactionApi = {
  create: (body) =>
    apiFetch("/transactions", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  transfer: (body) =>
    apiFetch("/transactions/transfer", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  getAll: (params = {}) => {
    const query = typeof params === "string" 
      ? params 
      : new URLSearchParams(params).toString();
    return apiFetch(`/transactions${query ? `?${query}` : ""}`);
  },
  getRecent: () => apiFetch("/transactions/recent"),
  getById: (id) => apiFetch(`/transactions/${id}`),
  getByWindow: (windowId) => apiFetch(`/transactions/window/${windowId}`),
};

// ─── EXPENSE WINDOWS ──────────────────────────────

export const windowApi = {
  getAll: () => apiFetch("/windows"),
  getById: (id) => apiFetch(`/windows/${id}`),
  create: (body) =>
    apiFetch("/windows", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id, body) =>
    apiFetch(`/windows/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  delete: (id) =>
    apiFetch(`/windows/${id}`, {
      method: "DELETE",
    }),
  addLabels: (id, body) =>
    apiFetch(`/windows/${id}/labels`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  removeLabels: (id, body) =>
    apiFetch(`/windows/${id}/labels`, {
      method: "DELETE",
      body: JSON.stringify(body),
    }),
  reset: (id, resetDay) =>
    apiFetch(`/windows/${id}/reset`, {
      method: "POST",
      body: JSON.stringify({ resetDay }),
    }),
};

// ─── ANALYTICS ────────────────────────────────────

export const analyticsApi = {
  getSummary: () => apiFetch("/analytics/summary"),
  getWindowBreakdown: () => apiFetch("/analytics/window-breakdown"),
  getMonthlySpending: () => apiFetch("/analytics/monthly-spending"),
  getRecentActivity: () => apiFetch("/analytics/recent-activity"),
  getWindowAnalytics: (windowId) =>
    apiFetch(`/analytics/window/${windowId}`),
};
