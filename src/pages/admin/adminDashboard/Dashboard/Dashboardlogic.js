import { useState, useEffect } from "react";
import { getAllBills } from "../../../../services/billService";
import { getAllCustomers } from "../../../../services/customerService";
import { getProductsByPage } from "../../../../services/productService";

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
    const [stats, setStats] = useState([]);
    const [revenueByMonth, setRevenueByMonth] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Fetch song song 3 nguồn dữ liệu chính
                const [billsResponse, customers, productsResponse] = await Promise.all([
                    getAllBills(),
                    getAllCustomers(),
                    getProductsByPage(0, 1) // Chỉ cần lấy totalElements, lấy page 0 size 1 cho nhẹ
                ]);

                // Mảng array của Bill do api get axios mặc định trả data ở res.data
                const billsList = billsResponse?.data || [];
                const totalCustomers = customers?.length || 0;
                const totalProducts = productsResponse?.totalElements || 0;

                // Chỉ tính doanh thu từ đơn hoàn thành/đã giao.
                const completedBills = billsList.filter((bill) => {
                    const rawStatus = bill.status?.name ?? bill.status;
                    return isCompletedBill(rawStatus);
                });

                const totalOrders = billsList.length;
                let totalRevenue = 0;

                // Tính doanh thu theo tháng (năm hiện tại)
                const currentYear = new Date().getFullYear();
                const currentMonth = new Date().getMonth() + 1;
                const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
                const previousMonthYear = currentMonth === 1 ? currentYear - 1 : currentYear;
                const monthlyRevenueMap = {};

                // Khởi tạo 12 tháng = 0
                for (let i = 1; i <= 12; i++) {
                    monthlyRevenueMap[i] = 0;
                }

                completedBills.forEach((bill) => {
                    const billAmount = getBillAmount(bill);
                    totalRevenue += billAmount;

                    // Parse ngày tạo bill (VD: created_at, createDate, date)
                    const dateStr = bill.created_at || bill.createDate || bill.date;
                    if (dateStr) {
                        const date = new Date(dateStr);
                        if (date.getFullYear() === currentYear) {
                            const month = date.getMonth() + 1;
                            monthlyRevenueMap[month] += billAmount;
                        }
                    }
                });

                // Convert map sang mảng cho Chart/List
                const monthlyData = Object.keys(monthlyRevenueMap).map(month => ({
                    month: `Tháng ${month}`,
                    value: monthlyRevenueMap[month]
                })).filter(item => item.value > 0); // Có thể bỏ filter này nếu muốn show cả tháng 0đ

                const currentMonthRevenue = monthlyRevenueMap[currentMonth] || 0;
                let previousMonthRevenue = 0;

                // Nếu đang là tháng 1 thì doanh thu tháng trước là tháng 12 của năm trước.
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

                // Set states
                setRevenue(totalRevenue);
                setRevenueTrend({
                    percent: Number.isFinite(trendPercent) ? trendPercent : 0,
                    currentMonthRevenue,
                    previousMonthRevenue,
                });
                setRevenueByMonth(monthlyData.length > 0 ? monthlyData : [
                    { month: "Chưa có dữ liệu", value: 0 }
                ]);

                setStats([
                    {
                        title: "Tổng doanh thu",
                        value: totalRevenue,
                        trend: "+0%", // Tính toán trend có thể cần data tháng trước, tạm hardcode
                        color: "primary"
                    },
                    {
                        title: "Tổng đơn hàng",
                        value: totalOrders,
                        trend: "+0%",
                        color: "emerald"
                    },
                    {
                        title: "Tổng khách hàng",
                        value: totalCustomers,
                        trend: "+0%",
                        color: "amber"
                    },
                    {
                        title: "Tổng sản phẩm",
                        value: totalProducts,
                        trend: "+0%",
                        color: "red"
                    }
                ]);

            } catch (err) {
                console.error("Dashboard data load error:", err);
                setError(err.message);

                // Fallback nếu có lỗi
                setStats([
                    { title: "Tổng doanh thu", value: 0 },
                    { title: "Tổng đơn hàng", value: 0 },
                    { title: "Tổng khách hàng", value: 0 },
                    { title: "Tổng sản phẩm", value: 0 }
                ]);
                setRevenueTrend({ percent: 0, currentMonthRevenue: 0, previousMonthRevenue: 0 });
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
