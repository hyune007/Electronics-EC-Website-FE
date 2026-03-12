import { useState, useEffect } from "react";
import { getAllBills } from "../../../../services/billService";
import { getAllCustomers } from "../../../../services/customerService";
import { getProductsByPage } from "../../../../services/productService";
import { getCache, setCache } from "../../../../utils/localCache";

const DASHBOARD_CACHE_KEY = "dashboard_data_v1";
const DASHBOARD_CACHE_TTL = 5 * 60 * 1000;

function parseAmount(value) {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
        const normalized = value.replace(/[^\d.-]/g, "");
        const parsed = Number(normalized);
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}

function isCompletedBill(statusValue) {
    if (statusValue === 3) return true; // Common backend code for delivered/completed

    const status = String(statusValue || "").trim().toUpperCase();
    return ["ĐÃ GIAO", "DA GIAO", "COMPLETED", "DELIVERED", "SUCCESS"].includes(status);
}

function getBillAmount(bill) {
    return parseAmount(
        bill.totalAmount ?? bill.total_amount ?? bill.total ?? bill.amount ?? 0,
    );
}

export function useDashboardLogic() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Dữ liệu dùng cho Dashboard
    const [revenue, setRevenue] = useState(0);
    const [revenueTrend, setRevenueTrend] = useState({
        percent: 0,
        currentMonthRevenue: 0,
        previousMonthRevenue: 0,
    });
    const [stats, setStats] = useState([
        { title: "Tổng doanh thu", value: 0, color: "primary" },
        { title: "Tổng đơn hàng", value: 0, color: "emerald" },
        { title: "Tổng khách hàng", value: 0, color: "amber" },
        { title: "Tổng sản phẩm", value: 0, trend: "+0%", color: "red" }
    ]);
    const [revenueByMonth, setRevenueByMonth] = useState([]);

    const updateStat = (title, value) => {
        setStats((prev) => prev.map((item) => (
            item.title === title ? { ...item, value } : item
        )));
    };

    useEffect(() => {
        const cached = getCache(DASHBOARD_CACHE_KEY, DASHBOARD_CACHE_TTL);
        if (cached) {
            setRevenue(cached.revenue || 0);
            setRevenueTrend(cached.revenueTrend || {
                percent: 0,
                currentMonthRevenue: 0,
                previousMonthRevenue: 0,
            });
            setStats(cached.stats || []);
            setRevenueByMonth(cached.revenueByMonth || []);
            setLoading(false);
        }

        const fetchDashboardData = async () => {
            try {
                if (!cached) setLoading(true);
                const runtimeSnapshot = {
                    revenue: cached?.revenue || 0,
                    revenueTrend: cached?.revenueTrend || {
                        percent: 0,
                        currentMonthRevenue: 0,
                        previousMonthRevenue: 0,
                    },
                    totalOrders: Number(cached?.stats?.find((s) => s.title === "Tổng đơn hàng")?.value || 0),
                    totalCustomers: Number(cached?.stats?.find((s) => s.title === "Tổng khách hàng")?.value || 0),
                    totalProducts: Number(cached?.stats?.find((s) => s.title === "Tổng sản phẩm")?.value || 0),
                    revenueByMonth: cached?.revenueByMonth || [],
                };

                const billsTask = getAllBills()
                    .then((billsResponse) => {
                        const billsList = billsResponse?.data || [];
                        const completedBills = billsList.filter((bill) => {
                            const rawStatus = bill.status?.name ?? bill.status;
                            return isCompletedBill(rawStatus);
                        });

                        const totalOrders = billsList.length;
                        let totalRevenue = 0;
                        const currentYear = new Date().getFullYear();
                        const currentMonth = new Date().getMonth() + 1;
                        const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
                        const previousMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
                        const monthlyRevenueMap = {};

                        for (let i = 1; i <= 12; i++) {
                            monthlyRevenueMap[i] = 0;
                        }

                        completedBills.forEach((bill) => {
                            const billAmount = getBillAmount(bill);
                            totalRevenue += billAmount;

                            const dateStr = bill.created_at || bill.createDate || bill.date;
                            if (dateStr) {
                                const date = new Date(dateStr);
                                if (date.getFullYear() === currentYear) {
                                    const month = date.getMonth() + 1;
                                    monthlyRevenueMap[month] += billAmount;
                                }
                            }
                        });

                        const monthlyData = Object.keys(monthlyRevenueMap).map((month) => ({
                            month: `Tháng ${month}`,
                            value: monthlyRevenueMap[month]
                        }));

                        const currentMonthRevenue = monthlyRevenueMap[currentMonth] || 0;
                        let previousMonthRevenue = 0;

                        if (previousMonthYear === currentYear) {
                            previousMonthRevenue = monthlyRevenueMap[previousMonth] || 0;
                        } else {
                            previousMonthRevenue = completedBills
                                .filter((bill) => {
                                    const dateStr = bill.created_at || bill.createDate || bill.date;
                                    if (!dateStr) return false;
                                    const d = new Date(dateStr);
                                    return d.getFullYear() === previousMonthYear && d.getMonth() + 1 === previousMonth;
                                })
                                .reduce((sum, bill) => sum + getBillAmount(bill), 0);
                        }

                        const trendPercent = previousMonthRevenue > 0
                            ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
                            : 0;

                        runtimeSnapshot.revenue = totalRevenue;
                        runtimeSnapshot.revenueTrend = {
                            percent: Number.isFinite(trendPercent) ? trendPercent : 0,
                            currentMonthRevenue,
                            previousMonthRevenue,
                        };
                        runtimeSnapshot.totalOrders = totalOrders;
                        runtimeSnapshot.revenueByMonth = monthlyData;

                        setRevenue(totalRevenue);
                        setRevenueTrend(runtimeSnapshot.revenueTrend);
                        setRevenueByMonth(monthlyData);
                        updateStat("Tổng doanh thu", totalRevenue);
                        updateStat("Tổng đơn hàng", totalOrders);
                    })
                    .catch((err) => {
                        console.error("Dashboard bills load error:", err);
                        setError((prev) => prev || err.message);
                    })
                    .finally(() => {
                        setLoading(false);
                    });

                const customersTask = getAllCustomers()
                    .then((customers) => {
                        const totalCustomers = customers?.length || 0;
                        runtimeSnapshot.totalCustomers = totalCustomers;
                        updateStat("Tổng khách hàng", totalCustomers);
                    })
                    .catch((err) => {
                        console.error("Dashboard customers load error:", err);
                        setError((prev) => prev || err.message);
                    })
                    .finally(() => {
                        setLoading(false);
                    });

                const productsTask = getProductsByPage(0, 1)
                    .then((productsResponse) => {
                        const totalProducts = productsResponse?.totalElements || 0;
                        runtimeSnapshot.totalProducts = totalProducts;
                        updateStat("Tổng sản phẩm", totalProducts);
                    })
                    .catch((err) => {
                        console.error("Dashboard products load error:", err);
                        setError((prev) => prev || err.message);
                    })
                    .finally(() => {
                        setLoading(false);
                    });

                await Promise.allSettled([billsTask, customersTask, productsTask]);

                const nextStats = [
                    { title: "Tổng doanh thu", value: runtimeSnapshot.revenue, color: "primary" },
                    { title: "Tổng đơn hàng", value: runtimeSnapshot.totalOrders, color: "emerald" },
                    { title: "Tổng khách hàng", value: runtimeSnapshot.totalCustomers, color: "amber" },
                    { title: "Tổng sản phẩm", value: runtimeSnapshot.totalProducts, trend: "+0%", color: "red" }
                ];

                setStats(nextStats);

                setCache(DASHBOARD_CACHE_KEY, {
                    revenue: runtimeSnapshot.revenue,
                    revenueTrend: runtimeSnapshot.revenueTrend,
                    stats: nextStats,
                    revenueByMonth: runtimeSnapshot.revenueByMonth,
                });

            } catch (err) {
                console.error("Dashboard data load error:", err);
                setError(err.message);

                // Fallback nếu có lỗi
                if (!cached) {
                    setStats([
                    { title: "Tổng doanh thu", value: 0 },
                    { title: "Tổng đơn hàng", value: 0 },
                    { title: "Tổng khách hàng", value: 0 },
                    { title: "Tổng sản phẩm", value: 0 }
                    ]);
                    setRevenueTrend({ percent: 0, currentMonthRevenue: 0, previousMonthRevenue: 0 });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return {
        loading,
        error,
        revenue,
        revenueTrend,
        stats,
        revenueByMonth
    };
}
