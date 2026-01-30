import React from "react";
import { NavLink } from "react-router-dom";
export default function UserDropdown({ open, onClose, onLogout }) {
  if (!open) return null;

  return (
    <div className="absolute right-0 top-full mt-3 w-52 z-50 origin-top-right">
      <div className="rounded-xl shadow-lg border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-slate-100 overflow-hidden">
        
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
          <p className="text-sm font-semibold">Tài khoản</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Quản lý thông tin cá nhân
          </p>
        </div>
        
        <div className="py-1">
        <NavLink to="/profile" onClick={onClose}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors" >
        
            <span className="material-symbols-outlined text-[18px]">
              person
            </span>
            Hồ sơ cá nhân
          </NavLink>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              logout
            </span>
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
