import { useState } from "react";
import useTheme from "../../../hooks/useTheme";
import vi from "../../../i18n/vi";
import addressData from "../../../utils/addressData";

export default function AddressModal({ open, onClose, onSave }) {
  const { theme } = useTheme();
  const [errors, setErrors] = useState({});
  const [addr, setAddr] = useState({
    city: "",
    district: "",
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

    if (!addr.district.trim()) {
      e.district = vi.profile.address.error.districtRequired;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-overlay)] p-4">
      <div
        className={`modal-shell w-full max-w-md border p-6 ${
          theme === "dark" ? "text-slate-100" : "bg-[var(--color-surface)]"
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
              className={`select-default w-full p-2 ${
                errors.city ? "border-[var(--color-danger)]" : ""
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
              {vi.profile.address.modal.district}
            </label>
            <input
              value={addr.district}
              onChange={(e) => {
                setAddr({ ...addr, district: e.target.value });
                setErrors({ ...errors, district: null });
              }}
              className={`input-default w-full p-2 ${
                errors.district ? "border-[var(--color-danger)]" : ""
              }`}
            />
            {errors.district && (
              <p className="text-xs text-red-500 mt-1">{errors.district}</p>
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
              className={`input-default w-full p-2 ${
                errors.ward ? "border-[var(--color-danger)]" : ""
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
              className={`input-default h-24 w-full p-2 ${
                errors.detail ? "border-[var(--color-danger)]" : ""
              }`}
            />
            {errors.detail && (
              <p className="text-xs text-red-500 mt-1">{errors.detail}</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="btn-secondary px-4 py-2">
            {vi.profile.address.modal.cancel}
          </button>
          <button
            onClick={() => {
              if (!validate()) return;
              onSave(addr);
              onClose();
            }}
            className="btn-primary px-4 py-2"
          >
            {vi.profile.address.modal.save}
          </button>
        </div>
      </div>
    </div>
  );
}
