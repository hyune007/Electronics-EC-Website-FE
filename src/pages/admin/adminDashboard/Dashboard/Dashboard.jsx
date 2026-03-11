import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, Package, Users, ArrowUp, PieChart as PieIcon, BarChart3 } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "./Dashboard.css";
import { useDashboardLogic } from "./Dashboardlogic.js";

export default function Dashboard() {
  const { loading, error, revenue, revenueTrend, stats, revenueByMonth } = useDashboardLogic();
  const [mounted, setMounted] = useState(false);

  // Animation cho số liệu chạy lên (revenue count-up)
  const [displayRevenue, setDisplayRevenue] = useState(0);

  useEffect(() => {
    setMounted(true);
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
  }, [loading, revenue]);

  const getIconForStat = (title) => {
    if (title.includes("đơn hàng")) return Package;
    if (title.includes("khách hàng")) return Users;
    if (title.includes("sản phẩm")) return Package;
    return TrendingUp;
  };

  const statThemes = [
    {
      wrapper: "dashboard-kpi-indigo",
      iconBox: "dashboard-kpi-icon-indigo",
      iconColor: "text-indigo-700",
      label: "Doanh thu toàn kỳ"
    },
    {
      wrapper: "dashboard-kpi-emerald",
      iconBox: "dashboard-kpi-icon-emerald",
      iconColor: "text-emerald-700",
      label: "Đơn hàng hệ thống"
    },
    {
      wrapper: "dashboard-kpi-amber",
      iconBox: "dashboard-kpi-icon-amber",
      iconColor: "text-amber-700",
      label: "Khách hàng tích lũy"
    },
    {
      wrapper: "dashboard-kpi-rose",
      iconBox: "dashboard-kpi-icon-rose",
      iconColor: "text-rose-700",
      label: "Sản phẩm đang bán"
    },
  ];

  const now = new Date();
  const monthLabel = `Tháng ${now.getMonth() + 1}/${now.getFullYear()}`;
  const realMonths = revenueByMonth;
  const validMonths = realMonths.filter((m) => Number(m.value || 0) > 0);
  const topMonth = validMonths.length > 0
    ? validMonths.reduce((max, item) => (item.value > max.value ? item : max), validMonths[0])
    : null;

  const orders = Number(stats.find((s) => s.title.toLowerCase().includes("đơn hàng"))?.value || 0);
  const customers = Number(stats.find((s) => s.title.toLowerCase().includes("khách hàng"))?.value || 0);
  const products = Number(stats.find((s) => s.title.toLowerCase().includes("sản phẩm"))?.value || 0);
  const revenuePerOrder = orders > 0 ? revenue / orders : 0;
  const ordersPerCustomer = customers > 0 ? orders / customers : 0;

  const monthlyChartData = realMonths.map((item) => ({
    ...item,
    shortMonth: item.month.replace("Tháng ", "T"),
    revenueM: Number((item.value / 1000000).toFixed(1)),
  }));

  const topMonthChartData = [...validMonths]
    .sort((a, b) => b.value - a.value)
    .slice(0, 6)
    .map((item) => ({
      ...item,
      shortMonth: item.month.replace("Tháng ", "T"),
      revenueM: Number((item.value / 1000000).toFixed(1)),
    }));

  const compositionData = [
    { name: "Đơn hàng", value: orders },
    { name: "Khách hàng", value: customers },
    { name: "Sản phẩm", value: products },
  ].filter((item) => item.value > 0);

  const pieColors = ["#2563eb", "#0d9488", "#f59e0b", "#ef4444"];

  return (
    <div className={`fade-in min-h-full ${mounted ? 'slide-up' : ''}`}>
      {/* Header */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Dashboard Điều Hành</h1>
          <p className="text-neutral-600">Tổng hợp dữ liệu kinh doanh từ đơn hàng đã hoàn tất</p>
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
          {/* Hero */}
          <div className="dashboard-hero mb-8 table-row" style={{ animationDelay: "120ms" }}>
            <div>
              <p className="dashboard-hero-kicker">Tổng doanh thu</p>
              <h2 className="dashboard-hero-title">{displayRevenue.toLocaleString("vi-VN")} ₫</h2>
              <p className="dashboard-hero-sub">Tổng doanh thu tích lũy toàn hệ thống</p>
              <div className="dashboard-hero-badges">
                <span className="dashboard-badge dashboard-badge-soft">{monthLabel}</span>
                <span className={`dashboard-badge ${revenueTrend.percent >= 0 ? "dashboard-badge-strong" : "dashboard-badge-danger"}`}>
                  {revenueTrend.previousMonthRevenue > 0
                    ? `${revenueTrend.percent >= 0 ? "+" : ""}${revenueTrend.percent.toFixed(1)}% so với tháng trước`
                    : "Chưa có dữ liệu tháng trước"}
                </span>
              </div>
            </div>
            <div className="dashboard-hero-side">
              <div className="dashboard-hero-side-item">
                <span>Tháng doanh thu đỉnh</span>
                <strong>{topMonth ? topMonth.month : "Chưa có"}</strong>
              </div>
              <div className="dashboard-hero-side-item">
                <span>Doanh thu cao nhất</span>
                <strong>{topMonth ? `${topMonth.value.toLocaleString("vi-VN")} ₫` : "0 ₫"}</strong>
              </div>
              <div className="dashboard-hero-side-item">
                <span>Đơn hàng / Khách hàng</span>
                <strong>{ordersPerCustomer.toFixed(2)}</strong>
              </div>
              <div className="dashboard-hero-side-item">
                <span>Doanh thu trung bình / đơn</span>
                <strong>{revenuePerOrder.toLocaleString("vi-VN")} ₫</strong>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => {
              const Icon = getIconForStat(stat.title.toLowerCase());
              const theme = statThemes[index % statThemes.length];
              return (
                <div key={index} className={`card p-6 table-row dashboard-kpi ${theme.wrapper}`} style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-neutral-600 text-sm font-medium mb-1">{theme.label}</p>
                      <p className="text-2xl font-bold text-neutral-900">
                        {stat.title.toLowerCase().includes("doanh thu")
                          ? `${Number(stat.value || 0).toLocaleString("vi-VN")} ₫`
                          : Number(stat.value || 0).toLocaleString("vi-VN")}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">{stat.title}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${theme.iconBox}`}>
                      <Icon className={theme.iconColor} size={24} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="xl:col-span-2 card p-7 table-row" style={{ animationDelay: "400ms" }}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-neutral-900 mb-1">Doanh thu theo tháng</h3>
                    <p className="text-neutral-600 text-sm">Đơn vị hiển thị: triệu VND</p>
                </div>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                  Dữ liệu thực tế từ API
                </span>
              </div>

              <div className="dashboard-chart-box h-[330px]">
                {monthlyChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyChartData} margin={{ top: 8, right: 10, left: 0, bottom: 6 }}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.38} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0.04} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                      <XAxis dataKey="shortMonth" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} unit="M" />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "1px solid #dbeafe", boxShadow: "0 10px 24px rgba(30,41,59,0.12)" }}
                        formatter={(value) => [`${value} triệu VND`, "Doanh thu"]}
                        labelFormatter={(label) => `Tháng ${label.replace("T", "")}`}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenueM"
                        stroke="#2563eb"
                        strokeWidth={3}
                        fill="url(#revenueGradient)"
                        activeDot={{ r: 5, strokeWidth: 0, fill: "#1d4ed8" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-500 text-sm">
                    Chưa có dữ liệu doanh thu theo tháng.
                  </div>
                )}
              </div>
            </div>

            <div className="card p-6 table-row" style={{ animationDelay: "500ms" }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-neutral-900">Cơ cấu dữ liệu hệ thống</h3>
                <PieIcon className="text-neutral-400" size={20} />
              </div>

              <div className="dashboard-chart-box h-[330px]">
                {compositionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={compositionData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={62}
                        outerRadius={98}
                        paddingAngle={3}
                      >
                        {compositionData.map((entry, index) => (
                          <Cell key={`${entry.name}-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [Number(value).toLocaleString("vi-VN"), "Số lượng"]}
                        contentStyle={{ borderRadius: 12, border: "1px solid #dbeafe" }}
                      />
                      <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-500 text-sm">
                    Chưa có dữ liệu KPI để hiển thị.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            <div className="xl:col-span-2 card p-6 table-row" style={{ animationDelay: "560ms" }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-neutral-900">Top Doanh Thu Tháng</h3>
                <BarChart3 className="text-neutral-400" size={20} />
              </div>
              <div className="dashboard-chart-box h-[280px]">
                {topMonthChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topMonthChartData} margin={{ top: 8, right: 10, left: 0, bottom: 6 }}>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
                      <XAxis dataKey="shortMonth" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} unit="M" />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "1px solid #dbeafe", boxShadow: "0 10px 24px rgba(30,41,59,0.12)" }}
                        formatter={(value) => [`${value} triệu VND`, "Doanh thu"]}
                      />
                      <Bar dataKey="revenueM" radius={[8, 8, 0, 0]}>
                        {topMonthChartData.map((entry, index) => (
                          <Cell key={`${entry.shortMonth}-${index}`} fill={index < 2 ? "#0d9488" : "#60a5fa"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full bg-neutral-50 rounded-xl flex items-center justify-center text-neutral-500 text-sm">
                    Chưa có dữ liệu tháng để xếp hạng.
                  </div>
                )}
              </div>
            </div>

            <div className="card p-6 table-row" style={{ animationDelay: "620ms" }}>
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Tháng nổi bật</h3>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {[...validMonths]
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 4)
                  .map((month, index) => (
                    <div key={`${month.month}-${index}`} className="dashboard-month-item">
                      <div className="dashboard-month-left">
                        <span className="dashboard-month-rank">#{index + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{month.month}</p>
                          <p className="text-xs text-neutral-500">Năm {now.getFullYear()}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-neutral-900">
                        {month.value.toLocaleString("vi-VN")} ₫
                      </p>
                    </div>
                  ))}

                {validMonths.length === 0 && (
                  <div className="text-sm text-neutral-500">Chưa có dữ liệu tháng để tổng hợp.</div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 text-sm text-neutral-600">
            {revenueTrend.previousMonthRevenue > 0 ? (
              <>
                <span className={`font-medium ${revenueTrend.percent >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {revenueTrend.percent >= 0 ? '+' : ''}{revenueTrend.percent.toFixed(1)}%
                </span>
                <span>so với tháng trước</span>
                <ArrowUp
                  className={revenueTrend.percent >= 0 ? 'text-emerald-600' : 'text-red-600 rotate-180'}
                  size={16}
                />
              </>
            ) : (
              <span>Chưa có dữ liệu đủ để so sánh tháng trước.</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
