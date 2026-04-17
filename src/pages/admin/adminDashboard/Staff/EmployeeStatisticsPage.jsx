import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import EmployeeStatistics from './EmployeeStatistics';
import { useEmployeeLogic } from './EmployeeLogic';

export default function EmployeeStatisticsPage() {
  const nv = useEmployeeLogic();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || nv.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600" />
          <p className="text-sm text-slate-600 font-medium">Đang đồng bộ dữ liệu nhân viên...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Thống Kê Nhân Viên</h1>
          <p className="text-slate-600 mt-2">Báo cáo chi tiết về cơ cấu nhân viên, phân bố vai trò và thống kê chi tiết hệ thống.</p>
        </div>

        <EmployeeStatistics employees={nv.employees} />
      </div>
    </div>
  );
}
