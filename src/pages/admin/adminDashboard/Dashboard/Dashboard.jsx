import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, Package, Users, Calendar, ArrowUp } from "lucide-react";
import "./Dashboard.css";
import "./Dashboard.css";
import { useDashboardLogic } from "./Dashboardlogic.js";
import { preloadAllData, shouldPreload } from "../../../../utils/preloadData";

export default function Dashboard() {
  const { loading, error, revenue, stats, revenueByMonth } = useDashboardLogic();
  const [mounted, setMounted] = useState(false);

  // Animation cho số liệu chạy lên (revenue count-up)
  const [displayRevenue, setDisplayRevenue] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Load ngầm dữ liệu trong background
  useEffect(() => {
    if (!shouldPreload()) return;

    console.log("🔄 Starting background data preload...");

    preloadAllData({
      onProgress: (value) => {
        if (value === 100) {
          console.log("✅ Preload completed!");
        }
      },
      onPhaseChange: (phase) => {
        console.log("📊 Preload phase:", phase);
      }
    }).catch((err) => {
      console.error("❌ Preload failed:", err);
    });
  }, []);

  useEffect(() => {
    if (loading) return; // Không animate nếu vẫn đang load

    let start = 0;
    const end = revenue;
    const duration = 1200; // ms
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = end / steps;

    if (end === 0) {
      setDisplayRevenue(0);
      return;
    }

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setDisplayRevenue(Math.floor(start));
    }, stepTime);

    return () => clearInterval(timer);
  }, []);

  const getIconForStat = (title) => {
    if (title.includes("đơn hàng")) return Package;
    if (title.includes("khách hàng")) return Users;
    if (title.includes("sản phẩm")) return Package;
    return TrendingUp;
  };

  const getColorForStat = (index) => {
    const colors = ["primary", "emerald", "amber", "red"];
    return colors[index % colors.length];
  };

  return (
    <div className={`fade-in min-h-full ${mounted ? 'slide-up' : ''}`}>
      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Tổng Quan</h1>
          <p className="text-neutral-600">Xem tổng quan về hoạt động kinh doanh</p>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-neutral-600 font-medium">Đang tải dữ liệu, vui lòng chờ...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-center">
          Có lỗi xảy ra khi tải dữ liệu: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = getIconForStat(stat.title.toLowerCase());
              const color = getColorForStat(index);
              return (
                <div key={index} className={`card p-6 table-row`} style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-neutral-600 text-sm font-medium mb-1">{stat.title}</p>
                      <p className="text-2xl font-bold text-neutral-900">{stat.value.toLocaleString()}</p>
                    </div>
                    <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
                      <Icon className={`text-${color}-600`} size={24} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Revenue Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Revenue Card */}
            <div className="lg:col-span-2 card p-8 table-row" style={{ animationDelay: '400ms' }}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-1">Tổng Doanh Thu</h3>
                  <p className="text-neutral-600 text-sm">Cập nhật theo thời gian thực</p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="text-primary-600" size={24} />
                </div>
              </div>

              <div className="mb-6">
                <div className="text-4xl font-bold text-neutral-900 mb-2">
                  {displayRevenue.toLocaleString('vi-VN')} ₫
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-emerald-600 font-medium">+12.5%</span>
                  <span className="text-neutral-600">so với tháng trước</span>
                  <ArrowUp className="text-emerald-600" size={16} />
                </div>
              </div>

              {/* Revenue Chart Placeholder */}
              <div className="h-32 bg-neutral-50 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="text-neutral-400 mx-auto mb-2" size={32} />
                  <p className="text-neutral-600 text-sm">Biểu đồ doanh thu</p>
                </div>
              </div>
            </div>

            {/* Monthly Revenue List */}
            <div className="card p-6 table-row" style={{ animationDelay: '500ms' }}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-900">Doanh Thu Tháng</h3>
                <Calendar className="text-neutral-400" size={20} />
              </div>

              <div className="space-y-3 max-h-80 overflow-y-auto">
                {revenueByMonth.map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Tháng {month.month}</p>
                      <p className="text-xs text-neutral-600">2024</p>
                    </div>
                    <p className="text-sm font-semibold text-neutral-900">
                      {month.value.toLocaleString('vi-VN')} ₫
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
