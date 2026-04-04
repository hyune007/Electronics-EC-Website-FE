import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  ShoppingCart,
  Clock,
  Search,
  FileText,
  ChevronDown,
  Download,
  Loader2,
} from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { getAllBills } from "../../../../services/billService.js";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import TablePagination from "../../../../components/admin/analytics/TablePagination.jsx";

const DEFAULT_NO_ORDER_PAGE_SIZE = 8;
const DEFAULT_DETAIL_PAGE_SIZE = 10;

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function pickVisitTime(customer, orderAgg) {
  const fromCustomer = customer?.kh_last_login
    || customer?.kh_lastLogin
    || customer?.lastLogin
    || customer?.last_login
    || customer?.loginAt
    || customer?.kh_created_at
    || customer?.createdAt
    || customer?.created_at;

  return fromCustomer || orderAgg?.lastOrderAt || "";
}

function formatDateTime(value) {
  const d = toDate(value);
  if (!d) return "Chưa có dữ liệu";
  return d.toLocaleString("vi-VN");
}

function shortName(name, max = 16) {
  const n = String(name || "").trim();
  if (!n) return "N/A";
  return n.length > max ? `${n.slice(0, max)}...` : n;
}

export default function CustomerStatistics({ customers }) {
  const now = new Date();
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [billLoading, setBillLoading] = useState(false);
  const [billAggByCustomer, setBillAggByCustomer] = useState({});
  const [noOrderPage, setNoOrderPage] = useState(1);
  const [detailPage, setDetailPage] = useState(1);
  const [noOrderPageSize, setNoOrderPageSize] = useState(DEFAULT_NO_ORDER_PAGE_SIZE);
  const [detailPageSize, setDetailPageSize] = useState(DEFAULT_DETAIL_PAGE_SIZE);

  const validCustomers = useMemo(() => (Array.isArray(customers) ? customers : []), [customers]);

  useEffect(() => {
    let mounted = true;

    const loadBills = async () => {
      setBillLoading(true);
      try {
        const response = await getAllBills();
        const bills = response?.data || [];
        const agg = {};

        bills.forEach((bill) => {
          const customerId = String(bill?.customer?.id || "").trim();
          if (!customerId) return;

          const current = agg[customerId] || {
            orderCount: 0,
            lastOrderAt: "",
          };

          current.orderCount += 1;

          const billDate = String(bill?.date || "");
          if (!current.lastOrderAt || billDate > current.lastOrderAt) {
            current.lastOrderAt = billDate;
          }

          agg[customerId] = current;
        });

        if (mounted) {
          setBillAggByCustomer(agg);
        }
      } catch (error) {
        console.error("Không tải được dữ liệu đơn hàng cho thống kê khách hàng:", error);
        if (mounted) {
          setBillAggByCustomer({});
        }
      } finally {
        if (mounted) {
          setBillLoading(false);
        }
      }
    };

    loadBills();

    return () => {
      mounted = false;
    };
  }, []);

  const enrichedCustomers = useMemo(() => {
    return validCustomers.map((item) => {
      const id = String(item.kh_id || "");
      const agg = billAggByCustomer[id] || { orderCount: 0, lastOrderAt: "" };
      const visitTime = pickVisitTime(item, agg);

      return {
        ...item,
        orderCount: agg.orderCount,
        visitTime,
      };
    });
  }, [validCustomers, billAggByCustomer]);

  const filteredCustomers = useMemo(() => {
    const q = keyword.toLowerCase().trim();
    if (!q) return enrichedCustomers;

    return enrichedCustomers.filter((item) => (
      String(item.kh_id || "").toLowerCase().includes(q)
      || String(item.kh_name || "").toLowerCase().includes(q)
      || String(item.kh_phone || "").toLowerCase().includes(q)
      || String(item.kh_mail || "").toLowerCase().includes(q)
    ));
  }, [enrichedCustomers, keyword]);

  const stats = useMemo(() => {
    const totalCustomers = filteredCustomers.length;
    const totalOrders = filteredCustomers.reduce((sum, item) => sum + Number(item.orderCount || 0), 0);

    let latestVisit = "";
    filteredCustomers.forEach((item) => {
      if (!item.visitTime) return;
      if (!latestVisit || String(item.visitTime) > latestVisit) {
        latestVisit = String(item.visitTime);
      }
    });

    return {
      totalCustomers,
      totalOrders,
      latestVisit,
    };
  }, [filteredCustomers]);

  const topCustomersByOrders = useMemo(() => {
    return [...filteredCustomers]
      .sort((a, b) => Number(b.orderCount || 0) - Number(a.orderCount || 0))
      .slice(0, 8);
  }, [filteredCustomers]);

  const topCustomersChartData = useMemo(() => {
    return topCustomersByOrders.map((item) => ({
      name: shortName(item.kh_name || item.kh_id),
      orders: Number(item.orderCount || 0),
    }));
  }, [topCustomersByOrders]);

  const recentVisits = useMemo(() => {
    return [...filteredCustomers]
      .filter((item) => item.visitTime)
      .sort((a, b) => {
        const aTime = toDate(a.visitTime)?.getTime() || 0;
        const bTime = toDate(b.visitTime)?.getTime() || 0;
        return bTime - aTime;
      })
      .slice(0, 8);
  }, [filteredCustomers]);

  const recentVisitChartData = useMemo(() => {
    return recentVisits.map((item) => {
      const visit = toDate(item.visitTime);
      const diffHours = visit ? Math.max(0, Math.round((now.getTime() - visit.getTime()) / (1000 * 60 * 60))) : 0;
      return {
        name: shortName(item.kh_name || item.kh_id),
        hoursAgo: diffHours,
      };
    });
  }, [recentVisits, now]);

  const orderBandRows = useMemo(() => {
    const bands = {
      "Chưa mua (0 đơn)": 0,
      "Ít mua (1-2 đơn)": 0,
      "Mua đều (3-5 đơn)": 0,
      "Mua nhiều (>=6 đơn)": 0,
    };

    filteredCustomers.forEach((item) => {
      const count = Number(item.orderCount || 0);
      if (count <= 0) bands["Chưa mua (0 đơn)"] += 1;
      else if (count <= 2) bands["Ít mua (1-2 đơn)"] += 1;
      else if (count <= 5) bands["Mua đều (3-5 đơn)"] += 1;
      else bands["Mua nhiều (>=6 đơn)"] += 1;
    });

    return Object.entries(bands).map(([label, customerCount]) => ({
      label,
      customerCount,
      ratio: stats.totalCustomers > 0 ? `${Math.round((customerCount / stats.totalCustomers) * 100)}%` : "0%",
    }));
  }, [filteredCustomers, stats.totalCustomers]);

  const orderBandChartData = useMemo(() => {
    return orderBandRows.map((row) => ({
      name: row.label,
      value: row.customerCount,
    }));
  }, [orderBandRows]);

  const customersWithoutOrders = useMemo(() => {
    return filteredCustomers
      .filter((item) => Number(item.orderCount || 0) === 0)
      .sort((a, b) => String(a.kh_id || "").localeCompare(String(b.kh_id || "")));
  }, [filteredCustomers]);

  const detailRows = useMemo(() => {
    return [...filteredCustomers]
      .sort((a, b) => Number(b.orderCount || 0) - Number(a.orderCount || 0))
      ;
  }, [filteredCustomers]);

  const pagedNoOrderRows = useMemo(() => {
    const start = (noOrderPage - 1) * noOrderPageSize;
    return customersWithoutOrders.slice(start, start + noOrderPageSize);
  }, [customersWithoutOrders, noOrderPage, noOrderPageSize]);

  const pagedDetailRows = useMemo(() => {
    const start = (detailPage - 1) * detailPageSize;
    return detailRows.slice(start, start + detailPageSize);
  }, [detailPage, detailRows, detailPageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(customersWithoutOrders.length / noOrderPageSize));
    if (noOrderPage > totalPages) {
      setNoOrderPage(totalPages);
    }
  }, [customersWithoutOrders.length, noOrderPage, noOrderPageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(detailRows.length / detailPageSize));
    if (detailPage > totalPages) {
      setDetailPage(totalPages);
    }
  }, [detailPage, detailRows.length, detailPageSize]);

  const handleExportExcel = async () => {
    const XLSX = await import("xlsx");

    const summaryRows = [
      ["", "BAO CAO THONG KE KHACH HANG"],
      ["", `Thoi gian xuat: ${now.toLocaleString("vi-VN")}`],
      ["", ""],
      ["", "Tong khach hang", stats.totalCustomers],
      ["", "Tong so don da mua", stats.totalOrders],
      ["", "Thoi gian vao web gan nhat", formatDateTime(stats.latestVisit)],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryRows);
    summarySheet["!cols"] = [{ wch: 5 }, { wch: 32 }, { wch: 28 }];

    const detailRows = filteredCustomers.map((item, index) => ({
      STT: index + 1,
      MaKH: item.kh_id,
      HoTen: item.kh_name || "",
      SoDienThoai: item.kh_phone || "",
      Email: item.kh_mail || "",
      SoDonDaMua: Number(item.orderCount || 0),
      ThoiGianVaoWeb: formatDateTime(item.visitTime),
    }));

    const detailSheet = XLSX.utils.json_to_sheet(detailRows);
    detailSheet["!cols"] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 26 },
      { wch: 16 },
      { wch: 28 },
      { wch: 14 },
      { wch: 24 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, summarySheet, "TONG_QUAN");
    XLSX.utils.book_append_sheet(workbook, detailSheet, "CHI_TIET_KHACH_HANG");
    XLSX.writeFile(workbook, `ThongKe_KhachHang_${String(now.getMonth() + 1).padStart(2, "0")}_${now.getFullYear()}.xlsx`);
  };

  const handleExportPDF = async () => {
    const reportElement = document.getElementById("customer-statistics-pdf");
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

      pdf.save(`ThongKe_KhachHang_${String(now.getMonth() + 1).padStart(2, "0")}_${now.getFullYear()}.pdf`);
    } catch (error) {
      console.error("Lỗi xuất PDF thống kê khách hàng:", error);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className="product-statistics pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2 uppercase">Trung Tâm Thống Kê Khách Hàng</h2>
          <div className="flex items-center gap-3 text-[13px] text-slate-500 font-medium">
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-100"><Users size={14}/> Phân Tích Hành Vi</span>
            <span>Cập nhật hành vi mua sắm, tần suất truy cập và giá trị khách hàng.</span>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsExportMenuOpen((prev) => !prev)}
            disabled={isExportingPDF}
            className={`bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-2 px-4 h-[38px] rounded shadow-sm text-[13px] font-semibold transition-colors border border-slate-900 ${isExportingPDF ? "opacity-70 cursor-wait" : ""}`}
          >
            <FileText size={15} />
            <span className="hidden sm:inline">{isExportingPDF ? "Đang kết xuất..." : "Xuất báo cáo"}</span>
            <ChevronDown size={14} className={`transition-transform duration-200 ${isExportMenuOpen ? "rotate-180" : "rotate-0"}`} />
          </button>

          {isExportMenuOpen && (
            <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded shadow-lg z-50 overflow-hidden py-1">
              <button
                onClick={() => {
                  setIsExportMenuOpen(false);
                  handleExportPDF();
                }}
                className="w-full text-left px-4 py-[10px] text-[13px] font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <FileText size={15} className="text-slate-500" /> PDF
              </button>
              <div className="h-[1px] bg-slate-100 mx-2"></div>
              <button
                onClick={() => {
                  setIsExportMenuOpen(false);
                  handleExportExcel();
                }}
                className="w-full text-left px-4 py-[10px] text-[13px] font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <Download size={15} className="text-slate-500" /> Excel
              </button>
            </div>
          )}

          {isExportMenuOpen && (
            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsExportMenuOpen(false)}></div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-6">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo mã, tên, SĐT, email"
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      <div id="customer-statistics-pdf" className="bg-slate-50/50 p-2 sm:p-4 rounded-xl xl:-mx-4 xl:px-4 relative transition-all duration-300">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard label="Tổng Khách Hàng" value={stats.totalCustomers} icon={<Users />} color="slate" />
          <StatCard label="Số Lượng Đơn Đã Mua" value={stats.totalOrders} icon={<ShoppingCart />} color="blue" />
          <StatCard
            label="Thời Gian Vào Web Gần Nhất"
            value={formatDateTime(stats.latestVisit)}
            icon={<Clock />}
            color="emerald"
            compact
          />
        </div>

        {billLoading && (
          <div className="mb-4 text-sm text-slate-500 flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Đang đồng bộ dữ liệu đơn hàng...
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="saas-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-white">
              <h3 className="text-[14px] font-bold text-slate-800">Biểu đồ top khách hàng theo số đơn</h3>
            </div>
            <div className="p-4 bg-white">
              {topCustomersChartData.length > 0 ? (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={topCustomersChartData} margin={{ top: 8, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} angle={-15} textAnchor="end" />
                      <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip formatter={(value) => [`${value} đơn`, "Số đơn"]} />
                      <Bar dataKey="orders" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <NoData />}
            </div>
          </div>

          <div className="saas-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-white">
              <h3 className="text-[14px] font-bold text-slate-800">Biểu đồ thời gian vào web gần đây</h3>
            </div>
            <div className="p-4 bg-white">
              {recentVisitChartData.length > 0 ? (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={recentVisitChartData} margin={{ top: 8, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fill: "#475569", fontSize: 11 }} axisLine={false} tickLine={false} angle={-15} textAnchor="end" />
                      <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip formatter={(value) => [`${value} giờ`, "Cách hiện tại"]} />
                      <Bar dataKey="hoursAgo" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : <NoData />}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="saas-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-white">
              <h3 className="text-[14px] font-bold text-slate-800">Biểu đồ phân tầng khách hàng theo số đơn</h3>
            </div>
            <div className="p-4 bg-white">
              {orderBandChartData.length > 0 ? (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={orderBandChartData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                        {orderBandChartData.map((item, index) => (
                          <Cell key={`order-band-${item.name}`} fill={["#94a3b8", "#60a5fa", "#34d399", "#f59e0b"][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value} khách`, "Số lượng"]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : <NoData />}
            </div>
          </div>

          <div className="saas-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-white">
              <h3 className="text-[14px] font-bold text-slate-800">Khách hàng chưa phát sinh đơn</h3>
            </div>
            <div className="p-0 bg-white overflow-x-auto">
              {customersWithoutOrders.length > 0 ? (
                <table className="w-full text-left text-[13px] border border-slate-200">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 border-b border-slate-200">Mã KH</th>
                      <th className="py-3 px-4 border-b border-slate-200">Họ tên</th>
                      <th className="py-3 px-4 text-right border-b border-slate-200">Vào web gần nhất</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedNoOrderRows.map((item) => (
                      <tr key={`no-order-${item.kh_id}`} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-slate-600">{item.kh_id}</td>
                        <td className="py-3 px-4 font-medium text-slate-700">{item.kh_name || "Chưa cập nhật"}</td>
                        <td className="py-3 px-4 text-right text-slate-700">{formatDateTime(item.visitTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : <NoData />}
            </div>
            {customersWithoutOrders.length > 0 && (
              <div className="px-5 pb-4">
                <TablePagination
                  page={noOrderPage}
                  totalItems={customersWithoutOrders.length}
                  pageSize={noOrderPageSize}
                  onPageChange={setNoOrderPage}
                  onPageSizeChange={(nextSize) => {
                    setNoOrderPage(1);
                    setNoOrderPageSize(nextSize);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="saas-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-white">
            <h3 className="text-[14px] font-bold text-slate-800">Bảng chi tiết khách hàng (theo bộ lọc)</h3>
          </div>
          <div className="p-0 bg-white overflow-x-auto">
            {detailRows.length > 0 ? (
              <table className="w-full text-left text-[13px] border border-slate-200">
                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 border-b border-slate-200">Mã KH</th>
                    <th className="py-3 px-4 border-b border-slate-200">Họ tên</th>
                    <th className="py-3 px-4 border-b border-slate-200">SĐT</th>
                    <th className="py-3 px-4 border-b border-slate-200">Email</th>
                    <th className="py-3 px-4 text-right border-b border-slate-200">Số đơn đã mua</th>
                    <th className="py-3 px-4 text-right border-b border-slate-200">Vào web gần nhất</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pagedDetailRows.map((item) => (
                    <tr key={`detail-${item.kh_id}`} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-mono text-slate-600">{item.kh_id}</td>
                      <td className="py-3 px-4 font-medium text-slate-700">{item.kh_name || "Chưa cập nhật"}</td>
                      <td className="py-3 px-4 text-slate-700">{item.kh_phone || "-"}</td>
                      <td className="py-3 px-4 text-slate-700">{item.kh_mail || "-"}</td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-800">{item.orderCount}</td>
                      <td className="py-3 px-4 text-right text-slate-700">{formatDateTime(item.visitTime)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <NoData />}
          </div>
          {detailRows.length > 0 && (
            <div className="px-5 pb-4">
              <TablePagination
                page={detailPage}
                totalItems={detailRows.length}
                pageSize={detailPageSize}
                onPageChange={setDetailPage}
                onPageSizeChange={(nextSize) => {
                  setDetailPage(1);
                  setDetailPageSize(nextSize);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, compact = false }) {
  const statStyles = {
    slate: "text-slate-600 bg-slate-100",
    emerald: "text-emerald-600 bg-emerald-100 border border-emerald-200",
    blue: "text-blue-600 bg-blue-100 border border-blue-200",
  };

  const styleClass = statStyles[color] || statStyles.slate;

  return (
    <div className="saas-card p-4 hover:border-slate-300">
      <div className="flex justify-between items-start mb-3 gap-2">
        <p className="text-[12px] text-slate-500 font-bold uppercase tracking-wider">{label}</p>
        <div className={`w-7 h-7 rounded flex items-center justify-center -mt-1 shrink-0 ${styleClass}`}>
          {React.cloneElement(icon, { size: 14 })}
        </div>
      </div>
      <h4 className={`font-black text-slate-800 tracking-tight ${compact ? "text-base" : "text-2xl"}`}>{value}</h4>
    </div>
  );
}

function NoData() {
  return (
    <div className="h-full min-h-[140px] flex items-center justify-center text-[13px] font-medium text-slate-400 bg-slate-50 rounded border border-dashed border-slate-200">
      Chưa có dữ liệu
    </div>
  );
}
