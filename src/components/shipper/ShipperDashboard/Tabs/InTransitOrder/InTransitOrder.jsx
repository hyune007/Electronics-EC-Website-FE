import React, { useState } from "react";
import TransitOrderTable from "./TransitOrderTable";

export default function InTransitOrder() {
  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
  <div className=" p-6 ">
      <TransitOrderTable
        onSelectOrder={setSelectedOrder}
        selectedOrder={selectedOrder}
      />
    </div>
  );
}
