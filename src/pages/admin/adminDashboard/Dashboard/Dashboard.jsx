import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  Activity,
  BarChart3,
  PieChart as PieChartIcon,
  Flame,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import AnalyticsCard from "../../../../components/admin/analytics/AnalyticsCard.jsx";
import KpiCard from "../../../../components/admin/analytics/KpiCard.jsx";
import DateRangeToolbar from "../../../../components/admin/analytics/DateRangeToolbar.jsx";
import HeatmapGrid from "../../../../components/admin/analytics/HeatmapGrid.jsx";
import TopCustomersTable from "../../../../components/admin/analytics/TopCustomersTable.jsx";
import { useDashboardLogic } from "./Dashboardlogic.js";
import "./Dashboard.css";

const PIE_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

function formatVnd(value) {
  return `${Math.max(0, Number(value || 0)).toLocaleString("vi-VN")} ₫`;
}

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isInRange(date, from, to) {
  if (!date) return false;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function safePct(current, prev) {
  if (!Number.isFinite(prev) || prev <= 0) return 0;
  return ((current - prev) / prev) * 100;
}

function labelGrowth(current, previous) {
  const pct = safePct(current, previous);
  if (pct === 0) {
    return { label: "0.0% so với kỳ trước", positive: true };
  }
  const abs = Math.abs(pct).toFixed(1);
  return {
    label: `${pct > 0 ? "+" : "-"}${abs}% so với kỳ trước`,
    positive: pct > 0,
  };
}

function metricsFromOrders(orders) {
  const safeOrders = Array.isArray(orders) ? orders : [];
  const completed = safeOrders.filter((o) => o.status === "COMPLETED");
  const cancelled = safeOrders.filter((o) => o.status === "CANCELLED");
  const users = new Set(
    safeOrders.map((o) => String(o.customerId || o.customerName || "Khách vãng lai")).filter(Boolean),
  );

  const revenue = completed.reduce((sum, o) => sum + Number(o.amount || 0), 0);
  const orderCount = safeOrders.length;
  const aov = orderCount > 0 ? revenue / orderCount : 0;
  const cancelRate = orderCount > 0 ? (cancelled.length / orderCount) * 100 : 0;
  const completionRate = orderCount > 0 ? (completed.length / orderCount) * 100 : 0;

  return {
    revenue,
    orderCount,
    userCount: users.size,
    aov,
    cancelRate,
    completionRate,
  };
}

function buildSeries(orders, granularity, valueSelector) {
  const map = {};

  orders.forEach((item) => {
    const d = item.createdAt;
    if (!d) return;

    let key = "";
    let label = "";

    if (granularity === "year") {
      key = String(d.getFullYear());
      label = key;
    } else if (granularity === "month") {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      label = `T${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getFullYear()).slice(2)}`;
    } else {
      key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      label = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    }

    if (!map[key]) {
      map[key] = { key, label, value: 0 };
    }

    map[key].value += Number(valueSelector(item) || 0);
  });

  return Object.values(map).sort((a, b) => String(a.key).localeCompare(String(b.key)));
}

export default function Dashboard() {
  const { loading, error, orders, dateBounds, stats } = useDashboardLogic();
  const [mounted, setMounted] = useState(false);
  const [granularity, setGranularity] = useState("month");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!dateBounds?.min || !dateBounds?.max || dateFrom || dateTo) return;

    const from = new Date(dateBounds.min);
    from.setMonth(from.getMonth() - 2);
    if (from < dateBounds.min) {
      setDateFrom(dateBounds.min.toISOString().slice(0, 10));
    } else {
      setDateFrom(from.toISOString().slice(0, 10));
    }
    setDateTo(dateBounds.max.toISOString().slice(0, 10));
  }, [dateBounds, dateFrom, dateTo]);

  const fromDate = useMemo(() => parseDate(dateFrom), [dateFrom]);
  const toDate = useMemo(() => {
    const d = parseDate(dateTo);
    if (!d) return null;
    d.setHours(23, 59, 59, 999);
    return d;
  }, [dateTo]);

  const filteredOrders = useMemo(() => {
    return (Array.isArray(orders) ? orders : []).filter((order) => isInRange(order.createdAt, fromDate, toDate));
  }, [orders, fromDate, toDate]);

  const previousPeriodOrders = useMemo(() => {
    if (!fromDate || !toDate) return [];
    const spanMs = toDate.getTime() - fromDate.getTime();
    const prevTo = new Date(fromDate.getTime() - 1);
    const prevFrom = new Date(prevTo.getTime() - spanMs);
    return (Array.isArray(orders) ? orders : []).filter((order) => isInRange(order.createdAt, prevFrom, prevTo));
  }, [orders, fromDate, toDate]);

  const currentMetrics = useMemo(() => metricsFromOrders(filteredOrders), [filteredOrders]);
  const previousMetrics = useMemo(() => metricsFromOrders(previousPeriodOrders), [previousPeriodOrders]);

  const productsTotal = Number(stats.find((item) => String(item.title).includes("sản phẩm"))?.value || 0);
  const customersTotal = Number(stats.find((item) => String(item.title).includes("khách hàng"))?.value || 0);

  const revenueSeries = useMemo(() => {
    const completed = filteredOrders.filter((o) => o.status === "COMPLETED");
    return buildSeries(completed, granularity, (item) => item.amount);
  }, [filteredOrders, granularity]);

  const orderSeries = useMemo(() => {
    return buildSeries(filteredOrders, granularity, () => 1);
  }, [filteredOrders, granularity]);

  const statusSeries = useMemo(() => {
    const statusMap = filteredOrders.reduce((acc, item) => {
      const key = item.status || "PENDING";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: "Đang xử lý", value: statusMap.PENDING || 0 },
      { name: "Hoàn thành", value: statusMap.COMPLETED || 0 },
      { name: "Đã hủy", value: statusMap.CANCELLED || 0 },
    ];
  }, [filteredOrders]);

  const firstOrderByCustomer = useMemo(() => {
    const map = {};
    (Array.isArray(orders) ? orders : []).forEach((item) => {
      const key = String(item.customerId || item.customerName || "Khách vãng lai");
      if (!item.createdAt) return;
      if (!map[key] || item.createdAt < map[key]) {
        map[key] = item.createdAt;
      }
    });
    return map;
  }, [orders]);

  const userSegment = useMemo(() => {
    const seen = new Set();
    let newUsers = 0;
    let returningUsers = 0;

    filteredOrders.forEach((item) => {
      const key = String(item.customerId || item.customerName || "Khách vãng lai");
      if (seen.has(key)) return;
      seen.add(key);

      const firstDate = firstOrderByCustomer[key];
      if (firstDate && isInRange(firstDate, fromDate, toDate)) {
        newUsers += 1;
      } else {
        returningUsers += 1;
      }
    });

    return { newUsers, returningUsers };
  }, [filteredOrders, firstOrderByCustomer, fromDate, toDate]);

  const heatmapData = useMemo(() => {
    const grid = [];
    for (let d = 0; d < 7; d += 1) {
      for (let h = 0; h < 24; h += 1) {
        grid.push({ day: d, hour: h, value: 0 });
      }
    }

    const lookup = {};
    grid.forEach((item) => {
      lookup[`${item.day}-${item.hour}`] = item;
    });

    filteredOrders.forEach((item) => {
      if (!item.createdAt) return;
      const key = `${item.createdAt.getDay()}-${item.createdAt.getHours()}`;
      if (lookup[key]) lookup[key].value += 1;
    });

    return grid;
  }, [filteredOrders]);

  const funnelData = useMemo(() => {
    const total = filteredOrders.length;
    const processing = filteredOrders.filter((o) => o.status === "PENDING" || o.status === "COMPLETED").length;
    const completed = filteredOrders.filter((o) => o.status === "COMPLETED").length;
    const cancelled = filteredOrders.filter((o) => o.status === "CANCELLED").length;

    return [
      { stage: "Tổng đơn", value: total },
      { stage: "Đơn hợp lệ", value: processing },
      { stage: "Hoàn thành", value: completed },
      { stage: "Hủy", value: cancelled },
    ];
  }, [filteredOrders]);

  const topCustomers = useMemo(() => {
    const map = {};
    filteredOrders.forEach((item) => {
      const key = String(item.customerId || item.customerName || "Khách vãng lai");
      if (!map[key]) {
        map[key] = {
          customerId: item.customerId || "",
          customerName: item.customerName || "Khách vãng lai",
          orders: 0,
          totalSpent: 0,
          aov: 0,
        };
      }
      map[key].orders += 1;
      map[key].totalSpent += Number(item.amount || 0);
      map[key].aov = map[key].orders > 0 ? map[key].totalSpent / map[key].orders : 0;
    });

    return Object.values(map).sort((a, b) => b.totalSpent - a.totalSpent);
  }, [filteredOrders]);

  const handlePreset = (type) => {
    const maxDate = dateBounds?.max ? new Date(dateBounds.max) : new Date();

    if (type === "all") {
      setDateFrom(dateBounds?.min ? new Date(dateBounds.min).toISOString().slice(0, 10) : "");
      setDateTo(dateBounds?.max ? maxDate.toISOString().slice(0, 10) : "");
      return;
    }

    if (type === "ytd") {
      const ytdFrom = new Date(maxDate.getFullYear(), 0, 1);
      setDateFrom(ytdFrom.toISOString().slice(0, 10));
      setDateTo(maxDate.toISOString().slice(0, 10));
      return;
    }

    const dayMap = { "7d": 7, "30d": 30, "90d": 90 };
    const days = dayMap[type] || 30;
    const from = new Date(maxDate);
    from.setDate(from.getDate() - (days - 1));

    if (dateBounds?.min && from < dateBounds.min) {
      setDateFrom(new Date(dateBounds.min).toISOString().slice(0, 10));
    } else {
      setDateFrom(from.toISOString().slice(0, 10));
    }

    setDateTo(maxDate.toISOString().slice(0, 10));
  };

  return (
    <div className={`fade-in min-h-full space-y-6 ${mounted ? "slide-up" : ""}`}>
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Dashboard Điều Hành Enterprise</h1>
        <p className="text-neutral-600">Phân tích đa chiều theo thời gian, trạng thái đơn và hành vi khách hàng để hỗ trợ quyết định vận hành.</p>
      </div>

      <DateRangeToolbar
        from={dateFrom}
        to={dateTo}
        onChangeFrom={setDateFrom}
        onChangeTo={setDateTo}
        granularity={granularity}
        onChangeGranularity={setGranularity}
        onUsePreset={handlePreset}
      />

      {loading && (
        <div className="rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-700">Đang tải dữ liệu dashboard...</div>
      )}

      {error && (
        <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">Có lỗi khi tải dữ liệu: {error}</div>
      )}

      {!error && (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <KpiCard
              title="Doanh thu"
              value={formatVnd(currentMetrics.revenue)}
              subValue={`AOV: ${formatVnd(currentMetrics.aov)}`}
              icon={<DollarSign size={18} />}
              trend={labelGrowth(currentMetrics.revenue, previousMetrics.revenue)}
              tone="blue"
            />
            <KpiCard
              title="Số đơn hàng"
              value={currentMetrics.orderCount.toLocaleString("vi-VN")}
              subValue={`Tỷ lệ hoàn thành: ${currentMetrics.completionRate.toFixed(1)}%`}
              icon={<ShoppingCart size={18} />}
              trend={labelGrowth(currentMetrics.orderCount, previousMetrics.orderCount)}
              tone="emerald"
            />
            <KpiCard
              title="Người dùng hoạt động"
              value={currentMetrics.userCount.toLocaleString("vi-VN")}
              subValue={`New: ${userSegment.newUsers} | Returning: ${userSegment.returningUsers}`}
              icon={<Users size={18} />}
              trend={labelGrowth(currentMetrics.userCount, previousMetrics.userCount)}
              tone="amber"
            />
            <KpiCard
              title="Tổng người dùng"
              value={customersTotal.toLocaleString("vi-VN")}
              subValue="Từ dữ liệu khách hàng hệ thống"
              icon={<Activity size={18} />}
              tone="violet"
            />
            <KpiCard
              title="Sản phẩm"
              value={productsTotal.toLocaleString("vi-VN")}
              subValue={`Tỷ lệ hủy đơn: ${currentMetrics.cancelRate.toFixed(1)}%`}
              icon={<Package size={18} />}
              tone="rose"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <AnalyticsCard title="Doanh thu theo thời gian" subtitle="Line chart: doanh thu theo period đã chọn" className="xl:col-span-2">
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueSeries} margin={{ top: 6, right: 12, left: 0, bottom: 6 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => Number(v || 0).toLocaleString("vi-VN")} />
                    <Tooltip formatter={(value) => formatVnd(value)} />
                    <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={2.8} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </AnalyticsCard>

            <AnalyticsCard title="Tỷ lệ trạng thái đơn" subtitle="Pie chart: phân bổ xử lý/hoàn thành/hủy" rightSlot={<PieChartIcon size={16} className="text-slate-400" />}>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusSeries} dataKey="value" nameKey="name" innerRadius={56} outerRadius={96}>
                      {statusSeries.map((entry, index) => (
                        <Cell key={`status-${entry.name}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => Number(value).toLocaleString("vi-VN")} />
                    <Legend verticalAlign="bottom" iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </AnalyticsCard>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <AnalyticsCard title="Đơn hàng theo thời gian" subtitle="Bar chart: số đơn theo period" className="xl:col-span-2" rightSlot={<BarChart3 size={16} className="text-slate-400" />}>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orderSeries} margin={{ top: 6, right: 12, left: 0, bottom: 6 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => `${value} đơn`} />
                    <Bar dataKey="value" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </AnalyticsCard>

            <AnalyticsCard title="Funnel chuyển đổi" subtitle="Tổng đơn -> hợp lệ -> hoàn thành" rightSlot={<TrendingUp size={16} className="text-slate-400" />}>
              <div className="space-y-3">
                {funnelData.map((step, index) => {
                  const max = funnelData[0]?.value || 1;
                  const width = Math.max(8, Math.round((step.value / max) * 100));
                  return (
                    <div key={step.stage}>
                      <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                        <span>{index + 1}. {step.stage}</span>
                        <span className="font-semibold">{step.value.toLocaleString("vi-VN")}</span>
                      </div>
                      <div className="h-3 rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${width}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AnalyticsCard>
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <AnalyticsCard title="Heatmap giờ mua hàng" subtitle="Mật độ đơn hàng theo giờ và thứ trong tuần" className="xl:col-span-2" rightSlot={<Flame size={16} className="text-slate-400" />}>
              <HeatmapGrid data={heatmapData} />
            </AnalyticsCard>

            <AnalyticsCard title="Top khách hàng" subtitle="Data table có search/sort/pagination">
              <TopCustomersTable rows={topCustomers} />
            </AnalyticsCard>
          </div>
        </>
      )}
    </div>
  );
}
