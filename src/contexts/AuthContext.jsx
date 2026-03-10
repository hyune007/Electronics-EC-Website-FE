import { createContext, useState, useEffect, useCallback } from "react";
import { decodeJwtPayload } from "../utils/jwt";
import { getEmployeeById } from "../services/employeeservice";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

  const enrichAdminProfile = useCallback(async (authToken, currentUserData) => {
    const canEnrich = currentUserData?.roleId === "ROLE_ADMIN" && currentUserData?.id;
    if (!canEnrich) return;

    try {
      const employee = await getEmployeeById(currentUserData.id, authToken);
      const enrichedUser = {
        ...currentUserData,
        name: employee?.nv_name || currentUserData.name,
        email: employee?.nv_mail || currentUserData.email,
      };

      setUser(enrichedUser);
      localStorage.setItem("authUser", JSON.stringify(enrichedUser));
    } catch (error) {
      console.warn("Cannot enrich admin profile:", error);
    }
  }, []);

  const normalizeUserData = useCallback((authToken, source = {}, fallbackUser = null) => {
    const payload = decodeJwtPayload(authToken);
    const nested = source?.user || source?.data || {};

    const rawName =
      source?.name ||
      source?.fullName ||
      nested?.name ||
      nested?.fullName ||
      payload?.name ||
      payload?.fullName ||
      payload?.given_name ||
      fallbackUser?.name ||
      "";

    const rawEmail =
      source?.email ||
      nested?.email ||
      payload?.email ||
      fallbackUser?.email ||
      "";

    const resolvedName =
      String(rawName || "").trim() ||
      (String(rawEmail || "").includes("@")
        ? String(rawEmail).split("@")[0]
        : "User");

    return {
      id: payload?.sub || source?.id || nested?.id || fallbackUser?.id || "",
      name: resolvedName,
      email: String(rawEmail || "").trim(),
      roleId: payload?.roleId || source?.roleId || nested?.roleId || fallbackUser?.roleId,
    };
  }, []);

  useEffect(() => {
    const initAuth = () => {
      const storedToken = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("authUser");

      if (storedToken) {
        const decoded = decodeJwtPayload(storedToken);
        if (decoded && decoded.exp * 1000 > Date.now()) {
          let parsedStoredUser = null;
          try {
            parsedStoredUser = storedUser ? JSON.parse(storedUser) : null;
          } catch {
            parsedStoredUser = null;
          }

          const userData = normalizeUserData(storedToken, parsedStoredUser || {}, parsedStoredUser);
          setToken(storedToken);
          setUser(userData);
          localStorage.setItem("authUser", JSON.stringify(userData));
          enrichAdminProfile(storedToken, userData);
        } else {
          localStorage.removeItem("authToken");
          localStorage.removeItem("authUser");
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [enrichAdminProfile, normalizeUserData]);

    const login = useCallback((loginResponse) => {
      const { token } = loginResponse;
      const userData = normalizeUserData(token, loginResponse);

        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify(userData));

        setToken(token);
        setUser(userData);
        enrichAdminProfile(token, userData);
      }, [enrichAdminProfile, normalizeUserData]);

    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setToken(null);
        setUser(null);
    }, []);

  const updateUser = useCallback((newUserData) => {
    setUser(newUserData);
    localStorage.setItem("authUser", JSON.stringify(newUserData));
  }, []);

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.roleId === "ROLE_ADMIN";
  const isEmployee = user?.roleId === "ROLE_EMPLOYEE";
  const isCustomer = user?.roleId === "ROLE_CUSTOMER";

  const hasRole = useCallback(
    (roles) => {
      if (!user?.roleId) return false;
      if (Array.isArray(roles)) {
        return roles.includes(user.roleId);
      }
      return user.roleId === roles;
    },
    [user],
  );

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated,
    isAdmin,
    isEmployee,
    isCustomer,
    hasRole,
    login,
    logout,
    updateUser,
  };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
