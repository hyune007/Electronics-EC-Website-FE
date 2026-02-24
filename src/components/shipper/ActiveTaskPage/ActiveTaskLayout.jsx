import React, { useEffect, useState } from "react";
import ActiveTaskHeader from "./ActiveTaskHeader";
import TaskInfoPanel from "./TaskInfoPanel";
import NavigationMap from "./NavigationMap";
import BottomActionBar from "./BottomActionBar";
import { getAllBills } from "../../../services/billService";
import { useParams } from "react-router-dom";

export default function ActiveTaskLayout() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllBills()
      .then((res) => {
        const found = res.data.find((b) => b.id === orderId);
        setOrder(found);
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return <div className="text-white p-4">Đang tải đơn hàng...</div>;
  }

  if (!order) {
    return <div>Không tìm thấy đơn</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-background-dark text-white">
      <ActiveTaskHeader />
      <main className="flex flex-1 overflow-hidden">
        <div
          className="
          hidden lg:flex
          lg:w-[420px]
          border-r border-slate-800
        "
        >
          <TaskInfoPanel order={order} />
        </div>
        <div className="flex-1 relative">
          <NavigationMap order={order} />
        </div>
      </main>
      <div className="lg:hidden border-t border-slate-800 max-h-[40vh] overflow-y-auto">
        <TaskInfoPanel order={order} />
      </div>
      <BottomActionBar order={order} />
    </div>
  );
}
