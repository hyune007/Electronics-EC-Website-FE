import React from "react";
import { Loader2 } from "lucide-react";
import { useOrderLogic } from "./OrderLogic.js";
import OrderStatistics from "./OrderStatistics.jsx";

export default function OrderStatisticsPage() {
  const om = useOrderLogic();

  if (om.loading && om.filteredOrders.length === 0) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[60vh]">
        <Loader2 className="animate-spin text-primary-600 mr-3" size={32} />
        <span className="text-lg font-medium text-neutral-600">Đang đồng bộ dữ liệu đơn hàng...</span>
      </div>
    );
  }

  return (
    <div className="min-h-full fade-in slide-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Thống Kê Đơn Hàng</h1>
        <p className="text-neutral-600">Báo cáo chi tiết về doanh thu, cơ cấu đơn hàng và phân tích chuyên sâu</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <OrderStatistics orders={om.filteredOrders} />
      </div>
    </div>
  );
}