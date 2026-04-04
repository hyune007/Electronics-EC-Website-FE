import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import VoucherStatistics from "./VoucherStatistics";

export default function VoucherStatisticsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
          <p className="text-sm text-slate-600 font-medium">Đang khởi tạo trung tâm thống kê voucher...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Thống Kê Voucher</h1>
          <p className="text-slate-600 mt-2">Báo cáo hiệu suất chương trình khuyến mãi, trạng thái vòng đời và khả năng phủ trên sản phẩm.</p>
        </div>

        <VoucherStatistics />
      </div>
    </div>
  );
}
