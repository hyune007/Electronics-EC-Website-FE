import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Security: Bật kiểm tra xác thực và phân quyền
const BYPASS_AUTH = false;

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { isAuthenticated, isLoading, hasRole } = useAuth();
    const location = useLocation();

    // [DEV] Bypass tất cả kiểm tra auth
    if (BYPASS_AUTH) {
        return children;
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles.length > 0 && !hasRole(allowedRoles)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;
