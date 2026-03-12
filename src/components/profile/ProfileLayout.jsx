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

  return (
    <div>
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex gap-8">
          <Sidebar onSelectView={setView} view={view} />
          <div className="flex-1">
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
