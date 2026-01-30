import React, { useState } from "react";
import Sidebar from "../../../components/profile/aside/SidebarProfile/SidebarProfile";
import ProfileLayout from "../../../components/profile/ProfileLayout";
import MyOrder from "../../../components/profile/MyOrder";
import Information from "../../../components/profile/Information/Information";
import Address from "../../../components/profile/Address/Address";
import ChangePass from "../../../components/profile/ChangePass/ChangePass";

export default function Profile() {
  const [view, setView] = useState("information");

  return (
    <div>
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex gap-8">
          <Sidebar onSelectView={setView} view={view} />
          <div className="flex-1">
            <ProfileLayout view={view} setView={setView}>
              {view === "information" && <Information />}
              {view === "myorder" && <MyOrder />}
              {view === "address" && <Address />}
              {view === "setting" && <ChangePass />}
            </ProfileLayout>
          </div>
        </div>
      </main>
    </div>
  );
}
