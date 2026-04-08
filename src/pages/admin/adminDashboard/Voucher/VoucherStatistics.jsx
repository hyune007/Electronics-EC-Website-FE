import React, { useEffect, useMemo, useState } from "react";
import {
  Gift,
  Percent,
  Clock3,
  CalendarClock,
  Search,
  FileText,
  Download,
  Loader2,
  ChevronDown,
  PieChart as PieChartIcon,
  BarChart3,
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
import { getAllPromotions } from "../../../../services/promotionService";
import { getAllProducts } from "../../../../services/productService";
import TablePagination from "../../../../components/admin/analytics/TablePagination.jsx";

const PIE_COLORS = ["#10b981", "#f59e0b", "#ef4444"];
const DEFAULT_DETAIL_PAGE_SIZE = 10;

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function getVoucherStatus(item, now = new Date()) {
  const start = parseDate(item?.km_start_date);
  const end = parseDate(item?.km_end_date);
  if (!start || !end) return "unknown";
  if (now < start) return "upcoming";
  if (now > end) return "expired";
  return "active";
}

function shortName(value, max = 18) {
  const text = String(value || "").trim();
  if (!text) return "N/A";
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

export default function VoucherStatistics() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [vouchers, setVouchers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [detailPage, setDetailPage] = useState(1);
  const [detailPageSize, setDetailPageSize] = useState(DEFAULT_DETAIL_PAGE_SIZE);

  const now = new Date();

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const [voucherData, productData] = await Promise.all([
          getAllPromotions(),
          getAllProducts(false),
        ]);

        if (mounted) {
          setVouchers(Array.isArray(voucherData) ? voucherData : []);
          setProducts(Array.isArray(productData) ? productData : []);
        }
      } catch (error) {
        console.error("Không tải được dữ liệu thống kê voucher:", error);
        if (mounted) {
          setVouchers([]);
          setProducts([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const voucherUsageMap = useMemo(() => {
    const map = {};
    (Array.isArray(products) ? products : []).forEach((p) => {
      const promoId = String(p?.promotion?.id || "").trim();
      if (!promoId) return;
      map[promoId] = (map[promoId] || 0) + 1;
    });
    return map;
  }, [products]);

  const filteredVouchers = useMemo(() => {
    const q = keyword.toLowerCase().trim();
    const list = Array.isArray(vouchers) ? vouchers : [];

    const rows = list.map((item) => {
      const status = getVoucherStatus(item, now);
      const appliedProducts = voucherUsageMap[item.km_id] || 0;
      const endDate = parseDate(item?.km_end_date);
      const remainingDays = endDate ? Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)) : null;

      return {
        ...item,
        status,
        appliedProducts,
        remainingDays,
      };
    });

    if (!q) return rows;

    return rows.filter((item) => (
      String(item?.km_id || "").toLowerCase().includes(q)
      || String(item?.km_name || "").toLowerCase().includes(q)
      || String(item?.km_description || "").toLowerCase().includes(q)
    ));
  }, [keyword, vouchers, voucherUsageMap, now]);

  const metrics = useMemo(() => {
    const total = filteredVouchers.length;
    const active = filteredVouchers.filter((v) => v.status === "active").length;
    const upcoming = filteredVouchers.filter((v) => v.status === "upcoming").length;
    const expired = filteredVouchers.filter((v) => v.status === "expired").length;
    const applied = filteredVouchers.filter((v) => Number(v.appliedProducts || 0) > 0).length;
    const avgDiscount = total > 0
      ? Math.round(filteredVouchers.reduce((s, v) => s + Number(v.km_percent || 0), 0) / total)
      : 0;
    const maxDiscount = total > 0
      ? Math.max(...filteredVouchers.map((v) => Number(v.km_percent || 0)))
      : 0;

    const expiringSoon = filteredVouchers.filter((v) => (
      v.status === "active"
      && typeof v.remainingDays === "number"
      && v.remainingDays >= 0
      && v.remainingDays <= 7
    )).length;

    return {
      total,
      active,
      upcoming,
      expired,
      applied,
      avgDiscount,
      maxDiscount,
      expiringSoon,
      appliedRate: total > 0 ? Math.round((applied / total) * 100) : 0,
    };
  }, [filteredVouchers]);

  const statusData = useMemo(() => ([
    { name: "Đang hoạt động", value: metrics.active },
    { name: "Sắp diễn ra", value: metrics.upcoming },
    { name: "Đã kết thúc", value: metrics.expired },
  ]), [metrics.active, metrics.upcoming, metrics.expired]);

  const discountBandData = useMemo(() => {
    const bands = {
      "1-10%": 0,
      "11-20%": 0,
      "21-30%": 0,
      ">30%": 0,
    };

    filteredVouchers.forEach((v) => {
      const p = Number(v.km_percent || 0);
      if (p <= 10) bands["1-10%"] += 1;
      else if (p <= 20) bands["11-20%"] += 1;
      else if (p <= 30) bands["21-30%"] += 1;
      else bands[">30%"] += 1;
    });

    return Object.entries(bands).map(([name, value]) => ({ name, value }));
  }, [filteredVouchers]);

  const topUsageRows = useMemo(() => {
    return [...filteredVouchers]
      .sort((a, b) => Number(b.appliedProducts || 0) - Number(a.appliedProducts || 0))
      .map((v, index) => ({
        rank: index + 1,
        id: v.km_id,
        name: v.km_name,
        percent: Number(v.km_percent || 0),
        status: v.status,
        appliedProducts: Number(v.appliedProducts || 0),
        remainingDays: v.remainingDays,
      }));
  }, [filteredVouchers]);

  const pagedTopUsageRows = useMemo(() => {
    const start = (detailPage - 1) * detailPageSize;
    return topUsageRows.slice(start, start + detailPageSize);
  }, [detailPage, topUsageRows, detailPageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(topUsageRows.length / detailPageSize));
    if (detailPage > totalPages) {
      setDetailPage(totalPages);
    }
  }, [detailPage, topUsageRows.length, detailPageSize]);

  const formatStatus = (status) => {
    if (status === "active") return "Đang hoạt động";
    if (status === "upcoming") return "Sắp diễn ra";
    if (status === "expired") return "Đã kết thúc";
    return "Không xác định";
  };

  const handleExportPDF = async () => {
    const reportElement = document.getElementById("voucher-statistics-pdf");
    if (!reportElement) return;

    setIsExportingPDF(true);
    try {
      const dataUrl = await toPng(reportElement, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let position = 0;
      let heightLeft = pdfHeight;

      pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`ThongKe_Voucher_${String(now.getMonth() + 1).padStart(2, "0")}_${now.getFullYear()}.pdf`);
    } catch (error) {
      console.error("Lỗi xuất PDF thống kê voucher:", error);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleExportExcel = async () => {
    const XLSX = await import("xlsx");
    const aoa = [
      ["STT", "Mã voucher", "Tên voucher", "% giảm", "Trạng thái", "Sản phẩm áp dụng", "Ngày còn lại"],
      ...topUsageRows.map((row) => [
        row.rank,
        row.id,
        row.name,
        row.percent,
        formatStatus(row.status),
        row.appliedProducts,
        typeof row.remainingDays === "number" ? row.remainingDays : "--",
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);
    worksheet["!cols"] = [
      { wch: 6 },
      { wch: 14 },
      { wch: 30 },
      { wch: 10 },
      { wch: 16 },
      { wch: 16 },
      { wch: 12 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ThongKeVoucher");
    XLSX.writeFile(
      workbook,
      `ThongKe_Voucher_${String(now.getMonth() + 1).padStart(2, "0")}_${now.getFullYear()}.xlsx`,
    );
  };

  return (
    <div id="voucher-statistics-pdf" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2 uppercase">Trung Tâm Thống Kê Voucher</h2>
          <div className="flex items-center gap-3 text-[13px] text-slate-500 font-medium">
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded border border-emerald-100">
              <Gift size={14} /> Phân Tích Khuyến Mãi
            </span>
            <span>Theo dõi hiệu suất voucher, trạng thái vòng đời và mức độ áp dụng sản phẩm.</span>
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsExportMenuOpen((s) => !s)}
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
                type="button"
                onClick={() => {
                  setIsExportMenuOpen(false);
                  handleExportPDF();
                }}
                disabled={isExportingPDF}
                className="w-full text-left px-4 py-[10px] text-[13px] font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2 disabled:opacity-60"
              >
                {isExportingPDF ? <Loader2 size={15} className="animate-spin text-slate-500" /> : <FileText size={15} className="text-slate-500" />}
                PDF (Giao diện Quản lý)
              </button>
              <div className="h-[1px] bg-slate-100 mx-2"></div>
              <button
                type="button"
                onClick={() => {
                  setIsExportMenuOpen(false);
                  handleExportExcel();
                }}
                className="w-full text-left px-4 py-[10px] text-[13px] font-medium text-slate-700 hover:bg-slate-100 flex items-center gap-2"
              >
                <Download size={15} className="text-slate-500" />
                Excel (Data Thô Xử Lý)
              </button>
            </div>
          )}

          {isExportMenuOpen && (
            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsExportMenuOpen(false)}></div>
          )}
        </div>
      </div>

      <div className="relative w-full lg:max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm mã, tên, mô tả voucher..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-blue-50 to-white">
          <p className="text-sm text-slate-500">Tổng Voucher</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{metrics.total}</p>
          <div className="mt-3 inline-flex w-10 h-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
            <Gift size={18} />
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-emerald-50 to-white">
          <p className="text-sm text-slate-500">Đang Hoạt Động</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{metrics.active}</p>
          <p className="text-xs text-slate-500 mt-2">Sắp hết hạn 7 ngày: {metrics.expiringSoon}</p>
          <div className="mt-3 inline-flex w-10 h-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
            <Clock3 size={18} />
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-amber-50 to-white">
          <p className="text-sm text-slate-500">Sắp Diễn Ra</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{metrics.upcoming}</p>
          <p className="text-xs text-slate-500 mt-2">Đã kết thúc: {metrics.expired}</p>
          <div className="mt-3 inline-flex w-10 h-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <CalendarClock size={18} />
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-fuchsia-50 to-white">
          <p className="text-sm text-slate-500">% Giảm Trung Bình</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{metrics.avgDiscount}%</p>
          <p className="text-xs text-slate-500 mt-2">Cao nhất: {metrics.maxDiscount}%</p>
          <div className="mt-3 inline-flex w-10 h-10 items-center justify-center rounded-xl bg-fuchsia-100 text-fuchsia-700">
            <Percent size={18} />
          </div>
        </div>

        <div className="border border-slate-200 rounded-2xl p-5 bg-gradient-to-br from-cyan-50 to-white">
          <p className="text-sm text-slate-500">Tỷ Lệ Áp Dụng</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{metrics.appliedRate}%</p>
          <p className="text-xs text-slate-500 mt-2">{metrics.applied}/{metrics.total} voucher có sản phẩm</p>
          <div className="mt-3 inline-flex w-10 h-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
            <BarChart3 size={18} />
          </div>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sky-700 text-sm flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          Đang đồng bộ dữ liệu voucher và sản phẩm...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-slate-200 rounded-2xl p-5 bg-white overflow-hidden flex flex-col">
          <h3 className="text-[14px] font-bold text-slate-800 mb-4 flex items-center gap-2">
            <PieChartIcon size={16} className="text-slate-600" /> Cơ Cấu Trạng Thái Voucher
          </h3>
          {statusData.some((d) => d.value > 0) ? (
            <div className="h-[320px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${shortName(name, 20)}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`status-${entry.name}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <NoData />
          )}
        </div>

        <div className="border border-slate-200 rounded-2xl p-5 bg-white overflow-hidden flex flex-col">
          <h3 className="text-[14px] font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-slate-600" /> Phân Bố Mức Giảm Giá
          </h3>
          {discountBandData.some((d) => d.value > 0) ? (
            <div className="h-[320px] flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={discountBandData} margin={{ top: 8, right: 12, left: 0, bottom: 12 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <NoData />
          )}
        </div>
      </div>

      <div className="border border-slate-200 rounded-2xl p-5 bg-white overflow-hidden flex flex-col">
        <h3 className="text-[14px] font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Gift size={16} className="text-slate-600" /> Top Voucher Theo Mức Độ Áp Dụng
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-center font-bold text-slate-700">STT</th>
                <th className="px-4 py-3 text-left font-bold text-slate-700">Mã Voucher</th>
                <th className="px-4 py-3 text-left font-bold text-slate-700">Tên Voucher</th>
                <th className="px-4 py-3 text-center font-bold text-slate-700">% Giảm</th>
                <th className="px-4 py-3 text-center font-bold text-slate-700">Trạng Thái</th>
                <th className="px-4 py-3 text-center font-bold text-slate-700">SP Áp Dụng</th>
                <th className="px-4 py-3 text-center font-bold text-slate-700">Ngày Còn Lại</th>
              </tr>
            </thead>
            <tbody>
              {topUsageRows.length > 0 ? (
                pagedTopUsageRows.map((row, index) => (
                  <tr key={row.id} className={`border-b border-slate-100 ${index % 2 === 0 ? "bg-white" : "bg-slate-50"}`}>
                    <td className="px-4 py-3 text-center text-slate-700 font-semibold">{row.rank}</td>
                    <td className="px-4 py-3 text-slate-700 font-mono">{row.id}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{shortName(row.name, 36)}</td>
                    <td className="px-4 py-3 text-center text-slate-700 font-semibold">{row.percent}%</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-1 rounded text-[12px] font-semibold ${
                        row.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : row.status === "upcoming"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-200 text-slate-700"
                      }`}>
                        {formatStatus(row.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-700">{row.appliedProducts}</td>
                    <td className="px-4 py-3 text-center text-slate-700">
                      {typeof row.remainingDays === "number" ? row.remainingDays : "--"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-6 text-center text-slate-400">Chưa có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {topUsageRows.length > 0 && (
          <TablePagination
            page={detailPage}
            totalItems={topUsageRows.length}
            pageSize={detailPageSize}
            onPageChange={setDetailPage}
            onPageSizeChange={(nextSize) => {
              setDetailPage(1);
              setDetailPageSize(nextSize);
            }}
          />
        )}
      </div>
    </div>
  );
}

function NoData() {
  return (
    <div className="h-full flex items-center justify-center text-[13px] font-medium text-slate-400 bg-slate-50 rounded border border-dashed border-slate-200">
      Chưa có dữ liệu
    </div>
  );
}
