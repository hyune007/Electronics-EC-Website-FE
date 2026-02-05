import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// TODO: [DEVELOPMENT ONLY] Đặt thành false để bật lại bảo vệ route khi API admin hoàn thiện
const BYPASS_AUTH = true;

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
