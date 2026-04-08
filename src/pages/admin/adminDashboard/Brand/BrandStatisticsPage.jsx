import React from "react";
import { Loader2 } from "lucide-react";
import { useBrandLogic } from "./BrandLogic.js";
import BrandStatistics from "./BrandStatistics.jsx";

export default function BrandStatisticsPage() {
  const bm = useBrandLogic();

  if (bm.loading && bm.filteredBrands.length === 0) {
    return (
      <div className="flex justify-center items-center py-20 min-h-[60vh]">
        <Loader2 className="animate-spin text-primary-600 mr-3" size={32} />
        <span className="text-lg font-medium text-neutral-600">Đang đồng bộ dữ liệu thương hiệu...</span>
      </div>
    );
  }

  return (
    <div className="min-h-full fade-in slide-up">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Thống Kê Thương Hiệu</h1>
        <p className="text-neutral-600">Báo cáo chi tiết về phân bố sản phẩm, cơ cấu hãng và phân tích portela</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <BrandStatistics brands={bm.filteredBrands} />
      </div>
    </div>
  );
}
