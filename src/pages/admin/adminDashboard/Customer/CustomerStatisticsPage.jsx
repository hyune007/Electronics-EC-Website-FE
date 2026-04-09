import React, { useState, useEffect } from "react";
import CustomerStatistics from "./CustomerStatistics.jsx";
import { useCustomerLogic } from "./CustomerLogic.js";
import { Loader2 } from "lucide-react";

export default function CustomerStatisticsPage() {
    const logic = useCustomerLogic();
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    useEffect(() => {
        if (logic.filteredCustomers && logic.filteredCustomers.length > 0) {
           setIsInitialLoading(false);
        } else {
           // Fallback loading check
           const timer = setTimeout(() => setIsInitialLoading(false), 800);
           return () => clearTimeout(timer);
        }
    }, [logic.filteredCustomers]);

    if (isInitialLoading) {
        return (
            <div className="flex justify-center items-center py-20 min-h-[60vh]">
                <Loader2 className="animate-spin text-blue-600 mr-3" size={32} />
                <span className="text-lg font-medium text-slate-600">Đang đồng bộ dữ liệu người dùng...</span>
            </div>
        );
    }

    return (
        <div className="min-h-full fade-in slide-up">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Thống Kê Khách Hàng</h1>
                <p className="text-slate-600">Báo cáo chi tiết hồ sơ khách hàng, hành vi mua sắm và chất lượng dữ liệu</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <CustomerStatistics 
                    customers={logic.filteredCustomers}
                    globalStats={logic.stats}
                />
            </div>
        </div>
    );
}
