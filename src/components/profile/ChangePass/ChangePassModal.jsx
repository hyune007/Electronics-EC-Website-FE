import { useState } from "react";
import { createPortal } from "react-dom";
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

  const modal = (
    <div
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--color-overlay)] p-4 overflow-auto"
    >
      <div className="modal-shell w-full max-w-md border p-6">
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
              className="input-default w-full p-2"
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
              className="input-default w-full p-2"
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
              className="input-default w-full p-2"
            />
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-4 py-2"
            >
              {vi.profile.changePass.cancel}
            </button>
            <button type="submit" className="btn-primary px-4 py-2">
              {vi.profile.changePass.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
