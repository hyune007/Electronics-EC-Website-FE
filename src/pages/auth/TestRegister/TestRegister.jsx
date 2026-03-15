import { Link, useLocation } from "react-router-dom";

export default function TestRegister() {
  const location = useLocation();
  const customer = location.state?.customer;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-black dark:text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Test Register</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Thông tin lấy từ database sau khi đăng ký.
        </p>
        <div className="space-y-4">
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
              id
            </p>
            <p className="text-sm font-semibold break-all">
              {customer?.id || "(không có)"}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
              email
            </p>
            <p className="text-sm font-semibold break-all">
              {customer?.email || "(không có)"}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
              ten
            </p>
            <p className="text-sm font-semibold break-all">
              {customer?.name || "(không có)"}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
              role id
            </p>
            <p className="text-sm font-semibold break-all">
              {customer?.role?.id || "(không có)"}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
              mat khau (hash)
            </p>
            <p className="text-sm font-semibold break-all">
              {customer?.password || "(không có)"}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800 p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
              phone
            </p>
            <p className="text-sm font-semibold break-all">
              {customer?.phone || "(không có)"}
            </p>
          </div>
        </div>
        <div className="mt-8 flex items-center gap-4">
          <Link
            className="text-sm font-semibold text-primary hover:underline"
            to="/register"
          >
            Quay lai dang ky
          </Link>
        </div>
      </div>
    </div>
  );
}
