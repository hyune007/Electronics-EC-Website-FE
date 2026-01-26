import "./ForgotPassword.css";
import useTheme from "../../../hooks/useTheme";
import AuthLeft from "../../../components/layout/auth/AuthLeft/AuthLeft.jsx";
import ThemeToggleButton from "../../../components/common/ThemeToggleButton.jsx";
import vi from "../../../i18n/vi.js";
import BrandLogo from "../../../components/common/BrandLogo.jsx";
export default function ForgotPassword() {
  const { toggleTheme } = useTheme();

  return (
    <div className="bg-background-light dark:bg-background-dark font-sans transition-colors duration-200">
      <div className="auth-container h-screen dark:bg-black">
        <AuthLeft />
        <div className="auth-right dark:bg-background-dark">
          <div className="max-w-[340px] mx-auto w-full">
            <div className="lg:hidden text-center mb-8">
              <div className="mt-6 flex justify-center ">
                <a href="/" className="block">
                  <div className="w-[170px] h-[34px] overflow-hidden">
                    <BrandLogo />
                  </div>
                </a>
              </div>
            </div>
            <div className="mb-10 text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 title-center">
                {vi.auth.forgotPassword.title}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-xs">
                {vi.auth.forgotPassword.description}
              </p>
            </div>
            <form action="#" className="space-y-3 pb-48" method="POST">
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
                  htmlFor="email"
                >
                  {vi.auth.forgotPassword.email}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                    mail
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    id="email"
                    name="email"
                    placeholder="example@ubrain.com"
                    required=""
                    type="email"
                  />
                </div>
              </div>
              <button
                className="w-full bg-primary hover:bg-[#0a2d4d] text-white font-bold py-2 px-3 rounded-xl shadow-lg shadow-primary/20 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
                type="submit"
              >
                <span>{vi.auth.forgotPassword.sendRequest}</span>
                <span className="material-symbols-outlined text-base">
                  send
                </span>
              </button>
            </form>
            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 text-center">
              <a
                className="inline-flex items-center gap-2 text-xs font-bold text-primary dark:text-blue-400 transition-colors"
                href="/login"
              >
                <span className="material-symbols-outlined text-base">
                  arrow_back
                </span>
                <p className="hover:underline">
                  {vi.auth.forgotPassword.backToLogin}
                </p>
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Nút chuyển đổi trạng thái theme */}
      <div className="fixed bottom-6 right-6">
        <ThemeToggleButton onToggle={toggleTheme} />
      </div>
    </div>
  );
}
