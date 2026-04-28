import "./ForgotPassword.css";
import { useState } from "react";
import useTheme from "../../../hooks/useTheme";
import AuthLeft from "../../../components/layout/auth/AuthLeft/AuthLeft.jsx";
import ThemeToggleButton from "../../../components/common/ThemeToggleButton.jsx";
import vi from "../../../i18n/vi.js";
import BrandLogo from "../../../components/common/BrandLogo.jsx";
import { forgotPassword } from "../../../services/authService.js";

export default function ForgotPassword() {
  const { toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await forgotPassword(email);
      setSuccessMessage(response);
    } catch (error) {
      const message =
        error?.response?.data || "Đã có lỗi xảy ra. Vui lòng thử lại.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-sans transition-colors duration-200">
      <div className="auth-container h-screen dark:bg-black">
        <AuthLeft />
        <div className="auth-right dark:bg-background-dark">
          <div className="max-w-xs sm:max-w-sm md:max-w-md mx-auto w-full px-4 sm:px-6">
            <div className="lg:hidden text-center mb-8">
              <div className="mt-6 flex justify-center ">
                <a href="/" className="block">
                  <div className="w-[180px] h-[40px] overflow-hidden">
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
            <form className="space-y-3 pb-48" onSubmit={handleSubmit}>
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
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              {successMessage && (
                <p className="text-xs text-green-600 dark:text-green-400">
                  {successMessage}
                </p>
              )}
              {errorMessage && (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errorMessage}
                </p>
              )}
              <button
                className="w-full bg-primary hover:bg-[#0a2d4d] text-white font-bold py-2 px-3 rounded-xl shadow-lg shadow-primary/20 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
                type="submit"
                disabled={isSubmitting}
              >
                <span>
                  {isSubmitting
                    ? "Đang gửi..."
                    : vi.auth.forgotPassword.sendRequest}
                </span>
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
      {/* Nut chuyen doi trang thai theme */}
      <div className="fixed bottom-6 right-6">
        <ThemeToggleButton onToggle={toggleTheme} />
      </div>
    </div>
  );
}
