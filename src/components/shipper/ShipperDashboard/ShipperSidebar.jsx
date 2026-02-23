import React, { useState, useEffect } from "react";
import BrandLogo from "../../common/BrandLogo";
export default function ShipperSidebar({
  open,
  setOpen,
  activeTab: activeTabProp,
  onSelect,
}) {
  const [activeTab, setActiveTab] = useState(activeTabProp ?? "neworders");

  useEffect(() => {
    if (activeTabProp !== undefined) setActiveTab(activeTabProp);
  }, [activeTabProp]);

  const handleSelect = (key) => {
    if (activeTabProp === undefined) setActiveTab(key);
    onSelect?.(key);
    if (setOpen) setOpen(false);
  };
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`
          bg-navy-dark
        fixed lg:static z-50
        w-64 bg-navy-sidebar text-white
           h-screen flex flex-col
        transform transition-transform
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        `}
      >
        <div className="p-4 font-bold border-b border-white/10">
          <BrandLogo />
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <SidebarItem
            icon="shopping_cart"
            text="Đơn mới"
            active={activeTab === "neworders"}
            onClick={() => handleSelect("neworders")}
          />

          <SidebarItem
            icon="local_shipping"
            text="Đang giao"
            active={activeTab === "intransit"}
            onClick={() => handleSelect("intransit")}
          />

          <SidebarItem
            icon="check_circle"
            text="Hoàn thành"
            active={activeTab === "completed"}
            onClick={() => handleSelect("completed")}
          />
          <SidebarItem
            icon="cancel"
            text="Đã Hủy đơn"
            active={activeTab === "cancelled"}
            onClick={() => handleSelect("cancelled")}
          />
        </nav>
      </aside>
    </>
  );
}

function SidebarItem({ icon, text, active, onClick }) {
  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === " ") onClick?.();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKey}
      className={`
      flex items-center gap-3 p-3 rounded-lg cursor-pointer select-none
      ${active ? "bg-primary" : "hover:bg-white/10"}
      `}
    >
      <span className="material-symbols-outlined">{icon}</span>
      {text}
    </div>
  );
}
