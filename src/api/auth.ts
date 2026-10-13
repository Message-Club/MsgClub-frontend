// auth.ts

export const API_BASE =
  import.meta.env
    .VITE_API_BASE_URL ||
  "http://localhost:3000/api";
  // "https://626d-150-129-146-122.ngrok-free.app/api";

const AUTH_STORAGE_KEY =
  "auth";
const ACCESS_TOKEN_STORAGE_KEY =
  "access_token";
const REFRESH_TOKEN_STORAGE_KEY =
  "refresh_token";
const AUTH_CHANGE_EVENT =
  "auth-change";

/* =========================================
   COOKIE HELPERS
========================================= */

const setCookie = (
  name: string,
  value: string,
  days: number = 7
) => {
  const expires = new Date();

  expires.setTime(
    expires.getTime() +
      days * 24 * 60 * 60 * 1000
  );

  document.cookie =
    `${name}=${encodeURIComponent(
      value
    )}; ` +
    `expires=${expires.toUTCString()}; ` +
    `path=/; ` +
    `SameSite=Lax`;
};

const getCookie = (
  name: string
): string | null => {
  const cookies =
    document.cookie.split(";");

  for (const cookie of cookies) {
    const trimmed =
      cookie.trim();

    if (
      trimmed.startsWith(
        `${name}=`
      )
    ) {
      return decodeURIComponent(
        trimmed.substring(
          name.length + 1
        )
      );
    }
  }

  return null;
};

const deleteCookie = (
  name: string
) => {
  document.cookie =
    `${name}=; ` +
    `expires=Thu, 01 Jan 1970 00:00:00 GMT; ` +
    `path=/; ` +
    `SameSite=Lax`;
};

const getStorageItem = (
  key: string
) => {
  try {
    return localStorage.getItem(
      key
    );
  } catch {
    return null;
  }
};

const setStorageItem = (
  key: string,
  value: string
) => {
  try {
    localStorage.setItem(
      key,
      value
    );
  } catch {
    // Ignore storage failures and fall back to cookies/in-memory state.
  }
};

const removeStorageItem = (
  key: string
) => {
  try {
    localStorage.removeItem(
      key
    );
  } catch {
    // Ignore storage failures and clear other auth state.
  }
};

const notifyAuthChanged = () => {
  if (
    typeof window !==
    "undefined"
  ) {
    window.dispatchEvent(
      new Event(
        AUTH_CHANGE_EVENT
      )
    );
  }
};

const normalizeProfile =
  (data: any) => {
    if (!data) {
      return data;
    }

    const user =
      data.user || {};

    return {
      id:
        data.id ??
        user.id,
      email:
        user.email ??
        data.email,
      username:
        user.username ??
        data.username,
      first_name:
        user.firstName ??
        data.firstName ??
        data.first_name,
      last_name:
        user.lastName ??
        data.lastName ??
        data.last_name,
      status:
        data.status ??
        user.status,
      avatar:
        data.avatar ??
        user.avatar,
      last_seen:
        data.lastSeen ??
        data.last_seen,
      user_id:
        data.userId ??
        data.user_id,
    };
  };

/* =========================================
   TOKEN MANAGEMENT
========================================= */

let accessToken:
  | string
  | null =
  getCookie("access_token") ||
  getStorageItem(
    ACCESS_TOKEN_STORAGE_KEY
  );

export const setAuthenticated =
  () => {
    setStorageItem(
      AUTH_STORAGE_KEY,
      "true"
    );

    notifyAuthChanged();
  };

export const isAuthenticated =
  () => {
    return (
      !!getAccessToken() ||
      !!getRefreshToken() ||
      getStorageItem(
        AUTH_STORAGE_KEY
      ) === "true"
    );
  };

