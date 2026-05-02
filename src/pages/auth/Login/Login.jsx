import "./Login.css";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import vi from "../../../i18n/vi.js";
import useTheme from "../../../hooks/useTheme";
import AuthLeft from "../../../components/layout/auth/AuthLeft/AuthLeft.jsx";
import ThemeToggleButton from "../../../components/common/ThemeToggleButton.jsx";
import BrandLogo from "../../../components/common/BrandLogo.jsx";
import {
  login as loginApi,
  loginEmployee as loginEmployeeApi,
  loginWithGoogle as loginWithGoogleApi,
} from "../../../services/authService.js";
import { useAuth } from "../../../hooks/useAuth";

export default function Login() {
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user } = useAuth();

  const [loginType, setLoginType] = useState("customer"); // "customer" or "employee"
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const resolvePostLoginPath = (roleId) => {
    const fromPath = location.state?.from?.pathname;
    const isAdminRole = roleId === "ROLE_ADMIN" || roleId === "ROLE_EMPLOYEE";

    if (roleId === "ROLE_SHIPPER") {
      return "/shipper-dashboard";
    }

    if (isAdminRole) {
      return "/admin/dashboard";
    }

    if (fromPath && (fromPath.startsWith("/admin") || fromPath.startsWith("/shipper"))) {
      return "/home";
    }

    return fromPath || "/home";
  };

  // Redirect based on role if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const roleId = user.roleId;
      const destination = resolvePostLoginPath(roleId);
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginTypeChange = (type) => {
    setLoginType(type);
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      // Call appropriate API based on login type
      const response =
        loginType === "customer"
          ? await loginApi(formData)
          : await loginEmployeeApi(formData);

      if (!response || !response.token) {
        setErrorMessage("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
        return;
      }

      // Store auth data
      login({ ...response, email: formData.email });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    setErrorMessage("");
    setIsGoogleLoading(true);

    try {
      const response = await loginWithGoogleApi(credentialResponse.credential);

      if (!response || !response.token) {
        setErrorMessage("Đăng nhập Google thất bại. Vui lòng thử lại.");
        return;
      }

      // Store auth data
      login(response);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        "Đăng nhập Google thất bại. Vui lòng thử lại.";
      setErrorMessage(message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    setErrorMessage("Đăng nhập Google thất bại. Vui lòng thử lại.");
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
          <div className="max-w-xs sm:max-w-sm md:max-w-md mx-auto w-full px-4 sm:px-6 my-auto">
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

            {/* Login Type Toggle */}
            <div className="flex mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              <button
                type="button"
                onClick={() => handleLoginTypeChange("customer")}
                className={`flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  loginType === "customer"
                    ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {vi.auth.login.loginTypeCustomer}
              </button>
              <button
                type="button"
                onClick={() => handleLoginTypeChange("employee")}
                className={`flex-1 py-2 px-4 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  loginType === "employee"
                    ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {vi.auth.login.loginTypeEmployee}
              </button>
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

            {/* Only show Google login and register link for customers */}
            {loginType === "customer" && (
              <>
                <div className="mt-8 flex items-center gap-4">
                  <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {vi.auth.login.orLoginWith}
                  </span>
                  <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="mt-8 flex justify-center">
                  {isGoogleLoading ? (
                    <div className="w-full flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 font-semibold py-2.5 px-4 rounded-xl">
                      Đang xử lý...
                    </div>
                  ) : (
                    <GoogleLogin
                      onSuccess={handleGoogleLoginSuccess}
                      onError={handleGoogleLoginError}
                      theme="outline"
                      size="large"
                      shape="rectangular"
                      text="signin_with"
                      width="320"
                      logo_alignment="left"
                    />
                  )}
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
              </>
            )}
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
