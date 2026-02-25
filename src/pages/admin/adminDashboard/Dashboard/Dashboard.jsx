import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, Package, Users, Calendar, ArrowUp } from "lucide-react";
import "./Dashboard.css";
import {
  dashboardStats,
  revenueSummary,
  revenueByMonth,
} from "../../../../mocks/mockDashboard.js";
import { preloadAllData, shouldPreload } from "../../../../utils/preloadData";

export default function Dashboard() {
  const [revenue, setRevenue] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [preloadOpen, setPreloadOpen] = useState(false);
  const [preloadProgress, setPreloadProgress] = useState(0);
  const [preloadPhase, setPreloadPhase] = useState("idle");
  const [preloadError, setPreloadError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!shouldPreload()) return;

    let cancelled = false;
    setPreloadOpen(true);
    setPreloadProgress(0);
    setPreloadPhase("loading-initial");
    setPreloadError("");

    preloadAllData({
      onProgress: (value) => {
        if (!cancelled) setPreloadProgress(value);
      },
      onPhaseChange: (phase) => {
        if (!cancelled) setPreloadPhase(phase);
      }
    }).catch((err) => {
      console.error("Preload failed:", err);
      if (!cancelled) {
        setPreloadPhase("error");
        setPreloadError("Không thể preload dữ liệu. Vui lòng kiểm tra API.");
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let start = 0;
    const end = revenueSummary.total;
    const duration = 1200; // ms
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = end / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setRevenue(Math.floor(start));
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
      {preloadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-100 bg-gradient-to-r from-indigo-50 to-amber-50">
              <h2 className="text-xl font-bold text-neutral-900">Dang toi uu du lieu lan dau</h2>
              <p className="text-sm text-neutral-600 mt-1">
                Tai truoc 50% du lieu quan trong de su dung nhanh hon.
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700">
                  {preloadPhase === "loading-initial" && "Dang tai du lieu chinh"}
                  {preloadPhase === "loading-background" && "Dang tai tiep trong nen"}
                  {preloadPhase === "done" && "Hoan tat"}
                  {preloadPhase === "error" && "Co loi xay ra"}
                </span>
                <span className="text-sm font-semibold text-indigo-600">{preloadProgress}%</span>
              </div>

              <div className="h-3 w-full rounded-full bg-neutral-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 transition-all duration-500"
                  style={{ width: `${preloadProgress}%` }}
                />
              </div>

              {preloadError && (
                <div className="text-sm text-red-600">{preloadError}</div>
              )}
            </div>

            <div className="flex items-center justify-between p-6 border-t border-neutral-100 bg-neutral-50">
              <span className="text-xs text-neutral-500">
                Sau khi dat 50%, du lieu con lai se tiep tuc tai ngam.
              </span>
              <button
                onClick={() => setPreloadOpen(false)}
                disabled={preloadProgress < 50}
                className="px-5 py-2.5 rounded-xl text-white bg-indigo-600 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-indigo-700 transition-all"
              >
                Bat dau su dung
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Tổng Quan</h1>
          <p className="text-neutral-600">Xem tổng quan về hoạt động kinh doanh</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {dashboardStats.map((stat, index) => {
          const Icon = getIconForStat(stat.title);
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
              {revenue.toLocaleString('vi-VN')} ₫
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
    </div>
  );
}
