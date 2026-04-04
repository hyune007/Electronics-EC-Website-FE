import React from "react";
import ProductStatistics from "./ProductStatistics.jsx";
import { useProductManageLogic } from "./Productlogic.js";
import { Loader2 } from "lucide-react";

export default function ProductStatisticsPage() {
    const pm = useProductManageLogic();

    if (pm.loading && pm.products.length === 0) {
        return (
            <div className="flex justify-center items-center py-20 min-h-[60vh]">
                <Loader2 className="animate-spin text-primary-600 mr-3" size={32} />
                <span className="text-lg font-medium text-neutral-600">Đang tải dữ liệu thống kê...</span>
            </div>
        );
    }

    return (
        <div className="min-h-full fade-in slide-up">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">Thống Kê Sản Phẩm</h1>
                <p className="text-neutral-600">Báo cáo báo quát về tình trạng kho, biến động và phân mảnh sản phẩm</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <ProductStatistics 
                    products={pm.allProducts}
                    globalStats={pm.globalStats}
                    brands={pm.brands}
                    categories={pm.categories}
                />
            </div>
        </div>
    );
}
