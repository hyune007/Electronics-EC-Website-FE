import { useState } from "react";
import useTheme from "../../../hooks/useTheme";
import vi from "../../../i18n/vi";

export default function AddressModal({ open, onClose, onSave }) {
  const { theme } = useTheme();
  const [addr, setAddr] = useState({
    city: "",
    ward: "",
    street: "",
    detail: "",
    default: false,
  });

  const CITIES = [
    { value: "hcm", label: "Hồ Chí Minh" },
    { value: "hn", label: "Hà Nội" },
    { value: "dn", label: "Đà Nẵng" },
  ];

  const WARDS = {
    hcm: ["Quận 1", "Quận 3", "Quận 5"],
    hn: ["Ba Đình", "Hoàn Kiếm", "Đống Đa"],
    dn: ["Hải Châu", "Sơn Trà"],
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div
        className={`p-6 rounded-lg w-full max-w-md border ${
          theme === "dark"
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
              onChange={(e) =>
                setAddr({ ...addr, city: e.target.value, ward: "" })
              }
              className="w-full border rounded-md p-2"
            >
              <option value="">{vi.profile.address.modal.selectCity}</option>
              {CITIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm dark:text-slate-300 mb-1">
              {vi.profile.address.modal.ward}
            </label>
            <select
              value={addr.ward}
              onChange={(e) => setAddr({ ...addr, ward: e.target.value })}
              className="w-full border rounded-md p-2"
            >
              <option value="">{vi.profile.address.modal.selectWard}</option>
              {(WARDS[addr.city] || []).map((w, i) => (
                <option key={i} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm dark:text-slate-300 mb-1">
              {vi.profile.address.modal.street}
            </label>
            <input
              placeholder={vi.profile.address.modal.streetPlaceholder}
              value={addr.street}
              onChange={(e) => setAddr({ ...addr, street: e.target.value })}
              className="w-full border rounded-md p-2"
            />
          </div>

          <div>
            <label className="block text-sm dark:text-slate-300 mb-1">
              {vi.profile.address.modal.detail}
            </label>
            <textarea
              placeholder={vi.profile.address.modal.detailPlaceholder}
              value={addr.detail}
              onChange={(e) => setAddr({ ...addr, detail: e.target.value })}
              className="w-full border rounded-md p-2 h-24"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-md">
            {vi.profile.address.modal.cancel}
          </button>
          <button
            onClick={() => {
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
