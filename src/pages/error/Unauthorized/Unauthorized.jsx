import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-background-dark">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
          Không có quyền truy cập
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Bạn không có quyền truy cập trang này.
        </p>
        <Link
          to="/"
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
