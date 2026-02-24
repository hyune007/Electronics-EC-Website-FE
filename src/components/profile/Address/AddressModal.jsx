import { useState } from "react";
import useTheme from "../../../hooks/useTheme";
import vi from "../../../i18n/vi";
import addressData from "../../../utils/addressData";

export default function AddressModal({ open, onClose, onSave }) {
  const { theme } = useTheme();
  const [errors, setErrors] = useState({});
  const [addr, setAddr] = useState({
    city: "",
    ward: "",
    street: "",
    detail: "",
    default: false,
  });

  if (!open) return null;

  const validate = () => {
    const e = {};

    if (!addr.city) {
      e.city = vi.profile.address.error.cityRequired;
    }

    if (!addr.ward.trim()) {
      e.ward = vi.profile.address.error.wardRequired;
    }

    if (!addr.detail.trim() || addr.detail.length < 5) {
      e.detail = vi.profile.address.error.detailInvalid;
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className={`p-6 rounded-lg w-full max-w-md border ${theme === "dark"
          ? "bg-slate-800 text-slate-100 border-slate-700"
          : "bg-white"
          }`}
      >
        <h3 className="text-lg font-bold mb-4">
          {vi.profile.address.modal.title}
        </h3>

        <div className="space-y-3">
          <div>
            <label className="block text-sm dark:text-slate-300 mb-1">
              {vi.profile.address.modal.city}
            </label>
            <select
              value={addr.city}
              onChange={(e) => {
                setAddr({ ...addr, city: e.target.value });
                setErrors({ ...errors, city: null });
              }}
              className={`w-full border rounded-md p-2 ${errors.city ? "border-red-500" : ""
                }`}
            >
              <option value="">{vi.profile.address.modal.selectCity}</option>
              {addressData.map((c) => (
                <option key={c.id} value={c.city}>
                  {c.city}
                </option>
              ))}
            </select>
            {errors.city && (
              <p className="text-xs text-red-500 mt-1">{errors.city}</p>
            )}
          </div>

          <div>
            <label className="block text-sm dark:text-slate-300 mb-1">
              {vi.profile.address.modal.ward}
            </label>
            <input
              value={addr.ward}
              onChange={(e) => {
                setAddr({ ...addr, ward: e.target.value });
                setErrors({ ...errors, ward: null });
              }}
              className={`w-full border rounded-md p-2 ${errors.ward ? "border-red-500" : ""
                }`}
            />
            {errors.ward && (
              <p className="text-xs text-red-500 mt-1">{errors.ward}</p>
            )}
          </div>

          <div>
            <label className="block text-sm dark:text-slate-300 mb-1">
              {vi.profile.address.modal.detail}
            </label>
            <textarea
              value={addr.detail}
              onChange={(e) => {
                setAddr({ ...addr, detail: e.target.value });
                setErrors({ ...errors, detail: null });
              }}
              className={`w-full border rounded-md p-2 h-24 ${errors.detail ? "border-red-500" : ""
                }`}
            />
            {errors.detail && (
              <p className="text-xs text-red-500 mt-1">{errors.detail}</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-md">
            {vi.profile.address.modal.cancel}
          </button>
          <button
            onClick={() => {
              if (!validate()) return;
              onSave(addr);
              onClose();
            }}
            className="px-4 py-2 rounded-md bg-[var(--color-primary)]"
          >
            {vi.profile.address.modal.save}
          </button>
        </div>
      </div>
    </div>
  );
}
