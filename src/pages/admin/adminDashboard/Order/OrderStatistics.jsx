import React, { useEffect, useMemo, useState } from "react";
import {
  ShoppingCart,
  Clock3,
  CheckCircle2,
  XCircle,
  CreditCard,
  Users,
  Wallet,
  TrendingUp,
  FileText,
  Download,
  ChevronDown,
  Filter,
  Info,
} from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import TablePagination from "../../../../components/admin/analytics/TablePagination.jsx";

const STATUS_ALL = "ALL";
const PAYMENT_ALL = "ALL";
const PERIOD_ALL = "all";
const PERIOD_30 = "last30";
const PERIOD_90 = "last90";
const PERIOD_MONTH = "month";
const DEFAULT_TOP_CUSTOMER_PAGE_SIZE = 5;
const DEFAULT_PENDING_ORDER_PAGE_SIZE = 8;

function parseDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isPendingStatus(rawStatus = "", status = "") {
  const normalizedRaw = String(rawStatus).trim();
  if (status === "PENDING") return true;
  return (
    normalizedRaw === "Chờ xác nhận"
    || normalizedRaw === "Đơn đang chờ giao"
    || normalizedRaw === "Đang giao"
  );
}

export default function OrderStatistics({ orders }) {
  const now = new Date();
  const [periodFilter, setPeriodFilter] = useState(PERIOD_ALL);
  const [statusFilter, setStatusFilter] = useState(STATUS_ALL);
  const [paymentFilter, setPaymentFilter] = useState(PAYMENT_ALL);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [topCustomerPage, setTopCustomerPage] = useState(1);
  const [pendingOrderPage, setPendingOrderPage] = useState(1);
  const [topCustomerPageSize, setTopCustomerPageSize] = useState(DEFAULT_TOP_CUSTOMER_PAGE_SIZE);
  const [pendingOrderPageSize, setPendingOrderPageSize] = useState(DEFAULT_PENDING_ORDER_PAGE_SIZE);

  const validOrders = useMemo(() => {
    return Array.isArray(orders) ? orders : [];
  }, [orders]);

  const paymentMethods = useMemo(() => {
    const values = new Set(
      validOrders
        .map((item) => String(item?.payment_method || "").trim())
        .filter(Boolean),
    );
    return Array.from(values);
  }, [validOrders]);

  const filteredOrders = useMemo(() => {
    const nowDate = new Date();

    return validOrders.filter((order) => {
      const orderDate = parseDate(order.created_at);

      let passPeriod = true;
      if (periodFilter === PERIOD_30) {
        const minDate = new Date(nowDate);
        minDate.setDate(minDate.getDate() - 30);
        passPeriod = Boolean(orderDate && orderDate >= minDate && orderDate <= nowDate);
      } else if (periodFilter === PERIOD_90) {
        const minDate = new Date(nowDate);
        minDate.setDate(minDate.getDate() - 90);
        passPeriod = Boolean(orderDate && orderDate >= minDate && orderDate <= nowDate);
      } else if (periodFilter === PERIOD_MONTH) {
        passPeriod = Boolean(
          orderDate
          && orderDate.getMonth() === nowDate.getMonth()
          && orderDate.getFullYear() === nowDate.getFullYear(),
        );
      }

      let passStatus = true;
      if (statusFilter !== STATUS_ALL) {
        passStatus = String(order.raw_status || "") === statusFilter;
      }

      let passPayment = true;
      if (paymentFilter !== PAYMENT_ALL) {
        passPayment = String(order.payment_method || "") === paymentFilter;
      }

      return passPeriod && passStatus && passPayment;
    });
  }, [validOrders, periodFilter, statusFilter, paymentFilter]);

  const metrics = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce(
      (sum, item) => sum + Number(item.grand_total || item.total_amount || 0),
      0,
    );
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    const pendingCount = filteredOrders.filter((item) => isPendingStatus(item.raw_status, item.status)).length;
    const completedCount = filteredOrders.filter((item) => String(item.raw_status || "") === "Đã giao").length;
    const cancelledCount = filteredOrders.filter((item) => String(item.raw_status || "") === "Đã hủy").length;
    const completionRate = totalOrders > 0 ? Math.round((completedCount / totalOrders) * 100) : 0;

    const customers = new Set(
      filteredOrders
        .map((item) => String(item.customer_id || item.customer_name || "").trim())
        .filter(Boolean),
    );

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      pendingCount,
      completedCount,
      cancelledCount,
      completionRate,
      totalCustomers: customers.size,
    };
  }, [filteredOrders]);

  const statusDistribution = useMemo(() => {
    const pending = filteredOrders.filter((item) => isPendingStatus(item.raw_status, item.status)).length;
    const completed = filteredOrders.filter((item) => String(item.raw_status || "") === "Đã giao").length;
    const cancelled = filteredOrders.filter((item) => String(item.raw_status || "") === "Đã hủy").length;

    return [
      { name: "Đang xử lý", value: pending, color: "#f59e0b" },
      { name: "Đã giao", value: completed, color: "#10b981" },
      { name: "Đã hủy", value: cancelled, color: "#ef4444" },
    ];
  }, [filteredOrders]);

  const paymentDistribution = useMemo(() => {
    const map = {};

    filteredOrders.forEach((item) => {
      const key = String(item.payment_method || "Không xác định").trim() || "Không xác định";
      map[key] = (map[key] || 0) + 1;
    });

    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredOrders]);

  const monthlyRevenueData = useMemo(() => {
    const months = [];
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    for (let i = 0; i < 6; i += 1) {
      const current = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`;
      months.push({
        key,
        label: current.toLocaleDateString("vi-VN", { month: "2-digit", year: "2-digit" }),
        revenue: 0,
        orders: 0,
      });
    }

    const monthMap = months.reduce((acc, item) => {
      acc[item.key] = item;
      return acc;
    }, {});

    filteredOrders.forEach((item) => {
      const date = parseDate(item.created_at);
      if (!date) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const bucket = monthMap[key];
      if (!bucket) return;
      bucket.orders += 1;
      bucket.revenue += Number(item.grand_total || item.total_amount || 0);
    });

    return months;
  }, [filteredOrders, now]);

  const topCustomers = useMemo(() => {
    const customerMap = {};

    filteredOrders.forEach((item) => {
      const key = String(item.customer_id || item.customer_name || "Khách vãng lai");
      if (!customerMap[key]) {
        customerMap[key] = {
          customerName: item.customer_name || "Khách vãng lai",
          customerPhone: item.customer_phone || "",
          orders: 0,
          totalSpent: 0,
        };
      }

      customerMap[key].orders += 1;
      customerMap[key].totalSpent += Number(item.grand_total || item.total_amount || 0);
    });

    return Object.values(customerMap)
      .sort((a, b) => b.totalSpent - a.totalSpent);
  }, [filteredOrders]);

  const pendingPriorityOrders = useMemo(() => {
    return filteredOrders
      .filter((item) => isPendingStatus(item.raw_status, item.status))
      .sort((a, b) => {
        const dateA = parseDate(a.created_at)?.getTime() || 0;
        const dateB = parseDate(b.created_at)?.getTime() || 0;
        return dateA - dateB;
      });
  }, [filteredOrders]);

  const pagedTopCustomers = useMemo(() => {
    const start = (topCustomerPage - 1) * topCustomerPageSize;
    return topCustomers.slice(start, start + topCustomerPageSize);
  }, [topCustomerPage, topCustomers, topCustomerPageSize]);

  const pagedPendingOrders = useMemo(() => {
    const start = (pendingOrderPage - 1) * pendingOrderPageSize;
    return pendingPriorityOrders.slice(start, start + pendingOrderPageSize);
  }, [pendingOrderPage, pendingPriorityOrders, pendingOrderPageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(topCustomers.length / topCustomerPageSize));
    if (topCustomerPage > totalPages) {
      setTopCustomerPage(totalPages);
    }
  }, [topCustomerPage, topCustomers.length, topCustomerPageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(pendingPriorityOrders.length / pendingOrderPageSize));
    if (pendingOrderPage > totalPages) {
      setPendingOrderPage(totalPages);
    }
  }, [pendingOrderPage, pendingPriorityOrders.length, pendingOrderPageSize]);

  const pieColors = ["#3b82f6", "#0ea5e9", "#14b8a6", "#22c55e", "#f59e0b", "#f97316", "#ef4444"];

  const handleExportExcel = async () => {
    const XLSX = await import("xlsx");

    const summaryRows = [
      ["", "ELECTRONICS EC - BAO CAO THONG KE DON HANG"],
      ["", `Thoi gian xuat: ${now.toLocaleString("vi-VN")}`],
      ["", `Ky loc: ${periodFilter}`],
      ["", ""],
      ["", "1. CHI SO TONG QUAN", "GIA TRI"],
      ["", "Tong don hang", metrics.totalOrders],
      ["", "Tong doanh thu", metrics.totalRevenue],
      ["", "Gia tri trung binh / don", metrics.avgOrderValue],
      ["", "Don dang xu ly", metrics.pendingCount],
      ["", "Don da giao", metrics.completedCount],
      ["", "Don da huy", metrics.cancelledCount],
      ["", "Ty le hoan thanh", `${metrics.completionRate}%`],
      ["", "Khach hang phat sinh", metrics.totalCustomers],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
    summarySheet["!cols"] = [{ wch: 5 }, { wch: 38 }, { wch: 24 }];

    const detailRows = filteredOrders.map((item, idx) => ({
      STT: idx + 1,
      MaDon: item.order_id,
      KhachHang: item.customer_name || "N/A",
      SoDienThoai: item.customer_phone || "",
      NgayTao: item.created_at || "",
      TrangThai: item.raw_status || item.status || "",
      ThanhToan: item.payment_method || "",
      TongTienHang: Number(item.total_amount || 0),
      PhiVanChuyen: Number(item.shipping_fee || 0),
      TongThanhToan: Number(item.grand_total || item.total_amount || 0),
      DiaChi: item.address_detail || "",
    }));

    const detailSheet = XLSX.utils.json_to_sheet(detailRows);
    detailSheet["!cols"] = [
      { wch: 6 },
      { wch: 16 },
      { wch: 24 },
      { wch: 16 },
      { wch: 14 },
      { wch: 20 },
      { wch: 16 },
      { wch: 18 },
      { wch: 16 },
      { wch: 18 },
      { wch: 42 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, summarySheet, "TONG_QUAN");
    XLSX.utils.book_append_sheet(workbook, detailSheet, "CHI_TIET_DON_HANG");
    XLSX.writeFile(
      workbook,
      `ThongKe_DonHang_${String(now.getMonth() + 1).padStart(2, "0")}_${now.getFullYear()}.xlsx`,
    );
  };

  const handleExportPDF = async () => {
    const reportElement = document.getElementById("order-statistics-pdf");
    if (!reportElement) return;

    setIsExportingPDF(true);

    try {
      const dataUrl = await toPng(reportElement, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }

      pdf.save(`ThongKe_DonHang_${String(now.getMonth() + 1).padStart(2, "0")}_${now.getFullYear()}.pdf`);
    } catch (error) {
      console.error("Loi xuat PDF thong ke don hang:", error);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="product-statistics pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2 uppercase">Trung Tâm Thống Kê Đơn Hàng</h2>
          <div className="flex items-center gap-3 text-[13px] text-slate-500 font-medium">
            <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
              <ShoppingCart size={14} /> Phân Tích Đơn Hàng
            </span>
            <span>Cập nhật doanh thu, cơ cấu đơn hàng và phân tích chuyên sâu.</span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsExportMenuOpen((prev) => !prev)}
            disabled={isExportingPDF}
            className={`bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-2 px-4 h-[38px] rounded shadow-sm text-[13px] font-semibold transition-colors border border-slate-900 ${isExportingPDF ? "opacity-70 cursor-wait" : ""}`}
          >
            <FileText size={15} />
            <span className="hidden sm:inline">{isExportingPDF ? "Đang kết xuất..." : "Trích xuất Báo Cáo"}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isExportMenuOpen ? "rotate-180" : "rotate-0"}`} />
          </button>

          {isExportMenuOpen && (
            <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded shadow-lg z-50 overflow-hidden py-1">
              <button
                onClick={() => {
                  setIsExportMenuOpen(false);
                  handleExportPDF();
                }}
                className="w-full text-left px-4 py-[10px] text-[13px] font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <FileText size={15} className="text-slate-500" /> PDF (Giao diện Quản lý)
              </button>
              <div className="h-[1px] bg-slate-100 mx-2"></div>
              <button
                onClick={() => {
                  setIsExportMenuOpen(false);
                  handleExportExcel();
                }}
                className="w-full text-left px-4 py-[10px] text-[13px] font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <Download size={15} className="text-slate-500" /> Excel (Data Thô Xử Lý)
              </button>
            </div>
          )}

          {isExportMenuOpen && (
            <div
              className="fixed inset-0 z-40 bg-transparent"
              onClick={() => setIsExportMenuOpen(false)}
            ></div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value={PERIOD_ALL}>Toan bo du lieu</option>
            <option value={PERIOD_MONTH}>Thang hien tai</option>
            <option value={PERIOD_30}>30 ngay gan nhat</option>
            <option value={PERIOD_90}>90 ngay gan nhat</option>
          </select>
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value={STATUS_ALL}>Tat ca trang thai</option>
            <option value="Chờ xác nhận">Cho xac nhan</option>
            <option value="Đơn đang chờ giao">Don dang cho giao</option>
            <option value="Đang giao">Dang giao</option>
            <option value="Đã giao">Da giao</option>
            <option value="Đã hủy">Da huy</option>
          </select>
        </div>

        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value={PAYMENT_ALL}>Tat ca thanh toan</option>
            {paymentMethods.map((method) => (
              <option key={method} value={method}>{method}</option>
            ))}
          </select>
        </div>
      </div>

      <div id="order-statistics-pdf" className="bg-slate-50/50 p-2 sm:p-4 rounded-xl xl:-mx-4 xl:px-4 relative transition-all duration-300">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard label="Tong Don Hang" value={metrics.totalOrders} icon={<ShoppingCart />} color="slate" />
          <StatCard label="Tong Doanh Thu" value={`${(metrics.totalRevenue / 1000000).toFixed(1)} Tr`} icon={<Wallet />} color="slate" sign="VND" />
          <StatCard label="Gia Tri TB / Don" value={`${(metrics.avgOrderValue / 1000000).toFixed(2)} Tr`} icon={<TrendingUp />} color="slate" sign="VND" />
          <StatCard label="Khach Hang Phat Sinh" value={metrics.totalCustomers} icon={<Users />} color="slate" />

          <StatCard label="Dang Xu Ly" value={metrics.pendingCount} icon={<Clock3 />} color="amber" />
          <StatCard label="Da Giao" value={metrics.completedCount} icon={<CheckCircle2 />} color="green" />
          <StatCard label="Da Huy" value={metrics.cancelledCount} icon={<XCircle />} color="red" />
          <StatCard label="Ty Le Hoan Thanh" value={metrics.completionRate} icon={<TrendingUp />} color="blue" sign="%" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="saas-card p-5 lg:col-span-1 border-t-4 border-t-slate-800">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-[14px] font-bold text-slate-800">Co Cau Trang Thai Don</h3>
            </div>
            <div className="h-[220px]">
              {statusDistribution.some((item) => item.value > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusDistribution} innerRadius={50} outerRadius={78} dataKey="value" paddingAngle={4} stroke="none">
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`status-${entry.name}-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Don"]} />
                    <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 12, color: "#475569" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </div>
          </div>

          <div className="saas-card p-5 lg:col-span-2">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-[14px] font-bold text-slate-800">Xu Huong Doanh Thu 6 Thang Gan Nhat</h3>
            </div>
            <div className="h-[220px]">
              {monthlyRevenueData.some((item) => item.revenue > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyRevenueData} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="label" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(value, name) => {
                        if (name === "revenue") return [`${Number(value).toLocaleString("vi-VN")} VND`, "Doanh thu"];
                        return [value, "So don"];
                      }}
                    />
                    <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="saas-card p-5">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-[14px] font-bold text-slate-800">Phan Bo Phuong Thuc Thanh Toan</h3>
            </div>
            <div className="h-[240px]">
              {paymentDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentDistribution} layout="vertical" margin={{ top: 0, right: 15, left: 30, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fill: "#475569", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(value) => [`${value} don`, "So luong"]} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={22}>
                      {paymentDistribution.map((entry, index) => (
                        <Cell key={`payment-${entry.name}-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </div>
          </div>

          <div className="saas-card p-5 overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-[14px] font-bold text-slate-800">Top Khach Hang Theo Chi Tieu</h3>
            </div>
            {topCustomers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3 text-left">Khach hang</th>
                      <th className="py-3 px-3 text-right">So don</th>
                      <th className="py-3 px-3 text-right">Tong chi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedTopCustomers.map((item, index) => (
                      <tr key={`${item.customerName}-${index}`} className="hover:bg-slate-50">
                        <td className="py-3 px-3">
                          <p className="font-medium text-slate-700">{item.customerName}</p>
                          <p className="text-[11px] text-slate-400">{item.customerPhone || "Khong co SDT"}</p>
                        </td>
                        <td className="py-3 px-3 text-right font-semibold text-slate-700">{item.orders}</td>
                        <td className="py-3 px-3 text-right font-bold text-slate-800">{item.totalSpent.toLocaleString("vi-VN")} VND</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <NoData />}
            {topCustomers.length > 0 && (
              <TablePagination
                page={topCustomerPage}
                totalItems={topCustomers.length}
                pageSize={topCustomerPageSize}
                onPageChange={setTopCustomerPage}
                onPageSizeChange={(nextSize) => {
                  setTopCustomerPage(1);
                  setTopCustomerPageSize(nextSize);
                }}
              />
            )}
          </div>
        </div>

        <div className="saas-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white">
            <h3 className="text-[14px] font-bold text-slate-800 flex items-center gap-2">
              <Clock3 size={16} className="text-amber-500" /> Danh Sach Don Dang Xu Ly Uu Tien
            </h3>
          </div>

          <div className="p-0 bg-white overflow-x-auto">
            {pendingPriorityOrders.length > 0 ? (
              <div>
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-5">Ma don</th>
                      <th className="py-3 px-5">Khach hang</th>
                      <th className="py-3 px-5">Trang thai</th>
                      <th className="py-3 px-5">Ngay tao</th>
                      <th className="py-3 px-5 text-right">Tong tien</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedPendingOrders.map((item) => (
                      <tr key={item.order_id} className="hover:bg-slate-50">
                        <td className="py-3 px-5 font-mono text-slate-600">{item.order_id}</td>
                        <td className="py-3 px-5 font-medium text-slate-700">{item.customer_name || "Khach vang lai"}</td>
                        <td className="py-3 px-5 text-slate-600">{item.raw_status || item.status || "N/A"}</td>
                        <td className="py-3 px-5 text-slate-500">{item.created_at || "N/A"}</td>
                        <td className="py-3 px-5 text-right font-bold text-slate-800">{Number(item.grand_total || item.total_amount || 0).toLocaleString("vi-VN")} VND</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-5 pb-4">
                  <TablePagination
                    page={pendingOrderPage}
                    totalItems={pendingPriorityOrders.length}
                    pageSize={pendingOrderPageSize}
                    onPageChange={setPendingOrderPage}
                    onPageSizeChange={(nextSize) => {
                      setPendingOrderPage(1);
                      setPendingOrderPageSize(nextSize);
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-slate-400">
                <ShoppingCart size={32} className="mb-2 opacity-30" />
                <p className="text-[13px] font-medium">Khong co don dang xu ly trong bo loc hien tai.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, tooltip, sign }) {
  const statStyles = {
    slate: "text-slate-600 bg-slate-100",
    red: "text-red-600 bg-red-100 border border-red-200",
    amber: "text-amber-600 bg-amber-100 border border-amber-200",
    green: "text-emerald-600 bg-emerald-100 border border-emerald-200",
    blue: "text-blue-600 bg-blue-100 border border-blue-200",
  };

  const styleClass = statStyles[color] || statStyles.slate;

  return (
    <div className="saas-card p-4 relative group hover:border-slate-300">
      <div className="flex justify-between items-start mb-3">
        <p className="text-[12px] text-slate-500 font-bold uppercase tracking-wider pr-6">{label}</p>
        <div className={`w-7 h-7 rounded flex items-center justify-center -mt-1 ${styleClass}`}>
          {React.cloneElement(icon, { size: 14 })}
        </div>
        {tooltip && (
          <div className="absolute top-3 right-10 text-slate-300 hover:text-slate-600 cursor-help" title={tooltip}>
            <Info size={14} />
          </div>
        )}
      </div>
      <div>
        <h4 className="text-2xl font-black text-slate-800 tracking-tight">
          {value}
          {sign && <span className="text-[13px] text-slate-400 font-bold ml-1">{sign}</span>}
        </h4>
      </div>
    </div>
  );
}

function NoData() {
  return (
    <div className="h-full flex items-center justify-center text-[13px] font-medium text-slate-400 bg-slate-50 rounded border border-dashed border-slate-200">
      Chua du du lieu hien thi
    </div>
  );
}