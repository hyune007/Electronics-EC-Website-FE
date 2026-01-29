import { useState } from "react";
import AddressModal from "./AddressModal";
import vi from "../../../i18n/vi";

export default function Address() {
  const [addresses, setAddresses] = useState([]);
  const [open, setOpen] = useState(false);

  const addAddress = (addr) => {
    setAddresses((prev) => [...prev, addr]);
  };

  return (
    <div className="rounded-2xl border p-6 bg-white dark:bg-slate-800 dark:text-slate-100">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 rounded-lg bg-[var(--accent-light)] dark:bg-slate-700">
          <span className="material-symbols-outlined">location_on</span>
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{vi.profile.address.title}</h1>
          <p className="text-sm dark:text-slate-300">
            {vi.profile.address.desc}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <select className="flex-1 border rounded-lg p-3 bg-transparent">
          {addresses.length === 0 && (
            <option>{vi.profile.address.noAddress}</option>
          )}
          {addresses.map((a, i) => (
            <option key={i}>{`${a.city} - ${a.ward} - ${a.street}`}</option>
          ))}
        </select>

        <button
          onClick={() => setOpen(true)}
          className="bg-[var(--color-primary)] text-white px-5 py-2 rounded-md font-semibold shadow hover:opacity-95"
        >
          {vi.profile.address.addButton}
        </button>
      </div>

      {addresses.length > 0 && (
        <div className="space-y-3">
          {addresses.map((a, i) => (
            <div key={i} className="p-4 rounded-xl border">
              <div className="font-semibold">
                {`${a.city}, ${a.ward}, ${a.street}`}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-300">
                {a.detail}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddressModal
        open={open}
        onClose={() => setOpen(false)}
        onSave={addAddress}
      />
    </div>
  );
}
