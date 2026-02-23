import React, { useState } from "react";
import CompletedOrderTable from "./CompletedOrderTable";

export default function Completed() {
  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
    <div className=" p-6 ">
      <CompletedOrderTable
        onSelectOrder={setSelectedOrder}
        selectedOrder={selectedOrder}
      />
    </div>
  );
}
