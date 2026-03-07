import { useState, useEffect } from "react";
import { getAllBills } from "../../../../services/billService";
import { getAllCustomers } from "../../../../services/customerService";
import { getProductsByPage } from "../../../../services/productService";

export function useDashboardLogic() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Dữ liệu dùng cho Dashboard
    const [revenue, setRevenue] = useState(0);
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

                // Filter bills đã thanh toán/hoàn thành để tính doanh thu
                // Tuỳ BE của bạn trạng thái nào là hoàn thành (Ví dụ: 3 - Đã giao, hoặc 'COMPLETED')
                // Ở đây mình tạm cộng tất cả những đơn không bị Hủy (giả sử Hủy là 4)
                const validBills = billsList.filter(b => b.status !== 4 && b.status !== 'CANCELLED');

                const totalOrders = billsList.length;
                let totalRevenue = 0;

                // Tính doanh thu theo tháng (năm hiện tại)
                const currentYear = new Date().getFullYear();
                const monthlyRevenueMap = {};

                // Khởi tạo 12 tháng = 0
                for (let i = 1; i <= 12; i++) {
                    monthlyRevenueMap[i] = 0;
                }

                validBills.forEach(bill => {
                    totalRevenue += (bill.total_amount || bill.total || 0);

                    // Parse ngày tạo bill (VD: created_at, createDate, date)
                    const dateStr = bill.created_at || bill.createDate || bill.date;
                    if (dateStr) {
                        const date = new Date(dateStr);
                        if (date.getFullYear() === currentYear) {
                            const month = date.getMonth() + 1;
                            monthlyRevenueMap[month] += (bill.total_amount || bill.total || 0);
                        }
                    }
                });

                // Convert map sang mảng cho Chart/List
                const monthlyData = Object.keys(monthlyRevenueMap).map(month => ({
                    month: `Tháng ${month}`,
                    value: monthlyRevenueMap[month]
                })).filter(item => item.value > 0); // Có thể bỏ filter này nếu muốn show cả tháng 0đ

                // Set states
                setRevenue(totalRevenue);
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
        stats,
        revenueByMonth
    };
}
