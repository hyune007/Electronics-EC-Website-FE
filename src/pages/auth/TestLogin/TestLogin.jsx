import { useLocation, Link } from "react-router-dom";
import { decodeJwtPayload } from "../../../utils/jwt.js";

export default function TestLogin() {
  const location = useLocation();
  const token = location.state?.token || localStorage.getItem("authToken");

  const payload = decodeJwtPayload(token);
  const userId = location.state?.id || payload?.sub || "";
  const roleId = location.state?.roleId || payload?.roleId || "";
  const issuedAt = payload?.iat ? new Date(payload.iat * 1000) : null;
  const expiresAt = payload?.exp ? new Date(payload.exp * 1000) : null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-black dark:text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Test Login</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Thông tin lấy từ JWT.
        </p>
        <div className="space-y-4">
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
              id
            </p>
            <p className="text-sm font-semibold break-all">
              {userId || "(không có)"}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
              roleId
            </p>
            <p className="text-sm font-semibold break-all">
              {roleId || "(không có)"}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
              Ngày tạo
            </p>
            <p className="text-sm font-semibold break-all">
              {issuedAt ? issuedAt.toLocaleString() : "(không có)"}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
              Ngày hết hạn
            </p>
            <p className="text-sm font-semibold break-all">
              {expiresAt ? expiresAt.toLocaleString() : "(không có)"}
            </p>
          </div>
        </div>
        <div className="mt-8 flex items-center gap-4">
          <Link
            className="text-sm font-semibold text-primary hover:underline"
            to="/login"
          >
            Quay lại đăng nhập
          </Link>
          {token ? (
            <button
              className="text-sm font-semibold text-gray-600 dark:text-gray-300"
              type="button"
              onClick={() => navigator.clipboard.writeText(token)}
            >
              Copy token
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
