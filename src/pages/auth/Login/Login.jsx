import "./Login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import vi from "../../../i18n/vi.js";
import useTheme from "../../../hooks/useTheme";
import AuthLeft from "../../../components/layout/auth/AuthLeft/AuthLeft.jsx";
import ThemeToggleButton from "../../../components/common/ThemeToggleButton.jsx";
import BrandLogo from "../../../components/common/BrandLogo.jsx";
import { login } from "../../../services/authService.js";
import { decodeJwtPayload } from "../../../utils/jwt.js";
export default function Login() {
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const data = await login(formData);
      const payload = decodeJwtPayload(data?.token);

      if (!payload) {
        setErrorMessage("Token không hợp lệ.");
        return;
      }

      localStorage.setItem("authToken", data.token);

      navigate("/test-login", {
        state: {
          token: data.token,
          id: payload.sub,
          roleId: payload.roleId,
        },
      });
    } catch (error) {
      const message =
        error?.response?.data ||
        error?.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-sans transition-colors duration-200">
      <div className="auth-container h-screen dark:bg-black">
        <AuthLeft />
        <div
          className="auth-right dark:bg-background-dark overflow-y-auto items-center"
          style={{
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="max-w-[320px] mx-auto w-full my-auto">
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
                {vi.auth.login.title}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-xs">
                {vi.auth.login.description}
              </p>
            </div>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
                  htmlFor="email"
                >
                  {vi.auth.login.email}
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
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400"
                    htmlFor="password"
                  >
                    {vi.auth.login.password}
                  </label>
                  <a
                    className="text-xs font-semibold text-primary dark:text-blue-400 hover:underline"
                    href="/forgot-password"
                  >
                    {vi.auth.login.forgotPassword}
                  </a>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                    lock
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
              {errorMessage ? (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errorMessage}
                </p>
              ) : null}
              <button
                className="w-full bg-primary hover:bg-[#0a2d4d] text-white font-bold py-2 px-3 mt-4 rounded-xl shadow-lg shadow-primary/20 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 "
                type="submit"
                disabled={isSubmitting}
              >
                <span>
                  {isSubmitting ? "Đang đăng nhập..." : vi.auth.login.login}
                </span>
                <span className="material-symbols-outlined text-base">
                  login
                </span>
              </button>
            </form>
            <div className="mt-8 flex items-center gap-4">
              <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                {vi.auth.login.orLoginWith}
              </span>
              <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="mt-8">
              <button
                className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-2.5 px-4 rounded-xl shadow-sm transition-all transform active:scale-[0.99]"
                type="button"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  ></path>
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  ></path>
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  ></path>
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  ></path>
                </svg>
                <span>{vi.auth.login.continueWithGoogle}</span>
              </button>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {vi.auth.login.noAccount}
                <a
                  className="font-bold text-primary dark:text-blue-400 hover:underline transition-colors"
                  href="/register"
                >
                  {vi.auth.login.registerNow}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Nut doi trang thai */}
      <div className="fixed bottom-6 right-6">
        <ThemeToggleButton onToggle={toggleTheme} />
      </div>
    </div>
  );
}
