// import React, { useState } from "react";
import Sidebar from "./aside/SidebarProfile/SidebarProfile";
import MyOrder from "./MyOrder";
import Information from "./Information/Information";
import Address from "./Address/Address";
import ChangePass from "./ChangePass/ChangePass";
import ShowInfor from "./ShowInfor/ShowInfor";
import { useSearchParams } from "react-router-dom";

export default function ProfileLayout() {
  // const [view, setView] = useState("information");
  const [searchParams, setSearchParams] = useSearchParams();

  const view = searchParams.get("tab") || "information";

  const setView = (v) => {
    setSearchParams({ tab: v });
  };

  const PROFILE_TAB_LABELS = {
    information: "Thông tin",
    myorder: "Đơn hàng của tôi",
    address: "Địa chỉ",
    setting: "Cài đặt",
  };

  const PROFILE_TABS = [
    { key: "information", label: "Thông tin", icon: "info" },
    { key: "myorder", label: "Đơn hàng", icon: "package_2" },
    { key: "address", label: "Địa chỉ", icon: "location_on" },
    { key: "setting", label: "Cài đặt", icon: "settings" },
  ];

  return (
    <div className="bg-transparent text-[var(--color-text)]">
      <main className="mx-auto w-full max-w-[1440px] px-3 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-8">
          <div className="lg:hidden">
            <div className="mb-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2 shadow-sm">
              <div className="mb-2 flex items-center justify-between px-2">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-text-muted)]">
                  Hồ sơ của bạn
                </p>
                <p className="text-xs font-medium text-[var(--color-text-muted)]">
                  {PROFILE_TAB_LABELS[view] || "Thông tin"}
                </p>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {PROFILE_TABS.map((tab) => {
                  const active = view === tab.key;

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setView(tab.key)}
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-colors duration-220 ease-standard ${
                        active
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                          : "border-[var(--color-border)] bg-transparent text-[var(--color-text)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {tab.icon}
                      </span>
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <Sidebar onSelectView={setView} view={view} />
          <div className="min-w-0 flex-1">
            <div className="mb-3 hidden items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 lg:flex">
              <p className="text-xs uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
                Đang xem
              </p>
              <p className="text-sm font-semibold text-[var(--color-text)]">
                {PROFILE_TAB_LABELS[view] || "Thông tin"}
              </p>
            </div>
            <ShowInfor view={view} setView={setView}>
              {view === "information" && <Information />}
              {view === "myorder" && <MyOrder />}
              {view === "address" && <Address />}
              {view === "setting" && <ChangePass />}
            </ShowInfor>
          </div>
        </div>
      </main>
    </div>
  );
}
