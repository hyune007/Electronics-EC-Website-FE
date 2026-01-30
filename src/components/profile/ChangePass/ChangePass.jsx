import { useState } from "react";
import ChangePassModal from "./ChangePassModal";
import vi from "../../../i18n/vi";

export default function ChangePass() {
  const [open, setOpen] = useState(false);


  return (
    <div className="rounded-2xl shadow-sm border p-6 bg-white border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
      <div className="flex items-start gap-4 mb-6">
        <div className="p-3 rounded-lg bg-[var(--accent-light)] dark:bg-slate-700 dark:text-slate-100">
          <span className="material-symbols-outlined">lock</span>
        </div>

        <div className="flex-1">
          <h1 className="text-2xl font-semibold">{vi.profile.changePass.title}</h1>
          <p className="text-sm mt-1 dark:text-slate-300">{vi.profile.changePass.desc}</p>
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
      />
    </div>
  );
}
