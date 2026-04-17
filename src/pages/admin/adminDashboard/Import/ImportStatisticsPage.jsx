import React from "react";
import { Loader2 } from "lucide-react";
import { useImportLogic } from "./ImportLogic.js";
import ImportStatistics from "./ImportStatistics.jsx";

export default function ImportStatisticsPage() {
  const im = useImportLogic();

  if (im.loading && im.filteredList.length === 0) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[60vh]">
        <Loader2 className="animate-spin text-primary-600 mr-3" size={32} />
        <span className="text-lg font-medium text-neutral-600">Đang đồng bộ dữ liệu nhập kho...</span>
      </div>
    );
  }

  return (
    <div className="min-h-full fade-in slide-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Thống Kê Nhập Kho</h1>
        <p className="text-neutral-600">Báo cáo chi tiết về lịch sử nhập kho, giá trị hàng hóa và quản lý tồn kho</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <ImportStatistics imports={im.filteredList} />
      </div>
    </div>
  );
}
