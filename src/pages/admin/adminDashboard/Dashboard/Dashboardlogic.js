import { useEffect, useMemo, useState } from "react";
import { getAllBills } from "../../../../services/billService";
import { getAllCustomers } from "../../../../services/customerService";
import { getProductsByPage } from "../../../../services/productService";
import { getCache, setCache } from "../../../../utils/localCache";

const DASHBOARD_CACHE_KEY = "dashboard_data_enterprise_v2";
const DASHBOARD_CACHE_TTL = 5 * 60 * 1000;
const DASHBOARD_CACHE_MIGRATION_FLAG = "dashboard_cache_migrated_v2";

function cleanupLegacyDashboardCache() {
  if (localStorage.getItem(DASHBOARD_CACHE_MIGRATION_FLAG) === "1") return;

  // Remove known legacy dashboard cache keys once to prevent stale serialized Date values.
  localStorage.removeItem("dashboard_data_enterprise_v1");
  localStorage.removeItem("dashboard_data_enterprise");
  localStorage.setItem(DASHBOARD_CACHE_MIGRATION_FLAG, "1");
}

function safeNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, n);
}

function parseAmount(value) {
  if (typeof value === "number") return safeNumber(value);
  if (typeof value === "string") {
    const normalized = value.replace(/[^\d.-]/g, "");
    return safeNumber(Number(normalized));
  }
  return 0;
}

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function normalizeStatus(raw) {
  const text = String(raw || "").trim().toUpperCase();

  if (["ĐÃ GIAO", "DA GIAO", "COMPLETED", "DELIVERED", "SUCCESS", "DONE"].includes(text)) {
    return "COMPLETED";
  }

  if (["ĐÃ HỦY", "DA HUY", "CANCELLED", "CANCELED"].includes(text)) {
    return "CANCELLED";
  }

  if (["CHỜ XÁC NHẬN", "CHO XAC NHAN", "ĐƠN ĐANG CHỜ GIAO", "DON DANG CHO GIAO", "ĐANG GIAO", "DANG GIAO", "PENDING", "SHIPPING"].includes(text)) {
    return "PENDING";
  }

  return "PENDING";
}

function normalizeBill(bill, index) {
  const createdAtRaw = bill?.created_at || bill?.createDate || bill?.date || bill?.createdAt;
  const createdAt = parseDate(createdAtRaw);
  const rawStatus = bill?.status?.name || bill?.status || "";
  const status = normalizeStatus(rawStatus);

  const amount = parseAmount(
    bill?.totalAmount
    ?? bill?.total_amount
    ?? bill?.total
    ?? bill?.amount
    ?? bill?.grand_total
    ?? 0,
  );

  const customerId = bill?.customer?.id || bill?.customerId || "";
  const customerName = bill?.customer?.name || bill?.customerName || "Khách vãng lai";

  return {
    id: bill?.id || bill?.bill_id || `BILL_${index + 1}`,
    amount,
    createdAt,
    createdAtRaw: createdAt ? createdAt.toISOString() : "",
    status,
    rawStatus: String(rawStatus || ""),
    customerId: String(customerId || ""),
    customerName: String(customerName || "Khách vãng lai"),
    paymentMethod: String(bill?.paymentMethod || bill?.payment_method || "Khác"),
  };
}

function hydrateCachedOrders(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => normalizeBill(item, index));
}

function toMonthLabel(monthIndex) {
  return `Tháng ${monthIndex}`;
}

function computeTrend(currentValue, previousValue) {
  if (previousValue <= 0) {
    return {
      percent: 0,
      direction: "flat",
      currentMonthRevenue: currentValue,
      previousMonthRevenue: previousValue,
    };
  }

  const delta = ((currentValue - previousValue) / previousValue) * 100;
  return {
    percent: Math.abs(delta),
    direction: delta > 0 ? "up" : delta < 0 ? "down" : "flat",
    currentMonthRevenue: currentValue,
    previousMonthRevenue: previousValue,
  };
}

