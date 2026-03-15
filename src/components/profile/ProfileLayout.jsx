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

  return (
    <div className="bg-transparent text-[var(--color-text)]">
      <main className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <Sidebar onSelectView={setView} view={view} />
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 lg:hidden">
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