export const subscribeToAuthChanges =
  (
    callback: () => void
  ) => {
    if (
      typeof window ===
      "undefined"
    ) {
      return () => {};
    }

    window.addEventListener(
      AUTH_CHANGE_EVENT,
      callback
    );
    window.addEventListener(
      "storage",
      callback
    );

    return () => {
      window.removeEventListener(
        AUTH_CHANGE_EVENT,
        callback
      );
      window.removeEventListener(
        "storage",
        callback
      );
    };
  };

export const setAccessToken = (
  token: string
) => {
  accessToken = token;

  setCookie(
    "access_token",
    token,
    1
  );
  setStorageItem(
    ACCESS_TOKEN_STORAGE_KEY,
    token
  );

  setAuthenticated();
};

export const getAccessToken =
  () => {
    accessToken =
      getCookie(
        "access_token"
      ) ||
      getStorageItem(
        ACCESS_TOKEN_STORAGE_KEY
      );

    return accessToken;
  };

export const setRefreshToken = (
  token: string
) => {
  setCookie(
    "refresh_token",
    token,
    7
  );
  setStorageItem(
    REFRESH_TOKEN_STORAGE_KEY,
    token
  );

  setAuthenticated();
};

export const getRefreshToken =
  () => {
    return (
      getCookie(
        "refresh_token"
      ) ||
      getStorageItem(
        REFRESH_TOKEN_STORAGE_KEY
      )
    );
  };

export const clearAccessToken =
  () => {
    accessToken = null;

    removeStorageItem(
      AUTH_STORAGE_KEY
    );
    removeStorageItem(
      ACCESS_TOKEN_STORAGE_KEY
    );
    removeStorageItem(
      REFRESH_TOKEN_STORAGE_KEY
    );

    deleteCookie(
      "access_token"
    );

    deleteCookie(
      "refresh_token"
    );

    notifyAuthChanged();
  };


/* =========================================
   LOGIN
========================================= */

export const loginUser =
  async (data: {
    email: string;
    password: string;
  }) => {
    const response =
      await fetch(
        `${API_BASE}/users/login/`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            data
          ),
          credentials:
            "include",
        }
      );

    let responseData: any =
      null;

    try {
      responseData =
        await response.json();
    } catch {
      throw new Error(
        "Invalid server response"
      );
    }

    if (!response.ok) {
      throw (
        responseData ||
        new Error(
          "Login failed"
        )
      );
    }

    if (
      responseData?.access_token
    ) {
      setAccessToken(
        responseData.access_token
      );
    }

    if (
      responseData?.refresh_token
    ) {
      setRefreshToken(
        responseData.refresh_token
      );
    }

    setAuthenticated();

    return responseData;
  };

/* =========================================
   REFRESH ACCESS TOKEN
========================================= */

export const refreshAccessToken =
  async () => {
    try {
      const refreshToken =
        getRefreshToken();

      const response =
        await fetch(
          `${API_BASE}/users/refresh-token/`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              refreshToken
                ? {
                    refresh_token:
                      refreshToken,
                  }
                : {}
            ),
            credentials:
              "include",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        clearAccessToken();

        throw (
          data ||
          new Error(
            "Token refresh failed"
          )
        );
      }

      if (
        data?.access_token
      ) {
        setAccessToken(
          data.access_token
        );

        if (
          data?.refresh_token
        ) {
          setRefreshToken(
            data.refresh_token
          );
        }

        return data.access_token;
      }

      throw new Error(
        "No access token returned"
      );
    } catch (error) {
      clearAccessToken();

      throw error;
    }
  };

/* =========================================
   REQUEST WRAPPER
========================================= */

