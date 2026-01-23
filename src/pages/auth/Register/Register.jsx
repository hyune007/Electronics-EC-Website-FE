import "./Register.css";
import useTheme from "../../../hooks/useTheme";
import AuthLeft from "../../../components/layout/auth/AuthLeft/AuthLeft.jsx";
import ThemeToggleButton from "../../../components/layout/common/ThemeToggleButton.jsx";
import vi from "../../../i18n/vi.js";
export default function Register() {
  const { toggleTheme } = useTheme();

  return (
    <div className="bg-background-light dark:bg-background-dark font-sans transition-colors duration-200">
      <div className="auth-container h-screen dark:bg-black">
        <AuthLeft />
        <div
          className="auth-right dark:bg-background-dark overflow-y-auto items-start"
          style={{
            justifyContent: "flex-start",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div className="max-w-[420px] mx-auto w-full py-12">
            <div className="lg:hidden text-center mb-8">
              <div className=" flex justify-center ">
                <a href="/" className="block">
                  <div className="w-[190px] h-[40px] overflow-hidden">
                    <img
                      src="src/assets/logo/UBrainTech.png"
                      alt="UBrain Tech"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </a>
              </div>
            </div>
            <div className="mb-8 text-left">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-3 title-center">
                {vi.auth.register.title}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 leading-relaxed max-w-[520px] mx-auto text-md">
                {vi.auth.register.description}
              </p>
            </div>
            <form action="#" className="space-y-4" method="POST">
              <div>
                <label
                  className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2"
                  htmlFor="name"
                >
                  {vi.auth.register.fullName}
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                    person
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    id="name"
                    name="name"
                    placeholder="Nguyễn Văn A"
                    required=""
                    type="text"
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
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                    mail
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    id="email"
                    name="email"
                    placeholder="example@ubrain.com"
                    required=""
                    type="email"
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
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                    call
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    id="phone"
                    name="phone"
                    placeholder="0123 456 789"
                    required=""
                    type="tel"
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
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                    lock
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required=""
                    type="password"
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
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                    shield
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    id="confirm_password"
                    name="confirm_password"
                    placeholder="••••••••"
                    required=""
                    type="password"
                  />
                </div>
              </div>
              <div className="pt-4">
                <button
                  className="w-full bg-primary hover:bg-[#0a2d4d] text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all transform active:scale-[0.99] flex items-center justify-center gap-2"
                  type="submit"
                >
                  <span>{vi.auth.register.registerNow}</span>
                  <span className="material-symbols-outlined text-xl">
                    person_add
                  </span>
                </button>
              </div>
            </form>
            <div className="mt-8">
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                <span className="flex-shrink mx-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                  {vi.auth.register.orRegisterWith}
                </span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="mt-6">
                <button className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold py-3.5 px-6 rounded-xl shadow-sm transition-all flex items-center justify-center gap-3">
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
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      fill="#FBBC05"
                    ></path>
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    ></path>
                  </svg>
                  <span>{vi.auth.register.continueWithGoogle}</span>
                </button>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
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
      {/* Nut doi trang thai */}
      <div className="fixed bottom-6 right-6">
        <ThemeToggleButton onToggle={toggleTheme} />
      </div>
    </div>
  );
}
