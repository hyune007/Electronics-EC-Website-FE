import "./Register.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import useTheme from "../../../hooks/useTheme";
import AuthLeft from "../../../components/layout/auth/AuthLeft/AuthLeft.jsx";
import ThemeToggleButton from "../../../components/common/ThemeToggleButton.jsx";
import BrandLogo from "../../../components/common/BrandLogo.jsx";
import vi from "../../../i18n/vi.js";
import { register, loginWithGoogle as loginWithGoogleApi } from "../../../services/authService.js";
import { useAuth } from "../../../hooks/useAuth";
import { decodeJwtPayload } from "../../../utils/jwt.js";

export default function Register() {
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage(vi.auth.register.mismatch);
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });

      navigate("/login", {
        state: { message: "Đăng ký thành công! Vui lòng đăng nhập." },
      });
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        "Đăng ký thất bại. Vui lòng thử lại.";
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
        setErrorMessage("Đăng ký bằng Google thất bại. Vui lòng thử lại.");
        return;
      }

      // Store auth data and redirect
      login(response);

      const payload = decodeJwtPayload(response.token);
      const roleId = payload?.roleId;
      if (roleId === "ROLE_ADMIN" || roleId === "ROLE_EMPLOYEE") {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        "Đăng ký bằng Google thất bại. Vui lòng thử lại.";
      setErrorMessage(message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleLoginError = () => {
    setErrorMessage("Đăng ký bằng Google thất bại. Vui lòng thử lại.");
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
          <div className="max-w-[340px] mx-auto w-full py-8">
            <div className="lg:hidden text-center mb-6">
              <div className=" flex justify-center ">
                <a href="/" className="block">
                  <div className="w-[180px] h-[40px] overflow-hidden">
                    <BrandLogo />
                  </div>
                </a>
              </div>
            </div>
            <div className="mb-8 text-left">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 title-center">
                {vi.auth.register.title}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-[420px] mx-auto text-xs">
                {vi.auth.register.description}
              </p>
            </div>
            <form className="space-y-2" onSubmit={handleSubmit}>
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
                  htmlFor="name"
                >
                  {vi.auth.register.fullName}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                    person
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    id="name"
                    name="name"
                    placeholder="Nguyễn Văn A"
                    required
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
                  htmlFor="email"
                >
                  {vi.auth.register.email}
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
                <label
                  className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
                  htmlFor="phone"
                >
                  {vi.auth.register.phone}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                    call
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    id="phone"
                    name="phone"
                    placeholder="0123 456 789"
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
                  htmlFor="password"
                >
                  {vi.auth.register.password}
                </label>
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
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
                  htmlFor="confirm_password"
                >
                  {vi.auth.register.confirmPassword}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                    shield
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    id="confirm_password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    required
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
              {errorMessage ? (
                <p className="text-xs text-red-600 dark:text-red-400">
                  {errorMessage}
                </p>
              ) : null}
              <div className="pt-2">
                <button
                  className="w-full bg-primary hover:bg-[#0a2d4d] text-white font-bold py-2 px-3 rounded-xl shadow-lg shadow-primary/20 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
                  type="submit"
                  disabled={isSubmitting}
                >
                  <span>
                    {isSubmitting
                      ? "Đang xử lý..."
                      : vi.auth.register.registerNow}
                  </span>
                  <span className="material-symbols-outlined text-base">
                    person_add
                  </span>
                </button>
              </div>
            </form>
            <div className="mt-6">
              <div className="relative flex items-center py-1.5">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                <span className="flex-shrink mx-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  {vi.auth.register.orRegisterWith}
                </span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="mt-4 flex justify-center">
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
                    text="continue_with"
                    width="340"
                    logo_alignment="left"
                  />
                )}
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {vi.auth.register.haveAccount}
                <a
                  className="font-bold text-primary dark:text-blue-400 hover:underline transition-colors ml-1"
                  href="/login"
                >
                  {vi.auth.register.login}
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="fixed bottom-6 right-6">
        <ThemeToggleButton onToggle={toggleTheme} />
      </div>
    </div>
  );
}