export function useDashboardLogic() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [orders, setOrders] = useState([]);
  const [revenue, setRevenue] = useState(0);
  const [revenueTrend, setRevenueTrend] = useState({
    percent: 0,
    currentMonthRevenue: 0,
    previousMonthRevenue: 0,
    direction: "flat",
  });
  const [revenueByMonth, setRevenueByMonth] = useState([]);
  const [stats, setStats] = useState([
    { title: "Tổng doanh thu", value: 0, color: "primary" },
    { title: "Tổng đơn hàng", value: 0, color: "emerald" },
    { title: "Tổng khách hàng", value: 0, color: "amber" },
    { title: "Tổng sản phẩm", value: 0, color: "red" },
  ]);

  useEffect(() => {
    cleanupLegacyDashboardCache();

    const cached = getCache(DASHBOARD_CACHE_KEY, DASHBOARD_CACHE_TTL);
    if (cached) {
      setOrders(hydrateCachedOrders(cached.orders));
      setRevenue(safeNumber(cached.revenue));
      setRevenueTrend(cached.revenueTrend || {
        percent: 0,
        currentMonthRevenue: 0,
        previousMonthRevenue: 0,
        direction: "flat",
      });
      setRevenueByMonth(Array.isArray(cached.revenueByMonth) ? cached.revenueByMonth : []);
      setStats(Array.isArray(cached.stats) ? cached.stats : []);
      setLoading(false);
    }

    const load = async () => {
      try {
        if (!cached) setLoading(true);
        setError(null);

        const [billRes, customers, productRes] = await Promise.all([
          getAllBills(),
          getAllCustomers(),
          getProductsByPage(0, 1, false),
        ]);

        const rawBills = Array.isArray(billRes?.data) ? billRes.data : [];
        const normalizedOrders = rawBills.map(normalizeBill);

        const completedOrders = normalizedOrders.filter((o) => o.status === "COMPLETED");
        const totalRevenue = completedOrders.reduce((sum, o) => sum + safeNumber(o.amount), 0);

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const previousMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;

        const monthRevenueMap = {};
        for (let m = 1; m <= 12; m += 1) monthRevenueMap[m] = 0;

        completedOrders.forEach((o) => {
          if (!o.createdAt) return;
          const y = o.createdAt.getFullYear();
          if (y !== currentYear) return;
          const m = o.createdAt.getMonth() + 1;
          monthRevenueMap[m] += safeNumber(o.amount);
        });

        const currentMonthRevenue = safeNumber(monthRevenueMap[currentMonth]);
        const previousMonthRevenue = completedOrders
          .filter((o) => {
            if (!o.createdAt) return false;
            const y = o.createdAt.getFullYear();
            const m = o.createdAt.getMonth() + 1;
            return y === previousMonthYear && m === previousMonth;
          })
          .reduce((sum, o) => sum + safeNumber(o.amount), 0);

        const nextRevenueByMonth = Object.keys(monthRevenueMap).map((m) => ({
          month: toMonthLabel(Number(m)),
          value: safeNumber(monthRevenueMap[m]),
        }));

        const nextStats = [
          { title: "Tổng doanh thu", value: safeNumber(totalRevenue), color: "primary" },
          { title: "Tổng đơn hàng", value: safeNumber(normalizedOrders.length), color: "emerald" },
          { title: "Tổng khách hàng", value: safeNumber(customers?.length), color: "amber" },
          { title: "Tổng sản phẩm", value: safeNumber(productRes?.totalElements), color: "red" },
        ];

        const nextRevenueTrend = computeTrend(currentMonthRevenue, safeNumber(previousMonthRevenue));

        setOrders(normalizedOrders);
        setRevenue(safeNumber(totalRevenue));
        setRevenueTrend(nextRevenueTrend);
        setRevenueByMonth(nextRevenueByMonth);
        setStats(nextStats);

        setCache(DASHBOARD_CACHE_KEY, {
          orders: normalizedOrders,
          revenue: safeNumber(totalRevenue),
          revenueTrend: nextRevenueTrend,
          revenueByMonth: nextRevenueByMonth,
          stats: nextStats,
        });
      } catch (err) {
        console.error("Dashboard data load error:", err);
        setError(err?.message || "Không tải được dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const derived = useMemo(() => {
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, { PENDING: 0, COMPLETED: 0, CANCELLED: 0 });

    const statusDistribution = [
      { name: "Đang xử lý", value: statusCounts.PENDING },
      { name: "Hoàn thành", value: statusCounts.COMPLETED },
      { name: "Đã hủy", value: statusCounts.CANCELLED },
    ];

    const dateValues = orders
      .map((o) => parseDate(o.createdAt))
      .filter(Boolean)
      .map((d) => d.getTime());

    const minTime = dateValues.length > 0 ? Math.min(...dateValues) : null;
    const maxTime = dateValues.length > 0 ? Math.max(...dateValues) : null;

    return {
      statusDistribution,
      dateBounds: {
        min: minTime ? new Date(minTime) : null,
        max: maxTime ? new Date(maxTime) : null,
      },
    };
  }, [orders]);

  return {
    loading,
    error,
    revenue,
    revenueTrend,
    stats,
    revenueByMonth,
    orders,
    statusDistribution: derived.statusDistribution,
    dateBounds: derived.dateBounds,
  };
}
