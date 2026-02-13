import React, { useState } from "react";
import CanceledOrderTable from "./CanceledOrderTable";

export default function CanceledOrder() {
  const [selectedOrder, setSelectedOrder] = useState(null);

  return (
    <div className=" p-6 ">
      <CanceledOrderTable onSelectOrder={setSelectedOrder} selectedOrder={selectedOrder} />
    </div>
  );
}