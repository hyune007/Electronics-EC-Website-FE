import "./ChangePassword.css";
import vi from "../../../i18n/vi.js";
import useTheme from "../../../hooks/useTheme";
import AuthLeft from "../../../components/layout/auth/AuthLeft/AuthLeft.jsx";
import ThemeToggleButton from "../../../components/common/ThemeToggleButton.jsx";
import BrandLogo from "../../../components/common/BrandLogo.jsx";

export default function ChangePassword() {
  const { toggleTheme } = useTheme();
  return (
    <div className="bg-background-light dark:bg-background-dark font-sans transition-colors duration-200">
      <div className="auth-container h-screen dark:bg-black">
        <AuthLeft />
        <div
          className="auth-right dark:bg-background-dark"
          style={{
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
          }}
        >
          <div className="max-w-[320px] mx-auto w-full">
            <div className="lg:hidden text-center mb-8">
              <div className="flex justify-center ">
                <a href="/" className="block">
                  <div className="w-[180px] h-[40px] overflow-hidden">
                    <BrandLogo/>
                  </div>
                </a>
              </div>
            </div>
            <div className="mb-10 text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 title-center">
                {vi.auth.changePassword.title}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-xs">
                {vi.auth.changePassword.description}
              </p>
            </div>
            <form action="#" className="space-y-4" method="POST">
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
                  htmlFor="new-password"
                >
                  {vi.auth.changePassword.newPassword}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                    lock
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    id="new-password"
                    name="new-password"
                    placeholder="Nhập mật khẩu mới"
                    required=""
                    type="password"
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
                  htmlFor="confirm-password"
                >
                  {vi.auth.changePassword.confirmPassword}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                    shield
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    id="confirm-password"
                    name="confirm-password"
                    placeholder="Nhập lại mật khẩu mới"
                    required=""
                    type="password"
                  />
                </div>
              </div>
              <button
                className="w-full bg-primary hover:bg-[#0a2d4d] text-white font-bold py-2 px-3 rounded-xl shadow-lg shadow-primary/20 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
                type="submit"
              >
                <span>{vi.auth.changePassword.updatePassword}</span>
                <span className="material-symbols-outlined text-base">
                  check_circle
                </span>
              </button>
            </form>
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
              <a
                className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 transition-colors flex items-center justify-center gap-2"
                href="/login"
              >
                <span className="material-symbols-outlined text-base">
                  arrow_back
                </span>
                <p className="hover:underline">
                  {vi.auth.changePassword.backToLogin}
                </p>
              </a>
            </div>
          </div>
        </div>
        {/* Nut doi trang thai theme*/}
        <div className="fixed bottom-6 right-6">
          <ThemeToggleButton onToggle={toggleTheme} />
        </div>
      </div>
    </div>
  );
}
