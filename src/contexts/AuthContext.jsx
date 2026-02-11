import { createContext, useState, useEffect, useCallback } from 'react';
import { decodeJwtPayload } from '../utils/jwt';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = () => {
            const storedToken = localStorage.getItem('authToken');
            const storedUser = localStorage.getItem('authUser');

            if (storedToken && storedUser) {
                const decoded = decodeJwtPayload(storedToken);
                if (decoded && decoded.exp * 1000 > Date.now()) {
                    setToken(storedToken);
                    setUser(JSON.parse(storedUser));
                } else {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('authUser');
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = useCallback((loginResponse) => {
        const { token } = loginResponse;
        const payload = decodeJwtPayload(token);

        const userData = {
            id: payload?.sub,
            roleId: payload?.roleId,
        };

        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify(userData));

        setToken(token);
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setToken(null);
        setUser(null);
    }, []);

    const isAuthenticated = !!token && !!user;
    const isAdmin = user?.roleId === 'ROLE_ADMIN';
    const isEmployee = user?.roleId === 'ROLE_EMPLOYEE';
    const isCustomer = user?.roleId === 'ROLE_CUSTOMER';

    const hasRole = useCallback((roles) => {
        if (!user?.roleId) return false;
        if (Array.isArray(roles)) {
            return roles.includes(user.roleId);
        }
        return user.roleId === roles;
    }, [user]);

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
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