export const request = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const makeRequest = async (
    token?: string | null
  ) => {
    const headers = new Headers(
      options.headers
    );

    headers.set(
      "Content-Type",
      "application/json"
    );

    // NGROK FIX
    headers.set(
      "ngrok-skip-browser-warning",
      "true"
    );

    if (token) {
      headers.set(
        "Authorization",
        `Bearer ${token}`
      );
    }

    return fetch(
      `${API_BASE}${endpoint}`,
      {
        ...options,
        headers,

        credentials:
          options.credentials ??
          "include",
      }
    );
  };

  accessToken =
    getAccessToken();

  let response =
    await makeRequest(
      accessToken
    );

  let data: any = null;

  try {
    data =
      await response.json();
  } catch {
    data = null;
  }

  // =========================
  // TOKEN EXPIRED
  // =========================

  if (
    response.status ===
      401 ||
    response.status ===
      403
  ) {
    try {
      const newToken =
        await refreshAccessToken();

      const retryResponse =
        await makeRequest(
          newToken
        );

      const retryData =
        await retryResponse.json();

      if (
        !retryResponse.ok
      ) {
        throw (
          retryData ||
          new Error(
            "Request failed after refresh"
          )
        );
      }

      return retryData;
    } catch (error) {
      clearAccessToken();

      if (
        typeof window !==
        "undefined"
      ) {
        window.location.href =
          "/login";
      }

      throw error;
    }
  }

  if (!response.ok) {
    throw (
      data ||
      new Error(
        "Request failed"
      )
    );
  }

  return data;
};

/* =========================================
   REGISTER
========================================= */

export const registerUser =
  async (data: {
    email: string;
    username: string;
    password: string;
  }) => {
    const response =
      await request(
        "/users/register/",
        {
          method: "POST",

          body: JSON.stringify(
            data
          ),
        }
      );

    if (
      response?.access_token
    ) {
      setAccessToken(
        response.access_token
      );
    }

    if (
      response?.refresh_token
    ) {
      setRefreshToken(
        response.refresh_token
      );
    }

    setAuthenticated();

    return response;
  };

/* =========================================
   LOGOUT
========================================= */

export const logoutUser =
  async () => {
    try {
      await request(
        "/users/logout/",
        {
          method: "POST",
        }
      );
    } finally {
      clearAccessToken();
    }
  };

/* =========================================
   PROFILE
========================================= */

export const getProfile =
  () => {
    return request(
      "/users/profile/",
      {
        method: "GET",
      }
    ).then(
      normalizeProfile
    );
  };

/* =========================================
   UPDATE PROFILE
========================================= */

export const updateProfile =
  async (data: {
    first_name: string;
    last_name: string;
    username: string;
    status: string;
    avatar?: string;
  }) => {
    return request(
      "/users/update-profile/",
      {
        method: "PUT",

        body: JSON.stringify(
          {
            firstName:
              data.first_name,
            lastName:
              data.last_name,
            username:
              data.username,
            status:
              data.status,
            avatar:
              data.avatar,
          }
        ),
      }
    ).then((response) =>
      normalizeProfile(
        response?.profile ||
          response
      )
    );
  };

/* =========================================
   UPDATE PASSWORD
========================================= */

export const updatePassword =
  async (data: {
    old_password: string;
    new_password: string;
  }) => {
    return request(
      "/users/update-password/",
      {
        method: "POST",

        body: JSON.stringify(
          {
            oldPassword:
              data.old_password,
            newPassword:
              data.new_password,
          }
        ),
      }
    );
  };

/* =========================================
   SEARCH USERS
========================================= */

export const searchUsers =
  async (
    query: string
  ) => {
    return request(
      `/users/users/?q=${encodeURIComponent(
        query
      )}&page=1&limit=5`,
      {
        method: "GET",
      }
    );
  };

/* =========================================
   FORGOT PASSWORD
========================================= */

export const forgotPassword =
  async (data: {
    email: string;
  }) => {
    return request(
      "/users/forgot-password/",
      {
        method: "POST",

        body: JSON.stringify(
          data
        ),
      }
    );
  };

/* =========================================
   RESET PASSWORD
========================================= */

export const resetPassword =
  async (data: {
    uid: string;
    token: string;
    password: string;
  }) => {
    return request(
      "/users/reset-password/",
      {
        method: "POST",

        body: JSON.stringify(
          data
        ),
      }
    );
  };
