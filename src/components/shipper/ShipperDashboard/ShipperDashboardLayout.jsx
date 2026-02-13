import React, { useState } from "react";
import "leaflet/dist/leaflet.css";
import ShipperSidebar from "../../../components/shipper/ShipperDashboard/ShipperSidebar";
import ShipperHeader from "../../../components/shipper/ShipperDashboard/ShipperHeader";
import Tabs from "../../../components/shipper/ShipperDashboard/Tabs/Tabs";
import NewOrderList from "./Tabs/NewOrderList/NewOrderList";
import InTransitOrder from "./Tabs/InTransitOrder/InTransitOrder";
import Completed from "./Tabs/Completed/Completed";
import CanceledOrder from "./Tabs/CanceledOrder/CanceledOrder";
export default function ShipperDashboard() {
  const [view, setView] = useState("neworders");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-background-light dark:bg-background-dark text-sm">
      <ShipperSidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        activeTab={view}
        onSelect={setView}
      />
      <div className="flex flex-col flex-1">
        <ShipperHeader toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <Tabs view={view} setView={setView}>
          {view === "neworders" && <NewOrderList />}
          {view === "intransit" && <InTransitOrder />}
          {view === "completed" && <Completed />}
          {view === "cancelled" && <CanceledOrder />}
        </Tabs>
      </div>
    </div>
  );
}
