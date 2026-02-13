import React from "react";
export default function ShipperHeader({ toggleSidebar }) {
  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden"
          onClick={toggleSidebar}
        >
          <span className="material-symbols-outlined">
            menu
          </span>
        </button>
        <span className="text-sm font-semibold">
          Bảng điều khiển 
        </span>
      </div>
    </header>
  );
}
