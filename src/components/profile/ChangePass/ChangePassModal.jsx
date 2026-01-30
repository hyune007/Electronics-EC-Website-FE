import { useState } from "react";
import vi from "../../../i18n/vi";

export default function ChangePassModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    current: "",
    password: "",
    confirm: "",
  });

  const handleChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      alert("Mật khẩu mới không khớp");
      return;
    }
    onSubmit?.(form);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="rounded-lg w-full max-w-md p-6 border bg-white dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700">
        <h3 className="text-lg font-semibold mb-4">
          {vi.profile.changePass.modalTitle}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm dark:text-slate-300 mb-1">
              {vi.profile.changePass.current}
            </label>
            <input
              name="current"
              type="password"
              placeholder={vi.profile.changePass.current}
              value={form.current}
              onChange={handleChange}
              className="w-full border rounded-md p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm dark:text-slate-300 mb-1">
              {vi.profile.changePass.new}
            </label>
            <input
              name="password"
              type="password"
              placeholder={vi.profile.changePass.new}
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded-md p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm dark:text-slate-300 mb-1">
              {vi.profile.changePass.confirm}
            </label>
            <input
              name="confirm"
              type="password"
              placeholder={vi.profile.changePass.confirm}
              value={form.confirm}
              onChange={handleChange}
              className="w-full border rounded-md p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 dark:text-slate-300"
            >
              {vi.profile.changePass.cancel}
            </button>
            <button
              type="submit"
              className="bg-[var(--color-primary)] px-4 py-2 rounded-md hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              {vi.profile.changePass.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
