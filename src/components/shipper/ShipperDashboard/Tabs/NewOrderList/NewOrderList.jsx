import React, { useState } from "react";
import OrderTable from "./Ordertable";
import MapWidget from "../../../MapWidget";
import StatsCards from "./StatsCards";
export default function NewOrderList() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);

  return (
    <main className="flex-1 overflow-y-auto shipper-scroll p-4 lg:p-8 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OrderTable
            onSelectOrder={setSelectedOrder}
            selectedOrder={selectedOrder}
          />
        </div>
        <MapWidget
          selectedOrder={selectedOrder}
          onDistanceChange={setDistanceKm}
        />
      </div>
      <StatsCards distanceKm={distanceKm} />
    </main>
  );
}
