import { useState } from "react";
import ChangePassModal from "./ChangePassModal";
import vi from "../../../i18n/vi";
import { changePassword } from "../../../services/customer/customerService";
import LoadingCircle from "../../common/LoadScreen";
const decodeJwt = (token) => {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1];
    const padded = payload.padEnd(
      payload.length + ((4 - (payload.length % 4)) % 4),
      "=",
    );
    const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(base64);
    return JSON.parse(json);
  } catch (e) {
    void e;
    return null;
  }
};

export default function ChangePass() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const handleChangePassword = async (form) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        alert("Bạn chưa đăng nhập");
        return;
      }
      const decoded = decodeJwt(token);
      const customerId = decoded.sub;
      await changePassword(customerId, form.password);
      alert("Đổi mật khẩu thành công");
      setOpen(false);
    } catch (error) {
      console.error(error);
      alert("Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {" "}
      <LoadingCircle show={loading} />
      <div className="rounded-2xl shadow-sm border p-6 bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 rounded-lg bg-[var(--accent-light)] dark:bg-slate-700 dark:text-slate-100">
            <span className="material-symbols-outlined">lock</span>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-semibold">
              {vi.profile.changePass.title}
            </h1>
            <p className="text-sm mt-1 dark:text-slate-300">
              {vi.profile.changePass.desc}
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-md font-semibold shadow hover:opacity-95"
          >
            {vi.profile.changePass.button}
          </button>
        </div>

        <ChangePassModal
          open={open}
          onClose={() => setOpen(false)}
          onSubmit={handleChangePassword}
        />
      </div>
    </>
  );
}
